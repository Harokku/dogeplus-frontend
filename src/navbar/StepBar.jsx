import {configStore} from "../store/configStore.js";
import {createSignal, Show} from "solid-js";

function StepBar(props) {
    const creationEnabled = () => {
        const isUserSet = configStore.username.value !== null
        const isCentralSet = configStore.central.value !== null

        return isUserSet && isCentralSet
    }

    return (
        <div class={"relative z-10 mb-4 "}>
            <ul class="steps ">
                <li class={`step  ${configStore.username.value !== null ? "step-warning" : "step-neutral"} cursor-pointer hover:step-accent `}
                    data-content="U"
                    onClick={() => configStore.username.set(null)}>
                    {configStore.username.value}
                </li>
                <li class={`step ${configStore.central.value !== null ? "step-warning" : "step-neutral"} cursor-pointer hover:step-accent`}
                    data-content="S"
                    onClick={() => configStore.central.set(null)}>
                    {configStore.central.value}
                </li>
                <li class={`step  ${configStore.eventNr.value !== null ? "step-warning" : "step-neutral"} cursor-pointer hover:step-accent`}
                    data-content="E"
                    onClick={() => configStore.eventNr.set(null)}>
                    {configStore.eventNr.value}
                </li>
            </ul>
        </div>
    )
}

export default StepBar;