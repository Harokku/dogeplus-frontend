/**
 * Notification Store Module
 * 
 * This module provides a centralized store for managing application notifications.
 * It uses SolidJS's createStore for state management and includes:
 * - A frozen enum of notification priorities
 * - A store for holding current notifications
 * - A function for adding notifications with automatic removal after a timeout
 * 
 * Notifications are displayed to users to provide feedback about operations
 * (success, error, warning, info) and are automatically removed after a short period.
 */
import {createStore} from "solid-js/store";
import {onCleanup} from "solid-js";

/**
 * Object containing notification priorities.
 * These priorities determine the visual styling of notifications.
 * 
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

/**
 * The notification store and its setter function.
 * This store holds an array of notification objects, each with text and priority properties.
 * Components can subscribe to this store to display notifications to users.
 * 
 * @type {[Array<{text: string, priority: string}>, Function]} A tuple containing:
 *   - notifications: Array of notification objects
 *   - setNotifications: Function to update the notifications array
 */
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
