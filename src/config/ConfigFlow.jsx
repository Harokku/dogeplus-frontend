import {createSignal} from "solid-js";

import UsernameInput from "./UsernameInput";
import CentralIdInput from "./CentralIdInput";
import CategoriesInput from "./CategoriesInput.jsx";

function ConfigFlow() {
    const [step, setStep] = createSignal(1);

    const nextStep = () => setStep(step() + 1);

    return (
        <>
            {step() === 1 &&
                <UsernameInput next={nextStep}/>}
            {step() === 2 &&
                <CentralIdInput next={nextStep}/>}
            {step() === 3 &&
                <CategoriesInput next={nextStep}/>}
        </>
    )
}

export default ConfigFlow;