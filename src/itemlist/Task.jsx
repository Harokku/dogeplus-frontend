import {DateTime} from 'luxon';
import {Show} from "solid-js";

function Task(props) {

    /**
     * Represents the possible actions that can be marked as "done".
     * Use the "doneActions" variable to access these actions.
     *
     * @type {Object}
     * @property {string} SEND - The action of sending.
     * @property {string} ABORT - The action of aborting.
     * @property {string} NOOP - The no action
     */
    const doneActions = Object.freeze({
        SEND: 'send', // Send the request
        ABORT: 'abort', // Abort sending the request
        NOOP: 'noop' // No operation
    })

    /**
     * Determine if controls should be shown based on props isDone value.
     *
     * @returns {boolean} - True if controls should be shown, false otherwise.
     */
    const showControls = () => {
        switch (props.isDone) {
            case 2:
                return true
            default:
                return false
        }
    }

    /**
     * Returns the background color class based on props isDone value.
     *
     * @returns {string} - The background color class based on the state.
     */
    const getBgColor = () => {
        switch (props.isDone) {
            case 0:
                return 'alert-info'
            case 1:
                return 'alert-success'
            case 2:
                return 'alert-warning'
            default:
                return ''
        }
    }

    /**
     * Returns an icon based on props isDone value.
     *
     * @returns {JSX.Element} - The icon component.
     */
    const getIcon = () => {
        switch (props.isDone) {
            case 0:
                return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3"
                            stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/>
                </svg>
            case 1:
                return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3"
                            stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                </svg>

            case 2:
                return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3"
                            stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"/>
                </svg>

            default:
                return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            class="stroke-info shrink-0 w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
        }
    }

    /**
     * Retrieves the user and timestamp.
     *
     * @returns {string} The user timestamp in the format "${operator} @ ${formattedDate}".
     */
    const getUserTimestamp = () => {
        // Get operator from props or set to default
        const operator = (props && 'operator' in props)
            ? props.operator
            : 'no one'

        let parsedDate // Datetime parsed from props
        // Get timestamp from props or set to null
        if (props && 'timestamp' in props) {
            props.timestamp.Valid
                ? parsedDate = DateTime.fromISO(props.timestamp.Time)
                : parsedDate = null
        }
        // If parsedDate is not null format it ore set a default
        const formattedDate = parsedDate != null
            ? parsedDate.toFormat("dd/MM/yy HH:mm:ss")
            : 'no time'

        return `${operator} @ ${formattedDate}`
    }

    const putDoneState = async (done) => {
        let nextDoneState // Next state to send to backend
        let user // Operator name from localstorage

        // If pristine -> set next state to managing
        if (props.isDone === 0) {
            nextDoneState = 2
        }

        // I already accomplished do nothing and abort the request process
        if (props.isDone === 1) {
            return
        }

        // If is in management -> set next state based on user's clicked button
        if (props.isDone === 2 && done === doneActions.SEND) {
            nextDoneState = 1
        } else if (props.isDone === 2 && done === doneActions.ABORT) {
            nextDoneState = 0
        } else if (props.isDone === 2) {
            return
        }

        // If at this point the next state is still undefined abort the request process
        if (nextDoneState === undefined) return

        // Get user from localstorage, default to 'No one' if not found
        user = localStorage.getItem("username") || 'No one'

        // TODO: Write better error handling
        try {
            const response = await fetch('http://localhost:3000/api/v1/events/setDone', {
                method: 'PUT',
                body: JSON.stringify({
                    id: props.id,
                    operator: user,
                    isDone: nextDoneState
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }

            const json = await response.json();
            console.log(json);
        } catch (err) {
            console.error('Request failed', err);
        }
    }

    return (
        <>
            <div role="alert" class={`alert ${getBgColor()} shadow-lg flex my-2`}
                 onClick={() => putDoneState()}>
                {/*Icon to the left*/}
                {getIcon()}
                {/*Task text, modded by, timestamp and description*/}
                <div class="relative flex-grow">
                    <h3 class="font-bold">{props.task}</h3>
                    {/*Don't show in normal state (0)*/}
                    <Show when={props.isDone === 1 || props.isDone === 2}>
                        <p class="absolute text-sm right-0 text-gray-300">{getUserTimestamp()}</p></Show>
                </div>
                {/*Action buttons*/}
                {/*Visible only in on managing state (2)*/}
                <Show when={showControls()}>
                    <div>
                        <button class="btn btn-sm btn-success" onClick={() => putDoneState(doneActions.SEND)}>Completato
                        </button>
                        <button class="btn btn-sm btn-error" onClick={() => putDoneState(doneActions.ABORT)}>Annulla
                        </button>
                    </div>
                </Show>
            </div>
        </>
    );
}

export default Task;