import {configStore} from "../store/configStore.js";
import {createSignal, Show} from "solid-js";

function StepBar(props) {
    const creationEnabled = () => {
        const isUserSet = configStore.username.value !== null
        const isCentralSet = configStore.central.value !== null

        return isUserSet && isCentralSet
    }

    return (
        <div class={"relative z-10 mb-4"}>
            <ul class="steps">
                <li class={"step " + (configStore.username.value !== null ? "step-info" : "")}
                    onClick={() => configStore.username.set(null)}>{configStore.username.value}</li>
                <li class={"step " + (configStore.central.value !== null ? "step-info" : "")}
                    onClick={() => configStore.central.set(null)}>{configStore.central.value}</li>
                <li class={"step " + (configStore.eventNr.value !== null ? "step-info" : "")}
                    onClick={() => configStore.eventNr.set(null)}>{configStore.eventNr.value}</li>
            </ul>
            {/*<Show when={creationEnabled()}>*/}
            {/*    <button class={"btn btn-info"} onClick={() => configStore.newEvent.set(true)}>Dichiara nuova Maxi*/}
            {/*    </button>*/}
            {/*</Show>*/}
        </div>
    )
}

export default StepBar;