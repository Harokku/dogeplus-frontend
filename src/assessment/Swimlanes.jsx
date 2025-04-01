import SingleSwimlane from "./SingleSwimlane.jsx";
import {createStore} from "./SwimlaneStore.js";
import {onMount} from "solid-js";
import {getEventOverview} from "../dataService/eventOverviewService.js";
import {parseEnvToBoolean} from "../utils/varCasting.js";

function Swimlane() {
    // Create the store
    const store = createStore()

    // Define default empty swimlanes
    const defaultSwimlanes = [
        {id: '1', name: 'Allarme', cards: []},
        {id: '2', name: 'Emergenza', cards: []},
        {id: '3', name: 'Incidente', cards: [],
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
            {console.info(store.getState())}
            {/*FIXME: Delete after testing*/}
            {/*<div class="flex justify-between">*/}
            {/*    {store.getState().length > 0*/}
            {/*        ? store.getState().map(laneData => (*/}
            {/*            <>*/}
            {/*                <SingleSwimlane key={laneData.id} {...laneData} store={store}/>*/}
            {/*            </>*/}
            {/*        ))*/}
            {/*        : defaultSwimlanes.map(laneData => (*/}
            {/*            <SingleSwimlane key={laneData.id} {...laneData} store={store}/>*/}
            {/*        ))*/}
            {/*    }*/}
            {/*</div>*/}
            <div class="flex justify-between">
                {store.getState().length > 0
                    ? store.getState().map((laneData) => (
                        <>
                            {laneData.sections ? (
                                // Render parent swimlane with sections
                                <div key={laneData.id} class="w-full border border-gray-300 rounded-lg mx-2 p-4 bg-gray-50">

                                    <div class="flex justify-center relative mb-8 p-4 rounded-xl shadow-2xl bg-gradient-to-br from-blue-50 to-white transform hover:scale-105 transition-transform duration-300 border border-gray-200">
                                    <h2 class="text-center font-bold text-gray-800">{laneData.name}</h2>
                                    </div>

                                    <div class="sections">
                                        {laneData.sections.map((section) => (
                                            <SingleSwimlane key={section.id} {...section} store={store} />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Render regular swimlane
                                <SingleSwimlane key={laneData.id} {...laneData} store={store} />
                            )}
                        </>
                    ))
                    : defaultSwimlanes.map((laneData) => (
                        <>
                            {laneData.sections ? (
                                <div key={laneData.id} class="parent-swimlane">
                                    <h2>{laneData.name}</h2>
                                    <div class="sections">
                                        {laneData.sections.map((section) => (
                                            <SingleSwimlane key={section.id} {...section} store={store} />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <SingleSwimlane key={laneData.id} {...laneData} store={store} />
                            )}
                        </>
                    ))
                }
            </div>
        </>
    );
}

export default Swimlane;
