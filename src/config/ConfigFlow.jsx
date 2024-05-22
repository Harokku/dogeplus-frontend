import UsernameInput from "./UsernameInput";
import CentralIdInput from "./CentralIdInput";
import {configStep, configStore} from "../store/configStore.js";
import EventNrInput from "./EventNrInput.jsx";

function ConfigFlow() {
    const getCurrentStep = () => {
        switch (configStore.getCurrentStep()) {
            case configStep.USERNAME:
                return <UsernameInput/>;
            case configStep.CENTRAL:
                return <CentralIdInput/>;
            case configStep.EVENTNR:
                return <EventNrInput/>
            case configStep.FINISHED:
                return <p>All completed</p>
        }
    }

    return (
        <>
            {getCurrentStep()}
        </>
    )
}

export default ConfigFlow;