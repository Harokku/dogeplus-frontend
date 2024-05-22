import {configStore} from "../store/configStore.js";
import {createSignal} from "solid-js";

function CentralIdInput() {
    const [id, setId] = createSignal("");
    const ids = ["SRA", "SRL", "SRM", "SRP"]; // List of mock IDs

    const handleOnChange = (e) => {
        setId(e.target.value);
    }

    const handleOnSubmit = (e) => {
        e.preventDefault();
        // Save the chosen ID in store
        configStore.central.set(id())
    }

    return (
        <form onSubmit={handleOnSubmit  }>
            <select value={id()} onChange={handleOnChange}>
                <option value="" disabled>Select Central ID</option>
                {ids.map((id) => <option key={id} value={id}>{id}</option>)}
            </select>
            <button type="submit">Next</button>
        </form>
    )
}

export default CentralIdInput;