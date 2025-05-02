import SingleSwimlane from "./SingleSwimlane.jsx";
import {createStore} from "./SwimlaneStore.js";
import {createEffect, createSignal, onMount, onCleanup} from "solid-js";
import {getEventOverview} from "../dataService/eventOverviewService.js";
import {getEscalationLevelsDefinitions} from "../dataService/escalationLevelsDefinitionsService.js";
import {parseEnvToBoolean} from "../utils/varCasting.js";
import websocketService from "../ws/websocketService.js";
import {configStore} from "../store/configStore.js";

function Swimlane() {
    // Create the store
    const store = createStore()

    // Create signal to track swimlane heights
    const [maxHeight, setMaxHeight] = createSignal(0)
    const [swimlaneRefs, setSwimlanesRefs] = createSignal({})

    // Create signals for tooltip data
    const [tooltipData, setTooltipData] = createSignal({})
    const [fetchError, setFetchError] = createSignal(false)

    // Function to update swimlane reference
    const updateSwimlanesRef = (id, ref) => {
        setSwimlanesRefs(prev => ({...prev, [id]: ref}))
    }

    // Effect to synchronize heights
    createEffect(() => {
        const refs = swimlaneRefs()
        if (Object.keys(refs).length > 0) {
            // Find the maximum height among all swimlanes
            let maxH = 0
            Object.values(refs).forEach(ref => {
                if (ref && ref.scrollHeight > maxH) {
                    maxH = ref.scrollHeight
                }
            })
            setMaxHeight(maxH > 0 ? maxH : 0)
        }
    })

    // Define default empty swimlanes
    const defaultSwimlanes = [
        {id: '1', name: 'Allarme', cards: []},
        {id: '2', name: 'Emergenza', cards: []},
        {
            id: '3', name: 'Incidente', cards: [],
            sections: [
                {id: 'rossa', name: 'Rossa', cards: []},
                {id: 'gialla', name: 'Gialla', cards: []},
                {id: 'verde', name: 'Verde', cards: []},
                {id: 'bianca', name: 'Bianca', cards: []}
            ]
        }
    ];

    /**
     * Fetches data from the server and initializes the store.
     * @returns {Promise<void>} - A promise that resolves when the data has been fetched and the store has been initialized.
     */
    const fetchData = async () => {
        const response = await getEventOverview(parseEnvToBoolean(import.meta.env.VITE_MOCK) || false)
        if (response.result) {
            store.initializeStore(response.data.data)
        }
    }

    // Fetch tooltip data from backend
    const fetchTooltipData = async () => {
        // Skip if we already have data
        if (Object.keys(tooltipData()).length > 0) return;

        const response = await getEscalationLevelsDefinitions(parseEnvToBoolean(import.meta.env.VITE_MOCK) || false);
        if (response.result) {
            // Convert array to object with name as key for easier lookup
            const tooltips = {};
            response.data.data.forEach(item => {
                tooltips[item.name] = item.description;
            });
            setTooltipData(tooltips);
        } else {
            setFetchError(true);
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

                // Update the completion data for this event
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

    // Function to update event completion data
    const updateEventCompletion = (eventNumber, completed, total) => {
        try {
            if (typeof eventNumber !== 'number' || typeof completed !== 'number' || typeof total !== 'number') {
                console.error("Invalid parameters for updateEventCompletion:", {eventNumber, completed, total});
                return;
            }

            // Update the store with the new completion data
            store.updateEventCompletion(eventNumber, completed, total);
        } catch (error) {
            console.error("Error in updateEventCompletion:", error);
        }
    };

    // Load data from backend on comp mount
    onMount(() => {
        fetchData();
        fetchTooltipData();

        // Variables to store unsubscribe functions
        let centralTopicUnsubscribe = null;
        let taskCompletionUnsubscribe = null;
        let eventUpdateUnsubscribe = null;

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

                            // Get the central ID from the store
                            const centralId = configStore.central.value;

                            if (centralId) {
                                // Subscribe to the central-specific topic
                                const centralTopic = `central_${centralId}`;
                                centralTopicUnsubscribe = websocketService.subscribe(centralTopic, handleEventUpdates);
                                console.log(`Subscribed to WebSocket topic: ${centralTopic}`);
                            } else {
                                console.warn("No central ID found in store, cannot subscribe to central-specific topic");
                            }

                            // Subscribe to the task completion map update topic
                            taskCompletionUnsubscribe = websocketService.subscribe('task_completion_map_update', handleTaskCompletionMapUpdate);
                            console.log("Subscribed to WebSocket topic: task_completion_map_update");

                            // Subscribe to the event update topic
                            eventUpdateUnsubscribe = websocketService.subscribe('event_updates', handleEventUpdates);
                            console.log("Subscribed to WebSocket topic: event_update channel");
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

        // Clean up WebSocket subscriptions when the component unmounts
        onCleanup(() => {
            // Unsubscribe from WebSocket topics
            if (centralTopicUnsubscribe) {
                try {
                    centralTopicUnsubscribe();
                    console.log("Unsubscribed from central-specific topic");
                } catch (error) {
                    console.error("Error unsubscribing from central-specific topic:", error);
                }
            }

            if (taskCompletionUnsubscribe) {
                try {
                    taskCompletionUnsubscribe();
                    console.log("Unsubscribed from task_completion_map_update");
                } catch (error) {
                    console.error("Error unsubscribing from task_completion_map_update:", error);
                }
            }

            if (eventUpdateUnsubscribe) {
                try {
                    eventUpdateUnsubscribe();
                    console.log("Unsubscribed from event_update_unsubscribe:");
                } catch (error) {
                    console.error("Error unsubscribing from event_update_unsubscribe:", error);
                }
            }
        });
    });

    return (
        <>
            <div class="flex justify-between space-x-4 h-[85vh] overflow-hidden">
                {store.getState().length > 0
                    ? store.getState().map((laneData) => (
                        <>
                            {laneData.sections ? (
                                // Render parent swimlane with sections
                                <div key={laneData.id}
                                     ref={(el) => updateSwimlanesRef(laneData.id, el)}
                                     class="w-1/3 min-w-[30%] border border-gray-300 rounded-lg p-4 bg-gray-50 h-full flex flex-col">

                                    <div
                                        class="flex justify-center relative p-4 rounded-xl shadow-2xl bg-gradient-to-br from-blue-50 to-white transform hover:scale-105 transition-transform duration-300 border border-gray-200 sticky top-0 z-10">
                                        <h2 class="text-center font-bold text-gray-800">{laneData.name}</h2>

                                        {/* Swimlane info tooltip */}
                                        <div onMouseEnter={fetchTooltipData}
                                             class="absolute right-0 mr-2 h-6 w-6 cursor-help tooltip tooltip-left tooltip-info"
                                             data-tip={tooltipData() && tooltipData()[laneData.name] ? tooltipData()[laneData.name] : ''}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 stroke-width="2.5"
                                                 stroke="currentColor" class="h-6 w-6">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"/>
                                            </svg>
                                        </div>
                                    </div>

                                    <div class="sections flex flex-col mt-4 overflow-y-auto flex-1">
                                        {laneData.sections.map((section) => (
                                            <div class="flex-1 mb-2">
                                                <SingleSwimlane
                                                    key={section.id}
                                                    {...section}
                                                    store={store}
                                                    updateParentRef={(ref) => updateSwimlanesRef(`${laneData.id}-${section.id}`, ref)}
                                                    tooltipData={tooltipData()}
                                                    fetchTooltipData={fetchTooltipData}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Render regular swimlane
                                <div
                                    class="w-1/3 min-w-[30%] h-full flex flex-col"
                                    ref={(el) => updateSwimlanesRef(laneData.id, el)}>
                                    <div class="flex-1 overflow-y-auto">
                                        <SingleSwimlane
                                            key={laneData.id}
                                            {...laneData}
                                            store={store}
                                            updateParentRef={(ref) => updateSwimlanesRef(laneData.id, ref)}
                                            tooltipData={tooltipData()}
                                            fetchTooltipData={fetchTooltipData}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    ))
                    : defaultSwimlanes.map((laneData) => (
                        <>
                            {laneData.sections ? (
                                <div key={laneData.id}
                                     ref={(el) => updateSwimlanesRef(laneData.id, el)}
                                     class="w-1/3 min-w-[30%] border border-gray-300 rounded-lg p-4 bg-gray-50 h-full flex flex-col">
                                    <div
                                        class="flex justify-center relative p-4 rounded-xl shadow-2xl bg-gradient-to-br from-blue-50 to-white transform hover:scale-105 transition-transform duration-300 border border-gray-200 sticky top-0 z-10">
                                        <h2 class="text-center font-bold text-gray-800">{laneData.name}</h2>

                                        {/* Swimlane info tooltip */}
                                        <div onMouseEnter={fetchTooltipData}
                                             class="absolute right-0 mr-2 h-6 w-6 cursor-help tooltip tooltip-left tooltip-info"
                                             data-tip={tooltipData() && tooltipData()[laneData.name] ? tooltipData()[laneData.name] : ''}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 stroke-width="2.5"
                                                 stroke="currentColor" class="h-6 w-6">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="sections flex flex-col mt-4 overflow-y-auto flex-1">
                                        {laneData.sections.map((section) => (
                                            <div class="flex-1 mb-2">
                                                <SingleSwimlane
                                                    key={section.id}
                                                    {...section}
                                                    store={store}
                                                    updateParentRef={(ref) => updateSwimlanesRef(`${laneData.id}-${section.id}`, ref)}
                                                    tooltipData={tooltipData()}
                                                    fetchTooltipData={fetchTooltipData}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    class="w-1/3 min-w-[30%] h-full flex flex-col"
                                    ref={(el) => updateSwimlanesRef(laneData.id, el)}>
                                    <div class="flex-1 overflow-y-auto">
                                        <SingleSwimlane
                                            key={laneData.id}
                                            {...laneData}
                                            store={store}
                                            updateParentRef={(ref) => updateSwimlanesRef(laneData.id, ref)}
                                            tooltipData={tooltipData()}
                                            fetchTooltipData={fetchTooltipData}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    ))
                }
            </div>
        </>
    );
}

export default Swimlane;
