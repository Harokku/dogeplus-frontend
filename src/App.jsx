import './App.css'
import Task from "./itemlist/Task.jsx";
import {For, createMemo} from "solid-js";
import {createStore} from "solid-js/store";


function App() {
// mocking data for ux test
    const [store, setStore] = createStore([
        {
            "id": 7,
            "category": "Incidente stradale",
            "assignedTo": "Sanitarie",
            "priority": 10,
            "task": "Presenza mezzi pesanti",
            "timestamp": {
                "Time": "0001-01-01T00:00:00Z",
                "Valid": false
            },
            "isDone": 2
        },
        {
            "id": 2,
            "category": "PRO22",
            "assignedTo": "RTT",
            "priority": 1,
            "task": "Decide il riassetto della SOREU",
            "timestamp": {
                "Time": "2024-01-15T17:54:51Z",
                "Valid": true
            },
            "operator": "Me",
            "ipAddress": "127.0.0.1",
            "isDone": 1
        },
        {
            "id": 3,
            "category": "PRO22",
            "assignedTo": "RTT",
            "priority": 1,
            "task": "Reactive task",
            "timestamp": {
                "Time": "2024-01-15T17:54:51Z",
                "Valid": true
            },
            "operator": "Some one",
            "ipAddress": "127.0.0.1",
            "isDone": 1
        }])

    /**
     * Creates a memoized function to group tasks by the assigned person.
     *
     * @function createMemo
     * @returns {Object} - Object containing tasks grouped by the assigned person.
     */
    const groupedTasks = createMemo(() =>
        store.reduce((groups, task) => {
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
            <button class="btn" onClick={() =>
                setStore(task => task.id === 3, {operator: "Him!", isDone: 2, assignedTo: "Flotta"})}
            >Update 3rd
            </button>

            {/*Grid div with column number equal to assignedTo different entries*/}
            <div class="grid grid-flow-col auto-cols-auto gap-4">
                {/*Iterate each key and extract values array*/}
                <For each={Object.entries(groupedTasks())}>
                    {([key, item]) =>
                        <div>
                            {key}
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

export default App
