import UsernameInput from "./UsernameInput";
import CentralIdInput from "./CentralIdInput";
import CategoriesInput from "./CategoriesInput.jsx";
import store from "../store/store.js";

function ConfigFlow() {
    const getCurrentStep = () => {
        switch (store.getCurrentStep()) {
            case 'username':
                return <UsernameInput/>;
            case 'central':
                return <CentralIdInput/>;
            case 'categories':
                return <CategoriesInput/>;
            case 'finished':
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