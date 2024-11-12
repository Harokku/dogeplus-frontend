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


            {/*Connection status icon on bottom-left corner*/}
            <div class="fixed bottom-0 left-0 m-4 p-2 rounded-lg shadow-lg bg-white flex items-center space-x-2 z-50">
                {states[state()] === "Connected" ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                             className="h-6 w-6 text-green-500 size-6">
                            <path fill-rule="evenodd"
                                  d="M1.371 8.143c5.858-5.857 15.356-5.857 21.213 0a.75.75 0 0 1 0 1.061l-.53.53a.75.75 0 0 1-1.06 0c-4.98-4.979-13.053-4.979-18.032 0a.75.75 0 0 1-1.06 0l-.53-.53a.75.75 0 0 1 0-1.06Zm3.182 3.182c4.1-4.1 10.749-4.1 14.85 0a.75.75 0 0 1 0 1.061l-.53.53a.75.75 0 0 1-1.062 0 8.25 8.25 0 0 0-11.667 0 .75.75 0 0 1-1.06 0l-.53-.53a.75.75 0 0 1 0-1.06Zm3.204 3.182a6 6 0 0 1 8.486 0 .75.75 0 0 1 0 1.061l-.53.53a.75.75 0 0 1-1.061 0 3.75 3.75 0 0 0-5.304 0 .75.75 0 0 1-1.06 0l-.53-.53a.75.75 0 0 1 0-1.06Zm3.182 3.182a1.5 1.5 0 0 1 2.122 0 .75.75 0 0 1 0 1.061l-.53.53a.75.75 0 0 1-1.061 0l-.53-.53a.75.75 0 0 1 0-1.06Z"
                                  clip-rule="evenodd"/>
                        </svg>

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                             className="h-6 w-6 text-green-500 size-6">
                            <path fill-rule="evenodd"
                                  d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z"
                                  clip-rule="evenodd"/>
                        </svg>


                        <span class="font-semibold text-green-500">{states[state()]}</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor" className="h-6 w-6 text-red-500 size-6">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                        </svg>

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                             className="h-6 w-6 text-red-500 size-6">
                            <path fill-rule="evenodd"
                                  d="M19.892 4.09a3.75 3.75 0 0 0-5.303 0l-4.5 4.5c-.074.074-.144.15-.21.229l4.965 4.966a3.75 3.75 0 0 0-1.986-4.428.75.75 0 0 1 .646-1.353 5.253 5.253 0 0 1 2.502 6.944l5.515 5.515a.75.75 0 0 1-1.061 1.06l-18-18.001A.75.75 0 0 1 3.521 2.46l5.294 5.295a5.31 5.31 0 0 1 .213-.227l4.5-4.5a5.25 5.25 0 1 1 7.425 7.425l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.756-1.757a3.75 3.75 0 0 0 0-5.304ZM5.846 11.773a.75.75 0 0 1 0 1.06l-1.757 1.758a3.75 3.75 0 0 0 5.303 5.304l3.129-3.13a.75.75 0 1 1 1.06 1.061l-3.128 3.13a5.25 5.25 0 1 1-7.425-7.426l1.757-1.757a.75.75 0 0 1 1.061 0Zm2.401.26a.75.75 0 0 1 .957.458c.18.512.474.992.885 1.403.31.311.661.555 1.035.733a.75.75 0 0 1-.647 1.354 5.244 5.244 0 0 1-1.449-1.026 5.232 5.232 0 0 1-1.24-1.965.75.75 0 0 1 .46-.957Z"
                                  clip-rule="evenodd"/>
                        </svg>

                        <span class="font-semibold text-red-500">{states[state()]}</span>
                    </>
                )}
            </div>

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