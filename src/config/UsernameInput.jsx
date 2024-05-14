import {createSignal} from "solid-js";
import store from "../store/store.js";

function UsernameInput({next}) {
    const [name, setName] = createSignal("");

    const handleOnChange = (e) => {
        setName(e.target.value);
    }

    const handleOnSubmit = (e) => {
        e.preventDefault();
        // Save the username in store
        store.username.set(name())
        next()
    }

    return (
        <form onSubmit={handleOnSubmit}>
            <input type="text" value={name()} onChange={handleOnChange} placeholder="Enter username..." />
            <button type="submit">Next</button>
        </form>
    )
}

export default UsernameInput