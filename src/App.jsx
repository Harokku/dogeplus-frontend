import './App.css'
import ConfigFlow from "./config/ConfigFlow.jsx";
import {configStore} from "./store/configStore.js";
import NotificationContainer from "./NotificationContainer.jsx";
import StepBar from "./navbar/StepBar.jsx";
import Swimlanes from "./assessment/Swimlanes.jsx";


function App() {

    return (
        <>
            <Swimlanes/>
            <br/>
            <hr/>

            <NotificationContainer/>
            <StepBar/>
            <hr/>
            <ConfigFlow/>

            {/*<pre>*/}
            {/*    {JSON.stringify({*/}
            {/*        username: configStore.username.value,*/}
            {/*        central: configStore.central.value,*/}
            {/*        eventNr: configStore.eventNr.value,*/}
            {/*        categories: configStore.categories.value,*/}
            {/*    },null, 1)}*/}
            {/*</pre>*/}
        </>
    )
}

export default App
