import {createStore} from "solid-js/store";
import {onCleanup} from "solid-js";

/**
 * @description Object containing notification priorities.
 * @type {object}
 * @property {string} NEUTRAL - Empty string for neutral priority.
 * @property {string} INFO - CSS class for informational priority.
 * @property {string} SUCCESS - CSS class for success priority.
 * @property {string} WARNING - CSS class for warning priority.
 * @property {string} ERROR - CSS class for error priority.
 */
export const notificationPriorities = Object.freeze({
    NEUTRAL:"",
    INFO:"info",
    SUCCESS:"success",
    WARNING:"warning",
    ERROR:"error",
})

// Notification store
export const [notifications, setNotifications] = createStore([])

/**
 * Adds a notification to the store with the specified text and priority.
 *
 * @param {string} text - The text of the notification.
 * @param {notificationPriorities} priority - The priority of the notification (from frozen enum).
 * @return {void}
 */
export function addNotification(text, priority) {
    // Add notification to the store
    setNotifications((oldNotifications) => [
        ...oldNotifications,
        {text, priority}
    ])

    // Set a timer to remove the oldest notification after 2 seconds
    let timerId = setTimeout(() => {
        setNotifications((oldNotifications) => oldNotifications.slice(1))
    }, 2000)

    // Cleanup the timer when component is unmounted
    onCleanup(() => {
        clearTimeout(timerId)
    })
}