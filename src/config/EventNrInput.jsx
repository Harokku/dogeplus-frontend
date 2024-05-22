import {createSignal, For, Match, onMount, Show} from "solid-js";
import {configStore} from "../store/configStore.js";
import {bgColor, textColor} from "../theme/bg.js";
import {getActiveEvents} from "../dataService/dataService.js";

function EventNrInput() {
    const [selected, setSelected] = createSignal(null)
    const [events, setEvents] = createSignal(null)
    const [fetchError, setFetchError] = createSignal(false)

    // Data fetching

    onMount(async () => {
        const response = await getActiveEvents(false)
        // select function based on the "Result" value
        if (response.result) {
            switch (response.data.Result) {
                case "Multiple events found":
                    handleMultipleEvents(response.data)
                    break
                case "Event Found":
                    handleEventFound(response.data)
                    break
                default:
                    setFetchError(true)
            }
        } else {
            setFetchError(true)
        }
    })

    // Data extraction from response

    /**
     * Handles multiple events by setting them in the state.
     *
     * @param {Object} responseData - The response data containing events.
     * @param {Array} responseData.Events - An array of event objects.
     *
     * @return {undefined}
     */
    function handleMultipleEvents(responseData) {
        const {Events} = responseData
        setEvents(Events)
    }

    /**
     * Handles the event found in the response data.
     * @param {Object} responseData - The response data received from the server.
     * @return {void}
     */
    function handleEventFound(responseData) {
        // extract event_number from the first task
        if (responseData.Tasks !== null && responseData.Tasks.length > 0) {
            const {event_number} = responseData.Tasks[0]

            // save event number to selected event
            setSelected(event_number)

            // auto-submit with event number
            handleOnSubmit(null)
        }
    }

    // UI state handle
    const handleOnClick = (event) => {
        setSelected(event);
    }

    const handleOnSubmit = (e) => {
        if (e) e.preventDefault();
        // Save the chosen Event in store
        configStore.eventNr.set(selected())
    }

    return (
        <div class="flex flex-col items-center justify-center">
            <Show when={!fetchError()}
                  fallback={<p>Nessun evento attivo trovato</p>}
            >
                <For each={events()} fallback={<div>Loading...</div>}>
                    {(event) => (
                        <div key={event} onClick={() => handleOnClick(event)}
                             class={"flex items-center justify-center my-1 cursor-pointer p-2 rounded " + (selected() === event ? bgColor.SELECTED : bgColor.NORMAL)}>
                            <p class={"font-medium " + (textColor.NORMAL)}>{event}</p>
                        </div>
                    )}
                </For>
            </Show>
            <button type="button" onClick={handleOnSubmit} class="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Next
            </button>
        </div>
    )
}

export default EventNrInput;