import {For} from "solid-js";
import {notifications} from "./store/notificationStore.js";

function NotificationContainer(props) {
    return (
        <>
            <div class="toast">
                <For each={notifications}>
                    {(notification)=>(
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