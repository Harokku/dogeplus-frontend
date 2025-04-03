/**
 * Notification Container Component
 * 
 * This component displays notifications from the notification store.
 * It renders a toast container with alerts for each notification,
 * styling them according to their priority level (info, success, warning, error).
 * 
 * Notifications are automatically added to the store by other components
 * and are automatically removed after a timeout period.
 */
import {For} from "solid-js";
import {notifications} from "./store/notificationStore.js";

/**
 * Renders a container for displaying notification alerts.
 * 
 * @param {Object} props - Component props (not currently used)
 * @returns {JSX.Element} The notification container UI
 */
function NotificationContainer(props) {
    return (
        <>
            {/* Toast container positioned at the top-right of the screen */}
            <div class="toast">
                {/* Iterate through all active notifications */}
                <For each={notifications}>
                    {(notification) => (
                        /* Alert with styling based on notification priority */
                        <div class={`alert alert-${notification.priority}`} role="alert">
                            <span>{notification.text}</span>
                        </div>
                    )}
                </For>
            </div>
        </>
    )
}

export default NotificationContainer
