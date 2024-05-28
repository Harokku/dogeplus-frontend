import UsernameInput from "./UsernameInput";
import CentralIdInput from "./CentralIdInput";
import {configStep, configStore} from "../store/configStore.js";
import EventNrInput from "./EventNrInput.jsx";
import TaskList from "../itemlist/TaskList.jsx";
import CategoriesInput from "./CategoriesInput.jsx";

function ConfigFlow() {
    const getCurrentStep = () => {
        switch (configStore.getCurrentStep()) {
            case configStep.USERNAME:
                return <UsernameInput/>;
            case configStep.CENTRAL:
                return <CentralIdInput/>;
            case configStep.NEWEVENT:
                return <CategoriesInput/>
            case configStep.EVENTNR:
                return <EventNrInput/>
            case configStep.FINISHED:
                return <TaskList/>
        }
    }

    return (
        <>
            {getCurrentStep()}
        </>
    )
}

export default ConfigFlow;