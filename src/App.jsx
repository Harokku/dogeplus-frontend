import './App.css'
import TaskList from "./itemlist/TaskList.jsx";
import {ErrorBoundary} from "solid-js";
import ConfigFlow from "./config/ConfigFlow.jsx";
import {configStore} from "./store/configStore.js";


function App() {

    return (
        <>
            <ConfigFlow />

            <br/><hr/>
            <pre>
                {JSON.stringify({
                    username: configStore.username.value,
                    central: configStore.central.value,
                    eventNr: configStore.eventNr.value,
                    categories: configStore.categories.value,
                },null, 1)}
            </pre>

            {/*<ErrorBoundary fallback={err => <p>Error fetching: {err.message}</p>}>*/}
            {/*    <TaskList/>*/}
            {/*</ErrorBoundary>*/}

            {/*<button class="btn" onClick={() =>*/}
            {/*    setStore(task => task.id === 3, {operator: "Him!", isDone: 2, assignedTo: "Flotta"})}*/}
            {/*>Update 3rd*/}
            {/*</button>*/}

        </>
    )
}

export default App
