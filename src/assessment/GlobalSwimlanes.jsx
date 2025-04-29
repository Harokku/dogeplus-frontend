// GlobalSwimlanes.jsx
import { createSignal, onMount, onCleanup } from "solid-js";
import { getEventOverview } from "../dataService/eventOverviewService.js";
import { parseEnvToBoolean } from "../utils/varCasting.js";
import Swimlane from "./Swimlanes.jsx";
import { assessmentCardBG } from "../theme/bg.js";
import "../theme/hideScrollBar.css"
import {getColor, getTextColor} from "../utils/colorsHelper.js";
import websocketService from "../ws/websocketService.js";

/**
 * Transforms the backend data by aggregating cards by central_id.
 * 
 * @param {Array} data - The original data from the backend
 * @returns {Object} An object with central_id as keys and arrays of swimlane data as values
 */
function aggregateDataByCentralId(data) {
    // Initialize result object with empty arrays for each central_id
    const result = {
        'SRA': [],
        'SRL': [],
        'SRM': [],
        'SRP': []
    };

    // Process each swimlane in the data
    data.forEach(swimlane => {
        // Process top-level cards
        if (swimlane.cards && swimlane.cards.length > 0) {
            swimlane.cards.forEach(card => {
                if (card.central_id && result[card.central_id]) {
                    // Create a copy of the swimlane for this central_id if it doesn't exist yet
                    const centralIdSwimlaneName = `${swimlane.name}`;

                    // Find or create the swimlane for this central_id
                    let centralIdSwimlane = result[card.central_id].find(lane => lane.name === centralIdSwimlaneName);
                    if (!centralIdSwimlane) {
                        centralIdSwimlane = {
                            id: swimlane.id,
                            name: centralIdSwimlaneName,
                            cards: []
                        };
                        result[card.central_id].push(centralIdSwimlane);
                    }

                    // Add the card to the swimlane
                    centralIdSwimlane.cards.push(card);
                }
            });
        }

        // Process sections if they exist
        if (swimlane.sections && swimlane.sections.length > 0) {
            swimlane.sections.forEach(section => {
                if (section.cards && section.cards.length > 0) {
                    section.cards.forEach(card => {
                        if (card.central_id && result[card.central_id]) {
                            // Create a copy of the section for this central_id if it doesn't exist yet
                            const centralIdSectionName = `${swimlane.name} - ${section.name}`;

                            // Find or create the swimlane for this central_id
                            let centralIdSwimlane = result[card.central_id].find(lane => lane.name === centralIdSectionName);
                            if (!centralIdSwimlane) {
                                centralIdSwimlane = {
                                    id: `${swimlane.id}-${section.id}`,
                                    name: centralIdSectionName,
                                    cards: [],
                                    swimlane: section.id // Store the original swimlane for color coding
                                };
                                result[card.central_id].push(centralIdSwimlane);
                            }

                            // Add the card to the swimlane
                            centralIdSwimlane.cards.push(card);
                        }
                    });
                }
            });
        }
    });

    return result;
}

/**
 * Transforms the backend data by organizing cards by swimlane type (allarme, emergenza, incidente).
 * For incidente, it aggregates all rossa, gialla, verde, and bianca sections.
 * 
 * @param {Array} data - The original data from the backend
 * @returns {Object} An object with swimlane types as keys and arrays of cards as values
 */
function organizeDataBySwimlaneType(data) {
    // Initialize result object with empty arrays for each swimlane type
    const result = {
        'allarme': [],
        'emergenza': [],
        'incidente': []
    };

    // First, aggregate data by central_id
    const aggregatedData = aggregateDataByCentralId(data);

    // Combine all central_id data
    const allCentralData = [
        ...aggregatedData['SRA'] || [],
        ...aggregatedData['SRL'] || [],
        ...aggregatedData['SRM'] || [],
        ...aggregatedData['SRP'] || []
    ];

    // Organize by swimlane type
    allCentralData.forEach(laneData => {
        const laneName = laneData.name.toLowerCase();

        // Determine which category this belongs to
        if (laneName.includes('allarme')) {
            result['allarme'].push({
                ...laneData,
                central_id: laneData.central_id || getCentralIdFromCards(laneData.cards)
            });
        } else if (laneName.includes('emergenza')) {
            result['emergenza'].push({
                ...laneData,
                central_id: laneData.central_id || getCentralIdFromCards(laneData.cards)
            });
        } else if (laneName.includes('incidente') || 
                  laneName.includes('rossa') || 
                  laneName.includes('gialla') || 
                  laneName.includes('verde') || 
                  laneName.includes('bianca')) {
            result['incidente'].push({
                ...laneData,
                central_id: laneData.central_id || getCentralIdFromCards(laneData.cards)
            });
        }
    });

    return result;
}

