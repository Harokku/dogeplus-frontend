import {createStore} from "solid-js/store";
import {createEffect, createMemo, For, onMount} from "solid-js";
import Task from "./Task.jsx";
import {getActiveEvent} from "../dataService/dataService.js";
import {parseEnvToBoolean} from "../utils/varCasting.js";
import websocketService from "../ws/websocketService.js";
import {useWebSocketTopic} from "../ws/WebSocketStatus.jsx";

function TaskList() {
    // Local store
    const [taskStore, setTaskStore] = createStore([]);

    // Monitor websocket state and refetch data if connection is reestablished after a drop
    createEffect((prev) => {
        const currentState = websocketService.getState();
        const isPrevDisconnected = prev === websocketService.WS_STATES.DISCONNECTED;
        const isConnected = currentState === websocketService.WS_STATES.CONNECTED;

        if (isPrevDisconnected && isConnected) {
            console.info("Connection reestablished, refetching data");
            fetchData();
        }

        return currentState;
    }, websocketService.getState());

    // Subscribe to the task_completion_update topic
    useWebSocketTopic('task_completion_update', (data) => {
        if (data?.Result === "Event Task Updated") {
            setTaskStore(task => task.uuid === data?.Events.uuid, data?.Events);
        }
    });


    /**
     * Fetches data from the backend API and sets it in task store.
     *
     * @async
     * @function fetchData
     * @throws {Error} If an error occurs while fetching the data from the backend.
     */
    const fetchData = async () => {
        try {
            const response = await getActiveEvent(parseEnvToBoolean(import.meta.env.VITE_MOCK) || false)
            if (response.result) {
                setTaskStore(response.data.Tasks)
            } else if (response.error) {
                console.error("Error fetching tasks:", response.error)
            }
        } catch (error) {
            console.error("Exception fetching tasks:", error)
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
