import {createStore} from "solid-js/store";
import {createEffect, createMemo, For, onMount} from "solid-js";
import Task from "./Task.jsx";
import {
    createReconnectingWS,
    createWSState,
    makeHeartbeatWS
} from "@solid-primitives/websocket";
import {config} from "../dataService/config.js";
import {getActiveEvent} from "../dataService/dataService.js";
import {parseEnvToBoolean} from "../utils/varCasting.js";

function TaskList() {

    // Create a reconnecting ws socket with heartbeat and set connection status
    const socket = makeHeartbeatWS(
        createReconnectingWS(config.wsUrl, undefined, {delay: 10000}),
        {message: "ping", interval: 5000, wait: 7500}
    )
    const state = createWSState(socket);
    const states = ["Connecting", "Connected", "Disconnecting", "Disconnected"];
    // Monitor ws state and re fetch data if connection is reestablished after a drop
    createEffect((prev) => {
        const isPrevTwoOrThree = [2, 3].includes(prev)
        const isStateZeroOrOne = [0, 1].includes(state())

        if (isPrevTwoOrThree && isStateZeroOrOne) {
            console.info("Connection reestablished, refetching data");
            fetchData();
        }

        return state()
    }, state())

    // Add an event listener that update local store if en Event Updated message is received over ws
    socket.addEventListener("message", (msg) => {
        let data
        try {
            data = JSON.parse(msg.data)
        } catch (err) {

        }
        if (data?.Result === "Event Task Updated") {
            setTaskStore(task => task.uuid === data?.Events.uuid, data?.Events)
        }
    });

    // Local store
    const [taskStore, setTaskStore] = createStore([])


    /**
     * Fetches data from the backend API and sets it in task store.
     *
     * @async
     * @function fetchData
     * @throws {Error} If an error occurs while fetching the data from the backend.
     */
    const fetchData = async () => {
        const response = await getActiveEvent(parseEnvToBoolean(import.meta.env.VITE_MOCK) || false)
        if (response.result) {
            setTaskStore(response.data.Tasks)
        }
    }

    // Fetch task list from backend
    onMount(fetchData)

    /**
     * Creates a memoized function to group tasks by the assigned person.
     *
     * @function createMemo
     * @returns {Object} - Object containing tasks grouped by the assigned person.
     */
    const groupedTasks = createMemo(() =>
        taskStore.reduce((groups, task) => {
            let key = task.role;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(task);
            return groups;
        }, {})
    )

    return (
        <>
            <p>Connection: {states[state()]}</p>
            {/*Grid div with column number equal to assignedTo different entries*/}
            <div class="grid grid-flow-col auto-cols-auto gap-4">
                {/*Iterate each key and extract values array*/}
                <For each={Object.entries(groupedTasks())}>
                    {([key, item]) =>
                        <div>
                            <div
                                class="p-2 max-w-sm mx-auto  rounded-xl shadow-md flex items-center justify-center space-x-4 glass">
                                <div class="text-xl font-medium text-red-500 text-center">
                                    {key}
                                </div>
                            </div>
                            {/*Iterate each assignee task and show an item for every task in the array*/}
                            <For each={item}>
                                {(task) =>
                                    <Task {...task} />
                                }
                            </For>
                        </div>
                    }</For>
            </div>
        </>
    )
}

export default TaskList