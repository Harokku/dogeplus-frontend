/**
 * Configuration Flow Component
 * 
 * This component manages the application's configuration flow by conditionally
 * rendering different components based on the current configuration step.
 * 
 * The flow follows this sequence:
 * 1. Username Input - User enters their username
 * 2. Central ID Input - User selects their central/service
 * 3. Categories Input (for new events) OR Event Number Input (for existing events)
 * 4. Task List (for event details) OR Swimlanes (for assessment view)
 * 
 * The component uses the configStore to determine the current step and
 * renders the appropriate component accordingly.
 */
import UsernameInput from "./UsernameInput";
import CentralIdInput from "./CentralIdInput";
import {configStep, configStore} from "../store/configStore.js";
import EventNrInput from "./EventNrInput.jsx";
import TaskList from "../itemlist/TaskList.jsx";
import CategoriesInput from "./CategoriesInput.jsx";
import Swimlanes from "../assessment/Swimlanes.jsx";
import GlobalSwimlanes from "../assessment/GlobalSwimlanes.jsx";

/**
 * Renders the appropriate component based on the current configuration step.
 * 
 * @returns {JSX.Element} The component for the current configuration step
 */
function ConfigFlow() {
    /**
     * Determines which component to render based on the current configuration step.
     * 
     * @returns {JSX.Element} The component corresponding to the current step
     */
    const getCurrentStep = () => {
        switch (configStore.getCurrentStep()) {
            case configStep.USERNAME:
                // First step: User enters their username
                return <UsernameInput/>
            case configStep.CENTRAL:
                // Second step: User selects their central/service
                return <CentralIdInput/>
            case configStep.NEWEVENT:
                // New event creation: User selects categories
                return <CategoriesInput/>
            case configStep.EVENTNR:
                // Event selected: Show task list for the event
                return <TaskList/>
             // Legacy/alternative flow (currently disabled):
             // case configStep.EVENTNR:
             //     return <EventNrInput/>
            // case configStep.FINISHED:
            //     return <TaskList/>
            case configStep.FINISHED:
                // Check if we're in GLOBALE mode
                const escalationMode = configStore.central.value
                if (escalationMode === "GLOBALE") {
                    return <GlobalSwimlanes/>
                } else {
                    return <Swimlanes/>
                }
        }
    }

    return (
        <>
            {getCurrentStep()}
        </>
    )
}

export default ConfigFlow;
