import SingleSwimlane from "./SingleSwimlane.jsx";
import {createStore} from "./SwimlaneStore.js";
import {createEffect, createSignal, onMount} from "solid-js";
import {getEventOverview} from "../dataService/eventOverviewService.js";
import {getEscalationLevelsDefinitions} from "../dataService/escalationLevelsDefinitionsService.js";
import {parseEnvToBoolean} from "../utils/varCasting.js";

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

    // Load data from backend on comp mount
    onMount(() => {
        fetchData();
        fetchTooltipData();
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
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
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
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
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
