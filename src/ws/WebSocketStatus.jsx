import { createEffect, createSignal, onMount, onCleanup } from "solid-js";
import websocketService, { WS_STATES } from "./websocketService.js";

/**
 * WebSocketStatus component displays the connection status of a WebSocket connection.
 * It uses the websocketService to monitor the connection state and displays it in the UI.
 * 
 * @returns {JSX.Element} The WebSocket status indicator component
 */
function WebSocketStatus() {
    // Get the initial state and create a signal to track changes
    const [connectionState, setConnectionState] = createSignal(websocketService.getState());

    // Map of state values to human-readable strings
    const states = ["Connecting", "Connected", "Disconnecting", "Disconnected"];

    // Monitor websocket state changes
    createEffect(() => {
        const checkState = () => {
            const currentState = websocketService.getState();
            setConnectionState(currentState);
        };

        // Check state immediately
        checkState();

        // Set up an interval to check the state periodically
        const intervalId = setInterval(checkState, 1000);

        // Clean up the interval when the component is unmounted
        return () => clearInterval(intervalId);
    });

    return (
        <div class="fixed bottom-0 left-0 m-4 p-2 rounded-lg shadow-lg bg-white flex items-center space-x-2 z-50">
            {states[connectionState()] === "Connected" ? (
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

                    <span class="font-semibold text-green-500">{states[connectionState()]}</span>
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
                              d="M19.892 4.09a3.75 3.75 0 0 0-5.303 0l-4.5 4.5c-.074.074-.144.15-.21.229l4.965 4.966a3.75 3.75 0 0 0-1.986-4.428.75.75 0 0 1 .646-1.353 5.253 5.253 0 0 1 2.502 6.944l5.515 5.515a.75.75 0 0 1-1.061 1.06l-18-18.001A.75.75 0 0 1 3.521 2.46l5.294 5.295a5.31 5.31 0 0 1 .213-.227l4.5-4.5a5.25 5.25 0 1 1 7.425 7.425l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.756-1.757a3.75 3.75 0 0 0 0-5.304ZM5.846 11.773a.75.75 0 0 1 0 1.06l-1.757 1.758a3.75 3.75 0 0 0 5.303 5.304l3.129-3.13a.75.75 0 1 1 1.06 1.061l-3.128 3.13a5.25 5.25 0 1 1-7.425-7.426l1.757-1.757a.75.75 0 0 1 1.061 0Zm2.401.26a.75.75 0 0 1 .957.458c.18.512.474.992.885 1.403.31.311.661.555 1.035.733a.75.75 0 0 1-.647 1.354a5.244 5.244 0 0 1-1.449-1.026 5.232 5.232 0 0 1-1.24-1.965.75.75 0 0 1 .46-.957Z"
                              clip-rule="evenodd"/>
                    </svg>

                    <span class="font-semibold text-red-500">{states[connectionState()]}</span>
                </>
            )}
        </div>
    );
}

export default WebSocketStatus;

// Export a hook for using WebSocket topics in components
export function useWebSocketTopic(topic, handler) {
    // Use onMount to ensure this only runs once when the component mounts
    onMount(() => {
        // Subscribe to the topic when the component mounts
        const unsubscribe = websocketService.subscribe(topic, handler);

        // Use onCleanup to ensure unsubscription when the component unmounts
        onCleanup(unsubscribe);
    });
}
