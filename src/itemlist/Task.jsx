import {DateTime} from 'luxon';
import {Show} from "solid-js";

function Task(props) {

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
                return ''
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
                return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            class="stroke-info shrink-0 w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            case 1:
                return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                </svg>

            case 2:
                return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
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

    return (
        <>
            <div role="alert" class={`alert ${getBgColor(props.isDone)} shadow-lg flex my-2`}>
                {/*Icon to the left*/}
                {getIcon(props.isDone)}
                {/*Task text, modded by, timestamp and description*/}
                <div class="relative flex-grow">
                    <h3 class="font-bold">{props.task}</h3>
                    {/*Don't show in normal state (0)*/}
                    <Show when={props.isDone === 1 || props.isDone === 2}>
                        <p class="absolute text-sm right-0 text-gray-500">{getUserTimestamp()}</p></Show>
                </div>
                {/*Action buttons*/}
                {/*Visible only in on managing state (2)*/}
                <Show when={showControls(props.isDone)}>
                    <div>
                        <button class="btn btn-sm btn-success">Fatto</button>
                        <button class="btn btn-sm btn-error">Annulla</button>
                    </div>
                </Show>
            </div>
        </>
    );
}

export default Task;