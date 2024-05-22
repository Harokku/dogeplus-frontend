import {createSignal} from "solid-js";
import {configStore} from "../store/configStore.js";

function UsernameInput() {
    const [name, setName] = createSignal("");

    const handleOnChange = (e) => {
        setName(e.target.value);
    }

    const handleOnSubmit = (e) => {
        e.preventDefault();
        // Save the username in store
        configStore.username.set(name())
    }

    return (
        <form onSubmit={handleOnSubmit}>
            <input type="text" value={name()} onChange={handleOnChange} placeholder="Enter username..." />
            <button type="submit">Next</button>
        </form>
    )
}

export default UsernameInput