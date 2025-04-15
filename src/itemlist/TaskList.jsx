import {createStore} from "solid-js/store";
import {createEffect, createMemo, For, onMount} from "solid-js";
import Task from "./Task.jsx";
import {getActiveEvent} from "../dataService/dataService.js";
import {parseEnvToBoolean} from "../utils/varCasting.js";
import WebSocketStatus, {createWebSocket} from "../ws/WebSocketStatus.jsx";

function TaskList() {

    // Create a reconnecting ws socket with heartbeat and set connection status
    const { socket, state, states } = createWebSocket();
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


            {/* WebSocket connection status indicator */}
            <WebSocketStatus />

            {/*<p>Connection: {states[state()]}</p>*/}

            {/*Grid div with column number equal to assignedTo different entries*/}
            <div class="grid grid-flow-col auto-cols-auto gap-4">
                {/*Iterate each key and extract values array*/}
                <For each={Object.entries(groupedTasks())}>
                    {([key, item]) =>
                        <div>
                            {/*Role label*/}
                            <div class="flex justify-center relative mb-8 p-4 rounded-xl shadow-2xl bg-gradient-to-br from-blue-50 to-white  border border-gray-200">
                                <div class="text-xl font-medium text-center text-gray-800">
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
