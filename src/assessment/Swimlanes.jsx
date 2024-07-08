import SingleSwimlane from "./SingleSwimlane.jsx";
import {createStore} from "./swimlanestore.js";
import {onMount} from "solid-js";
import {getEventOverview} from "../dataService/eventOverviewService.js";
import {parseEnvToBoolean} from "../utils/varCasting.js";

function Swimlane() {
    // Create the store
    const store = createStore()

    /**
     * Fetches data from the server and initializes the store.
     * @returns {Promise<void>} - A promise that resolves when the data has been fetched and the store has been initialized.
     */
    const fetchData = async () =>{
        const response = await getEventOverview(parseEnvToBoolean(import.meta.env.VITE_MOCK) || false)
        if (response.result) {
            store.initializeStore(response.data.data)
        }
    }

    // Load data from backend on comp mount
    onMount(fetchData)

    return (
        <>
            <div class="flex  justify-between">
                {store.getState().map(laneData => (
                    <SingleSwimlane key={laneData.id} {...laneData} store={store}/>
                ))}
            </div>
        </>
    );
}

export default Swimlane;