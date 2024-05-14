import {createStore} from "solid-js/store";
import {createEffect, createMemo, ErrorBoundary, For, onMount} from "solid-js";
import Task from "./Task.jsx";
import {
    createReconnectingWS,
    createWSState,
    makeHeartbeatWS
} from "@solid-primitives/websocket";

function TaskList() {

    // Create a reconnecting ws socket with heartbeat and set connection status
    const socket = makeHeartbeatWS(
        createReconnectingWS(`ws://localhost:3000/api/v1/ws`, undefined, {delay: 10000}),
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
        if (data?.channel === "Event" && data?.msgType === "Updated") {
            console.log(data)
            setTaskStore(task => task.id === data?.msg.id, data?.msg)
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
        const res = await fetch('http://127.0.0.1:3000/api/v1/events')

        if (!res.ok) {
            throw new Error(`Error fetching task list from backend:\t${res.status}`)
        }
        const data = await res.json()

        setTaskStore(data)
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
            let key = task.assignedTo;
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
                                class="p-2 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center justify-center space-x-4">
                                <div class="text-xl font-medium text-black text-center">
                                    {key}
                                </div>
                            </div>
                            {/*Iterate each assignee task and show an item for every task in the array*/}
                            <For each={item}>
                                {(task) =>
                                    <Task {...task}/>
                                }</For>
                        </div>
                    }</For>
            </div>
        </>
    )
}

export default TaskList