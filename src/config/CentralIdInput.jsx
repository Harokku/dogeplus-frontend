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
        <div class={"fixed inset-0 flex items-center justify-center"}>
            <form onSubmit={handleOnSubmit} class={"flex flex-col items-center"}>
                <select class={"mb-6 select select-bordered w-full max-w-xs"} value={id()} onChange={handleOnChange}>
                    <option value="" disabled>Select Central ID</option>
                    {ids.map((id) => <option key={id} value={id}>{id}</option>)}
                </select>
                <button class={"btn btn-success"} type="submit">Next</button>
            </form>
        </div>
    )
}

export default CentralIdInput;