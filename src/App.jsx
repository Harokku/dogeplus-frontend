import './App.css'
import TaskList from "./itemlist/TaskList.jsx";
import {ErrorBoundary} from "solid-js";
import ConfigFlow from "./config/ConfigFlow.jsx";
import {configStore} from "./store/configStore.js";
import NotificationContainer from "./NotificationContainer.jsx";


function App() {

    return (
        <>
            <NotificationContainer/>
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
        </>
    )
}

export default App
