import SingleSwimlane from "./SingleSwimlane.jsx";
import {createStore} from "./SwimlaneStore.js";
import {createEffect, createSignal, onMount} from "solid-js";
import {getEventOverview} from "../dataService/eventOverviewService.js";
import {parseEnvToBoolean} from "../utils/varCasting.js";

function Swimlane() {
    // Create the store
    const store = createStore()

    // Create signal to track swimlane heights
    const [maxHeight, setMaxHeight] = createSignal(0)
    const [swimlaneRefs, setSwimlanesRefs] = createSignal({})

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

    // Load data from backend on comp mount
    onMount(fetchData)

    return (
        <>
            <div class="flex justify-between space-x-4" style="height: calc(100vh - 120px);">
                {store.getState().length > 0
                    ? store.getState().map((laneData) => (
                        <>
                            {laneData.sections ? (
                                // Render parent swimlane with sections
                                <div key={laneData.id}
                                     ref={(el) => updateSwimlanesRef(laneData.id, el)}
                                     class="w-1/3 border border-gray-300 rounded-lg p-4 bg-gray-50"
                                     style={{
                                         minWidth: '30%', 
                                         height: maxHeight() > 0 ? `${maxHeight()}px` : '100%'
                                     }}>

                                    <div
                                        class="flex justify-center relative mb-8 p-4 rounded-xl shadow-2xl bg-gradient-to-br from-blue-50 to-white transform hover:scale-105 transition-transform duration-300 border border-gray-200">
                                        <h2 class="text-center font-bold text-gray-800">{laneData.name}</h2>
                                    </div>

                                    <div class="sections flex flex-col" style="height: calc(100% - 80px);">
                                        {laneData.sections.map((section) => (
                                            <div style="flex: 1; margin-bottom: 8px;">
                                                <SingleSwimlane 
                                                    key={section.id} 
                                                    {...section} 
                                                    store={store} 
                                                    updateParentRef={(ref) => updateSwimlanesRef(`${laneData.id}-${section.id}`, ref)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Render regular swimlane
                                <div 
                                    class="w-1/3" 
                                    ref={(el) => updateSwimlanesRef(laneData.id, el)}
                                    style={{
                                        minWidth: '30%', 
                                        height: maxHeight() > 0 ? `${maxHeight()}px` : '100%'
                                    }}>
                                    <SingleSwimlane 
                                        key={laneData.id} 
                                        {...laneData} 
                                        store={store} 
                                        updateParentRef={(ref) => updateSwimlanesRef(laneData.id, ref)}
                                    />
                                </div>
                            )}
                        </>
                    ))
                    : defaultSwimlanes.map((laneData) => (
                        <>
                            {laneData.sections ? (
                                <div key={laneData.id}
                                     ref={(el) => updateSwimlanesRef(laneData.id, el)}
                                     class="w-1/3 border border-gray-300 rounded-lg p-4 bg-gray-50"
                                     style={{
                                         minWidth: '30%', 
                                         height: maxHeight() > 0 ? `${maxHeight()}px` : '100%'
                                     }}>
                                    <div
                                        class="flex justify-center relative mb-8 p-4 rounded-xl shadow-2xl bg-gradient-to-br from-blue-50 to-white transform hover:scale-105 transition-transform duration-300 border border-gray-200">
                                        <h2 class="text-center font-bold text-gray-800">{laneData.name}</h2>
                                    </div>
                                    <div class="sections flex flex-col" style="height: calc(100% - 80px);">
                                        {laneData.sections.map((section) => (
                                            <div style="flex: 1; margin-bottom: 8px;">
                                                <SingleSwimlane 
                                                    key={section.id} 
                                                    {...section} 
                                                    store={store} 
                                                    updateParentRef={(ref) => updateSwimlanesRef(`${laneData.id}-${section.id}`, ref)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    class="w-1/3" 
                                    ref={(el) => updateSwimlanesRef(laneData.id, el)}
                                    style={{
                                        minWidth: '30%', 
                                        height: maxHeight() > 0 ? `${maxHeight()}px` : '100%'
                                    }}>
                                    <SingleSwimlane 
                                        key={laneData.id} 
                                        {...laneData} 
                                        store={store} 
                                        updateParentRef={(ref) => updateSwimlanesRef(laneData.id, ref)}
                                    />
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
