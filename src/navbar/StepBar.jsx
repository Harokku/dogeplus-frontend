/**
 * Step Bar Navigation Component
 * 
 * This component displays a navigation bar with steps representing the configuration state.
 * It shows the current status of the configuration process and allows users to:
 * - See which configuration steps have been completed
 * - Navigate back to previous steps by clicking on them
 * 
 * The steps include:
 * - Username configuration (U)
 * - Central/Service configuration (S)
 * - Event number configuration (E)
 * 
 * Each step is colored based on its completion status and becomes clickable
 * to allow users to go back and change their configuration.
 */
import {configStore} from "../store/configStore.js";
import {createSignal, Show} from "solid-js";

/**
 * Renders a step bar navigation component showing the configuration progress.
 * 
 * @param {Object} props - Component props (not currently used)
 * @returns {JSX.Element} The step bar navigation UI
 */
function StepBar(props) {
    /**
     * Determines if event creation is enabled based on configuration state.
     * 
     * @returns {boolean} True if both username and central are configured, false otherwise
     */
    const creationEnabled = () => {
        const isUserSet = configStore.username.value !== null
        const isCentralSet = configStore.central.value !== null

        return isUserSet && isCentralSet
    }

    /**
     * Renders the step bar with three configuration steps.
     * Each step shows its current value and is colored based on completion status:
     * - step-warning: Completed step
     * - step-neutral: Incomplete step
     * - step-accent: Hover state
     */
    return (
        <div class={"relative z-10 mb-4 "}>
            <ul class="steps ">
                {/* Username configuration step */}
                <li class={`step  ${configStore.username.value !== null ? "step-warning" : "step-neutral"} cursor-pointer hover:step-accent `}
                    data-content="U"
                    onClick={() => configStore.username.set(null)}>
                    {configStore.username.value}
                </li>

                {/* Central/Service configuration step */}
                <li class={`step ${configStore.central.value !== null ? "step-warning" : "step-neutral"} cursor-pointer hover:step-accent`}
                    data-content="S"
                    onClick={() => configStore.central.set(null)}>
                    {configStore.central.value}
                </li>

                {/* Event number configuration step */}
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
