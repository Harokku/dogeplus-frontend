// GlobalSwimlanes.jsx
import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { getEventOverview } from "../dataService/eventOverviewService.js";
import { parseEnvToBoolean } from "../utils/varCasting.js";
import "../theme/hideScrollBar.css"
import websocketService from "../ws/websocketService.js";

// Import components from their dedicated files
import TaskProgressBar from "./globalSwimlanes/TaskProgressBar.jsx";
import EventCard from "./globalSwimlanes/EventCard.jsx";
import QuadrantSwimlane from "./globalSwimlanes/QuadrantSwimlane.jsx";

// Import utility functions
import { 
    aggregateDataByCentralId, 
    getCentralIdFromCards, 
    getCardEventNumber 
} from "./globalSwimlanes/utils.js";

function GlobalSwimlanes(props) {
    // Default scroll interval is 5 seconds if not provided
    const scrollInterval = props.scrollInterval || 5;

    const [sraData, setSraData] = createSignal([]);
    const [srlData, setSrlData] = createSignal([]);
    const [srmData, setSrmData] = createSignal([]);
    const [srpData, setSrpData] = createSignal([]);
    const [isLoading, setIsLoading] = createSignal(true);

    // State to track the current scroll position for each quadrant
    const [sraScrollIndex, setSraScrollIndex] = createSignal(0);
    const [srlScrollIndex, setSrlScrollIndex] = createSignal(0);
    const [srmScrollIndex, setSrmScrollIndex] = createSignal(0);
    const [srpScrollIndex, setSrpScrollIndex] = createSignal(0);

    // Refs for the quadrant containers
    let sraRef;
    let srlRef;
    let srmRef;
    let srpRef;

    // Fetch data from the backend
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await getEventOverview(parseEnvToBoolean(import.meta.env.VITE_MOCK) || false);
            if (response.result && response.data && response.data.data && response.data.data.length > 0) {
                // Process the data
                const allData = response.data.data;

                // Transform the data to aggregate by central_id
                const aggregatedData = aggregateDataByCentralId(allData);

                // Set the data for each central_id
                setSraData(aggregatedData['SRA'] || []);
                setSrlData(aggregatedData['SRL'] || []);
                setSrmData(aggregatedData['SRM'] || []);
                setSrpData(aggregatedData['SRP'] || []);
            } else {
                // No data returned, set empty arrays for all quadrants
                setSraData([]);
                setSrlData([]);
                setSrmData([]);
                setSrpData([]);
            }
        } catch (err) {
            // Set empty arrays for all quadrants even in case of error
            setSraData([]);
            setSrlData([]);
            setSrmData([]);
            setSrpData([]);
            // Still log the error for debugging purposes
            console.error("Error fetching data:", err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to scroll to the next card in a quadrant
    const scrollToNextCard = (quadrantRef, currentIndex, totalCards, setIndexFn) => {
        if (!quadrantRef || totalCards === 0) return;

        // Get all cards in the quadrant
        const cards = quadrantRef.querySelectorAll('.card');
        if (cards.length === 0) return;

        // Find the first non-visible card
        const quadrantRect = quadrantRef.getBoundingClientRect();
        let nextVisibleIndex = -1;

        // Start checking from the card after the current one
        for (let i = 0; i < cards.length; i++) {
            // Calculate the index to check, starting from the next card after current
            const indexToCheck = (currentIndex + 1 + i) % totalCards;
            const card = cards[indexToCheck];
            const cardRect = card.getBoundingClientRect();

            // Check if the card is below the visible area or only partially visible
            // We consider a card non-visible if its top edge is below the bottom of the viewport
            // or if less than 50% of the card is visible
            const cardVisibleHeight = Math.min(cardRect.bottom, quadrantRect.bottom) - Math.max(cardRect.top, quadrantRect.top);
            const isCardFullyVisible = cardVisibleHeight > cardRect.height * 0.5;

            if (!isCardFullyVisible) {
                nextVisibleIndex = indexToCheck;
                break;
            }
        }

        // If we couldn't find a non-visible card, just go to the next one
        if (nextVisibleIndex === -1) {
            nextVisibleIndex = (currentIndex + 1) % totalCards;
        }

        // Get the card to scroll to
        const cardToScrollTo = cards[nextVisibleIndex];
        if (!cardToScrollTo) return;

        // Scroll to the card with a smooth animation
        cardToScrollTo.scrollIntoView({behavior: 'smooth', block: 'nearest'});

        // Update the index
        setIndexFn(nextVisibleIndex);
    };

    // Function to synchronize scrolling across all quadrants
    const syncScroll = () => {
        // Get the total number of cards in each quadrant
        const sraCards = sraRef?.querySelectorAll('.card')?.length || 0;
        const srlCards = srlRef?.querySelectorAll('.card')?.length || 0;
        const srmCards = srmRef?.querySelectorAll('.card')?.length || 0;
        const srpCards = srpRef?.querySelectorAll('.card')?.length || 0;

        // Scroll each quadrant to the next card
        scrollToNextCard(sraRef, sraScrollIndex(), sraCards, setSraScrollIndex);
        scrollToNextCard(srlRef, srlScrollIndex(), srlCards, setSrlScrollIndex);
        scrollToNextCard(srmRef, srmScrollIndex(), srmCards, setSrmScrollIndex);
        scrollToNextCard(srpRef, srpScrollIndex(), srpCards, setSrpScrollIndex);
    };

    // Handler for task_completion_map_update messages
    const handleTaskCompletionMapUpdate = (data) => {
        try {
            // Log the entire WebSocket message
            console.log("Received task_completion_map_update:", JSON.stringify(data, null, 2));

            // Check if this is a specific event update or a full map update
            if (data.data && data.data.event_number) {
                // This is a specific event update
                const eventNumber = data.data.event_number;
                const completed = data.data.info.Completed;
                const total = data.data.info.Total;

                console.log(`Processing event update: Event ${eventNumber}, Completion: ${completed}/${total}`);

                // Update the completion data for this event in all quadrants
                updateEventCompletion(eventNumber, completed, total);
            } else if (data.data) {
                // This is a full map update
                // Iterate through all events in the data and update their completion
                for (const [eventNumber, info] of Object.entries(data.data)) {
                    if (info && typeof info.Completed !== 'undefined' && typeof info.Total !== 'undefined') {
                        updateEventCompletion(parseInt(eventNumber), info.Completed, info.Total);
                    }
                }
            }
        } catch (error) {
            console.error("Error handling task completion map update:", error);
        }
    };

    // Handler for event_updates messages
    const handleEventUpdates = (data) => {
        try {
            // Validate that we received a proper event update
            if (data && data.message === "Overview added successfully") {
                console.log("Received event update:", data.data);
                // If we receive an event update, refresh the data to get the latest state
                fetchData();
            }
        } catch (error) {
            console.error("Error handling event update:", error);
        }
    };

    // Modified updateEventCompletion function
    const updateEventCompletion = (eventNumber, completed, total) => {
        try {
            if (typeof eventNumber !== 'number' || typeof completed !== 'number' || typeof total !== 'number') {
                console.error("Invalid parameters for updateEventCompletion:", {eventNumber, completed, total});
                return;
            }

            const updateDataset = (dataset, setDataset) => {
                const newData = dataset.map(lane => ({
                    ...lane,
                    cards: lane.cards.map(card => {
                        const cardEventNumber = getCardEventNumber(card, eventNumber);
                        if (cardEventNumber === eventNumber) {
                            return {
                                ...card,
                                completion: { completed, total }
                            };
                        }
                        return card;
                    })
                }));

                // Force a new reference
                setDataset([...newData]);
            };

            // Update all datasets
            updateDataset(sraData(), setSraData);
            updateDataset(srlData(), setSrlData);
            updateDataset(srmData(), setSrmData);
            updateDataset(srpData(), setSrpData);

        } catch (error) {
            console.error("Error in updateEventCompletion:", error);
        }
    };


    onMount(() => {
        fetchData();

        // Variable to store the interval ID
        let intervalId;
        // Variables to store unsubscribe functions
        let taskCompletionUnsubscribe = null;
        let eventUpdatesUnsubscribe = null;

        // Function to set up WebSocket subscriptions
        const setupWebSocketSubscriptions = () => {
            try {
                // Connect to WebSocket if not already connected
                if (websocketService.getState() !== websocketService.WS_STATES.CONNECTED) {
                    websocketService.connect();
                }

                // Wait a short time to ensure connection is established
                setTimeout(() => {
                    try {
                        // Check if connection is established
                        if (websocketService.getState() === websocketService.WS_STATES.CONNECTED) {
                            console.log("WebSocket connected, subscribing to topics...");

                            // Subscribe to the required topics
                            taskCompletionUnsubscribe = websocketService.subscribe('task_completion_map_update', handleTaskCompletionMapUpdate);
                            eventUpdatesUnsubscribe = websocketService.subscribe('event_updates', handleEventUpdates);

                            console.log("Subscribed to WebSocket topics: task_completion_map_update, event_updates");
                        } else {
                            console.warn("WebSocket not connected, retrying in 2 seconds...");
                            // Retry after 2 seconds
                            setTimeout(setupWebSocketSubscriptions, 2000);
                        }
                    } catch (error) {
                        console.error("Error subscribing to WebSocket topics:", error);
                    }
                }, 500);
            } catch (error) {
                console.error("Error setting up WebSocket connection:", error);
            }
        };

        // Set up WebSocket subscriptions
        setupWebSocketSubscriptions();

        // Trigger the first scroll after the first interval (5 seconds)
        const initialScrollTimeout = setTimeout(() => {
            syncScroll();

            // Set up the interval for subsequent scrolls
            intervalId = setInterval(() => {
                syncScroll();
            }, scrollInterval * 1000);
        }, scrollInterval * 1000);

        // Clean up the timeout and interval when the component unmounts
        onCleanup(() => {
            clearTimeout(initialScrollTimeout);
            if (intervalId) clearInterval(intervalId);

            // Unsubscribe from WebSocket topics
            if (taskCompletionUnsubscribe) {
                try {
                    taskCompletionUnsubscribe();
                    console.log("Unsubscribed from task_completion_map_update");
                } catch (error) {
                    console.error("Error unsubscribing from task_completion_map_update:", error);
                }
            }

            if (eventUpdatesUnsubscribe) {
                try {
                    eventUpdatesUnsubscribe();
                    console.log("Unsubscribed from event_updates");
                } catch (error) {
                    console.error("Error unsubscribing from event_updates:", error);
                }
            }
        });
    });

    return (
        <div class="h-[85vh] overflow-hidden">
            <Show when={!isLoading()}
                  fallback={
                      <div class="flex justify-center items-center h-full">
                          <span class="loading loading-spinner loading-lg"></span>
                      </div>
                  }>
                <div class="grid grid-cols-2 grid-rows-2 gap-4 h-full">
                    {/* SRA Quadrant */}
                    <div class="border border-gray-300 rounded-lg p-2 overflow-auto">
                        <h2 class="text-xl font-bold mb-2 text-center">SRA</h2>
                        <div ref={el => sraRef = el} class="h-[calc(100%-2rem)] overflow-auto scrollbar-hidden">
                            <QuadrantSwimlane data={sraData()} />
                        </div>
                    </div>

                    {/* SRL Quadrant */}
                    <div class="border border-gray-300 rounded-lg p-2 overflow-auto">
                        <h2 class="text-xl font-bold mb-2 text-center">SRL</h2>
                        <div ref={el => srlRef = el} class="h-[calc(100%-2rem)] overflow-auto scrollbar-hidden">
                            <QuadrantSwimlane data={srlData()} />
                        </div>
                    </div>

                    {/* SRM Quadrant */}
                    <div class="border border-gray-300 rounded-lg p-2 overflow-auto">
                        <h2 class="text-xl font-bold mb-2 text-center">SRM</h2>
                        <div ref={el => srmRef = el} class="h-[calc(100%-2rem)] overflow-auto scrollbar-hidden">
                            <QuadrantSwimlane data={srmData()} />
                        </div>
                    </div>

                    {/* SRP Quadrant */}
                    <div class="border border-gray-300 rounded-lg p-2 overflow-auto">
                        <h2 class="text-xl font-bold mb-2 text-center">SRP</h2>
                        <div ref={el => srpRef = el} class="h-[calc(100%-2rem)] overflow-auto scrollbar-hidden">
                            <QuadrantSwimlane data={srpData()} />
                        </div>
                    </div>
                </div>
            </Show>
        </div>
    );
}


export default GlobalSwimlanes;
