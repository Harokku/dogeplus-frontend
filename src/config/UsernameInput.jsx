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
        <div class={"fixed inset-0 flex items-center justify-center"}>
        <form onSubmit={handleOnSubmit} class={"flex flex-col items-center"}>
            <input class={"mb-6 input input-bordered border-4 focus:border-success border-slate-600 w-full max-w-xs"} type="text" value={name()} onChange={handleOnChange} placeholder="Nome operatore" />
            <button class={"btn btn-outline border-2 btn-success"} type="submit">Conferma</button>
        </form>
        </div>
    )
}

export default UsernameInput