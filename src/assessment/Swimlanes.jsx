import SingleSwimlane from "./SingleSwimlane.jsx";
import {createStore} from "./swimlanestore.js";

function Swimlane() {
    // Create the store
    const store = createStore()

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