// Helper function to extract central_id from cards
function getCentralIdFromCards(cards) {
    if (cards && cards.length > 0 && cards[0].central_id) {
        return cards[0].central_id;
    }
    return '';
}

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
        cardToScrollTo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

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

    // Function to update the completion data for a specific event
    const updateEventCompletion = (eventNumber, completed, total) => {
        try {
            // Validate input parameters
            if (typeof eventNumber !== 'number' || typeof completed !== 'number' || typeof total !== 'number') {
                console.error("Invalid parameters for updateEventCompletion:", { eventNumber, completed, total });
                return;
            }

            // Helper function to update cards in a dataset
            const updateCardsInDataset = (dataset, setDatasetFn) => {
                if (!Array.isArray(dataset)) {
                    console.error("Dataset is not an array:", dataset);
                    return;
                }

                // Log the dataset structure to see what we're working with
                console.log("Dataset structure:", JSON.stringify(dataset, null, 2));

                let dataUpdated = false;

                try {
                    // Create a deep copy of the dataset
                    const updatedDataset = dataset.map(laneData => {
                        if (!laneData || !Array.isArray(laneData.cards)) {
                            return { ...laneData };
                        }

                        // Create a deep copy of the lane data
                        const updatedLaneData = { ...laneData };

                        // Update cards that match the event number
                        updatedLaneData.cards = laneData.cards.map(card => {
                            // Log the card to see its structure
                            console.log(`Processing card:`, card);

                            // Try different ways to extract the event number from card.event
                            let cardEventNumber = null;

                            // 1. If card.event is exactly the event number as a string
                            if (card && card.event && card.event === String(eventNumber)) {
                                cardEventNumber = eventNumber;
                                console.log(`Direct match: card.event "${card.event}" equals eventNumber "${eventNumber}"`);
                            } 
                            // 2. If card.event is a number as a string that can be parsed
                            else if (card && card.event && !isNaN(parseInt(card.event)) && parseInt(card.event) === eventNumber) {
                                cardEventNumber = parseInt(card.event);
                                console.log(`Parsed match: parseInt(card.event) "${parseInt(card.event)}" equals eventNumber "${eventNumber}"`);
                            }
                            // 3. If card.event is in the format "Event 123"
                            else if (card && card.event && typeof card.event === 'string') {
                                const match = card.event.match(/Event (\d+)/);
                                if (match && parseInt(match[1]) === eventNumber) {
                                    cardEventNumber = parseInt(match[1]);
                                    console.log(`Regex match: card.event "${card.event}" contains eventNumber "${eventNumber}"`);
                                }
                            }

                            if (cardEventNumber === eventNumber) {
                                dataUpdated = true;
                                console.log(`Found matching card for event ${eventNumber}:`, card.event);
                                // Create a deep copy of the card with updated completion data
                                return {
                                    ...card,
                                    completion: {
                                        completed: completed,
                                        total: total
                                    }
                                };
                            }
                            return { ...card };  // Always create a new object for each card
                        });

                        return updatedLaneData;
                    });

                    // Always update the state to ensure reactivity
                    setDatasetFn([...updatedDataset]);

                    if (dataUpdated) {
                        console.log(`Updated state for event ${eventNumber} with completion ${completed}/${total}`);
                    }
                } catch (error) {
                    console.error("Error updating cards in dataset:", error);
                }
            };

            // Update cards in all quadrants
            updateCardsInDataset(sraData(), setSraData);
            updateCardsInDataset(srlData(), setSrlData);
            updateCardsInDataset(srmData(), setSrmData);
            updateCardsInDataset(srpData(), setSrpData);

            if (completed === total) {
                console.log(`Event ${eventNumber} tasks completed: ${completed}/${total}`);
            } else {
                console.log(`Event ${eventNumber} tasks progress: ${completed}/${total}`);
            }
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
            {isLoading() ? (
                <div class="flex justify-center items-center h-full">
                    <span class="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <div class="grid grid-cols-2 grid-rows-2 gap-4 h-full">
                    {/* SRA Quadrant */}
                    <div class="border border-gray-300 rounded-lg p-2 overflow-auto">
                        <h2 class="text-xl font-bold mb-2 text-center">SRA</h2>
                        <div ref={el => sraRef = el} class="h-[calc(100%-2rem)] overflow-auto scrollbar-hidden">
                            <QuadrantSwimlane data={sraData()} title="SRA" />
                        </div>
                    </div>

                    {/* SRL Quadrant */}
                    <div class="border border-gray-300 rounded-lg p-2 overflow-auto">
                        <h2 class="text-xl font-bold mb-2 text-center">SRL</h2>
                        <div ref={el => srlRef = el} class="h-[calc(100%-2rem)] overflow-auto scrollbar-hidden">
                            <QuadrantSwimlane data={srlData()} title="SRL" />
                        </div>
                    </div>

                    {/* SRM Quadrant */}
                    <div class="border border-gray-300 rounded-lg p-2 overflow-auto">
                        <h2 class="text-xl font-bold mb-2 text-center">SRM</h2>
                        <div ref={el => srmRef = el} class="h-[calc(100%-2rem)] overflow-auto scrollbar-hidden">
                            <QuadrantSwimlane data={srmData()} title="SRM" />
                        </div>
                    </div>

                    {/* SRP Quadrant */}
                    <div class="border border-gray-300 rounded-lg p-2 overflow-auto">
                        <h2 class="text-xl font-bold mb-2 text-center">SRP</h2>
                        <div ref={el => srpRef = el} class="h-[calc(100%-2rem)] overflow-auto scrollbar-hidden">
                            <QuadrantSwimlane data={srpData()} title="SRP" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper component for rendering a swimlane within a quadrant
function QuadrantSwimlane({ data, title }) {
    return (
        <div class="h-full">
            {data.map(laneData => (
                <div class="mb-2">
                    <div class="border border-gray-300 rounded-lg p-1 bg-gray-50">
                        {/* Display central_id in the header for better identification */}
                        <h3 class="text-sm font-bold text-center">
                            {laneData.central_id ? `${laneData.central_id} - ` : ''}{laneData.name}
                        </h3>
                        <div class="mt-1">
                            {laneData.cards.map(card => {
                                // Calculate completion percentage
                                const percentage = card.completion ? 
                                    Math.round((card.completion.completed / card.completion.total) * 100) : 0;

                                // Determine swimlane for color
                                const swimlane = laneData.swimlane || 
                                    (laneData.name.toLowerCase().includes('allarme') ? 'allarme' : 
                                     laneData.name.toLowerCase().includes('emergenza') ? 'emergenza' : 
                                     laneData.name.toLowerCase().includes('rossa') ? 'rossa' :
                                     laneData.name.toLowerCase().includes('gialla') ? 'gialla' :
                                     laneData.name.toLowerCase().includes('verde') ? 'verde' : 'bianca');

                                // Get background color based on swimlane
                                const swimlaneKey = swimlane.toUpperCase();
                                const bgColor = assessmentCardBG[swimlaneKey] || assessmentCardBG.BIANCA;

                                return (
                                    <div class="card shadow-sm p-1 mb-1 rounded-lg text-xs transition-all duration-300 ease-in-out hover:scale-105"
                                         style={{
                                             "background-color": bgColor,
                                             "color": getTextColor(bgColor),
                                         }}>
                                        <div class="flex justify-between">
                                            <span class="font-semibold">{card.event}</span>
                                            <span class="text-xs">{card.central_id}</span>
                                        </div>
                                        <div class="truncate text-2xl capitalize text-center">{card.location} {card.location_detail ? `- ${card.location_detail}` : ''}</div>

                                        {/* Compact layout with type and completion in one line */}
                                        <div class="flex justify-between items-center">
                                            <span class="text-xl bold flex-1 text-center">{card.type}</span>

                                            {/* Task completion percentage */}
                                            {card.completion && (
                                                <span class="text-xs">{percentage}%</span>
                                            )}
                                        </div>

                                        {/* Task completion progress bar */}
                                        {card.completion && (
                                            <div class="h-3 w-full bg-gray-300 rounded-full overflow-hidden mt-1">
                                                <div
                                                    class="h-3 rounded-full"
                                                    style={{
                                                        "width": `${percentage}%`,
                                                        "background-color": getColor(percentage),
                                                    }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default GlobalSwimlanes;
