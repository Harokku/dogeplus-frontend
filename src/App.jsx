import './App.css'
import TaskList from "./itemlist/TaskList.jsx";
import {ErrorBoundary} from "solid-js";
import ConfigFlow from "./config/ConfigFlow.jsx";
import store from "./store/store.js";


function App() {

    return (
        <>
            <ConfigFlow />

            <br/><hr/>
            <pre>
                {JSON.stringify({
                    username: store.username.value,
                    central: store.central.value,
                    categories: store.categories.value,
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
