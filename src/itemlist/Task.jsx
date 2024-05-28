import {DateTime} from 'luxon';
import {Show} from "solid-js";
import {configStore} from "../store/configStore.js";
import {updateActiveEvent} from "../dataService/updateTaskService.js";
import {addNotification, notificationPriorities} from "../store/notificationStore.js";

function Task(props) {

    /**
     * Possible statuses for a variable.
     *
     * @typedef {Object} Statuses
     * @property {string} NOTDONE - Represents the not done status.
     * @property {string} WORKING - Represents the working status.
     * @property {string} DONE - Represents the done status.
     */
    const statuses = Object.freeze({
        NOTDONE: 'notdone',
        WORKING: 'working',
        DONE: 'done'
    })

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
        switch (props.status) {
            case statuses.WORKING:
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
        switch (props.status) {
            case statuses.NOTDONE:
                return 'alert-info'
            case statuses.DONE:
                return 'alert-success'
            case statuses.WORKING:
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
        switch (props.status) {
            case statuses.NOTDONE:
                return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3"
                            stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/>
                </svg>
            case statuses.DONE:
                return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3"
                            stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                </svg>

            case statuses.WORKING:
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
        const operator = (props?.modified_by?.trim() !== "")
            ? props.modified_by
            : 'no one'

        let parsedDate // Datetime parsed from props
        // Get timestamp from props or set to null
        if (props && 'timestamp' in props) {
            props.timestamp
                ? parsedDate = DateTime.fromISO(props.timestamp)
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
        if (props.status === statuses.NOTDONE) {
            nextDoneState = statuses.WORKING
        }

        // I already accomplished do nothing and abort the request process
        if (props.status === statuses.DONE) {
            return
        }

        // If is in management -> set next state based on user's clicked button
        if (props.status === statuses.WORKING && done === doneActions.SEND) {
            nextDoneState = statuses.DONE
        } else if (props.status === statuses.WORKING && done === doneActions.ABORT) {
            nextDoneState = statuses.NOTDONE
        } else if (props.isDone === statuses.WORKING) {
            return
        }

        // If at this point the next state is still undefined abort the request process
        if (nextDoneState === undefined) return

        // Get user from config storage
        user = configStore.username.value

        const data = {
            uuid: props.uuid,
            status: nextDoneState,
            modified_by: user,
        }
        const response = await updateActiveEvent(data)

        // Check if responded with an error and show a status with detail
        if (!response.result){
            console.error(response.error)
            addNotification(`Errore salvataggio task:\n${response.error}`, notificationPriorities.ERROR)
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
                    <h3 class="font-bold">{props.title}</h3>
                    <Show when={props?.status === statuses.WORKING}>
                        <p>{props.description}</p>
                    </Show>

                    {/*Action buttons*/}
                    {/*Visible only in on managing state (2)*/}
                    <Show when={showControls()}>
                        <div>
                            <button class="btn btn-sm btn-success"
                                    onClick={() => putDoneState(doneActions.SEND)}>Completato
                            </button>
                            <button class="btn btn-sm btn-error" onClick={() => putDoneState(doneActions.ABORT)}>Annulla
                            </button>
                        </div>
                    </Show>

                    {/*Don't show in normal state (0)*/}
                    <Show when={props.status === statuses.DONE || props.status === statuses.WORKING}>
                        <p class="badge badge-ghost absolute text-sm right-0 text-gray-300">{getUserTimestamp()}</p>
                    </Show>
                </div>
            </div>
        </>
    );
}

export default Task;