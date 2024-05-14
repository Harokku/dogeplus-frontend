import store from "../store/store.js";
import {createSignal} from "solid-js";

function CentralIdInput({next}) {
    const [id, setId] = createSignal(""); // List of mock IDs
    const ids = ["SRA", "SRL", "SRM", "SRP"];

    const handleOnChange = (e) => {
        setId(e.target.value);
    }

    const handleOnSubmit = (e) => {
        e.preventDefault();
        // Save the chosen ID in store
        store.central.set(id())
        next()
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