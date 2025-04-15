/**
 * Main Application Component
 * 
 * This is the root component of the DogePlus frontend application.
 * It serves as the entry point and main container for the application,
 * orchestrating the overall layout and component hierarchy.
 * 
 * The App component:
 * - Manages the configuration flow for user setup
 * - Provides file upload functionality for local and global configurations
 * - Displays notifications to the user
 * - Renders the navigation step bar
 * - Conditionally renders the appropriate view based on the current configuration state
 */
import './App.css'
import ConfigFlow from "./config/ConfigFlow.jsx";
import {configStore} from "./store/configStore.js";
import NotificationContainer from "./NotificationContainer.jsx";
import StepBar from "./navbar/StepBar.jsx";
import Swimlanes from "./assessment/Swimlanes.jsx";
import {createSignal, onMount} from "solid-js";
import {config} from "./dataService/config.js";
import websocketService from "./ws/websocketService.js";
import WebSocketStatus from "./ws/WebSocketStatus.jsx";

/**
 * The main application component that serves as the entry point for the DogePlus frontend.
 * 
 * @returns {JSX.Element} The rendered application UI
 */
function App() {
    const [selectedFile, setSelectedFile] = createSignal(null);

    // Connect to WebSocket server when the app mounts
    onMount(() => {
        console.log("Connecting to WebSocket server...");
        websocketService.connect();
    });

    /**
     * Asynchronously handles file selection and uploads the chosen file using a specified upload handler.
     *
     * @param {Event} event - The file selection event triggered by the file input element.
     * @param {string} uploadType - The type of upload to be performed, used to select the corresponding handler function.
     *
     * This function performs the following tasks:
     * 1. Extracts the selected file from the event object.
     * 2. If a file is selected, it sets the selected file state.
     * 3. Determines the appropriate upload handler based on the provided uploadType.
     * 4. Invokes the selected handler to upload the file.
     * 5. Resets the file input element's value to allow the same file to be re-uploaded.
     *
     * If no handler is found for the given uploadType, an error message is logged to the console.
     */
    const handleFileSelect = async (event, uploadType) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const handler = uploadHandlers[uploadType];
            if (handler) {
                await handler(file);
                // Reset the file input value to allow re-upload of the same file
                event.target.value = "";
            } else {
                console.error(`Unknown upload type ${uploadType}`);
            }
        }
    };

    /**
     * Handles the local file upload process.
     *
     * This function uploads a file to the backend server
     * using a POST request. It uses FormData to construct
     * the request body and appends the file to it.
     *
     * If the upload is successful, an alert is displayed
     * indicating that the file was uploaded correctly.
     * If the upload fails, an alert is shown with the
     * failure message. In case of an error during
     * the upload process, an alert with the error
     * description is shown.
     *
     * @param {File} file - The file to be uploaded.
     * @returns {Promise<void>} A promise that resolves when the upload process completes.
     */
    const handleLocalUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${config.backendURL}/tasks/upload/local`, {
                method: "POST",
                body: formData,
            });
            if (response.ok) {
                alert("File Caricato correttamente");
            } else {
                alert("File upload failed!");
            }
        } catch (error) {
            alert("Error uploading file: " + error.message);
        }
    };

    /**
     * Asynchronously handles the global file upload process.
     *
     * @param {File} file - The file to be uploaded.
     * @returns {Promise<void>} A promise that resolves when the upload is complete.
     *
     * The function creates a new FormData object, appends the provided file to it,
     * and sends it to the backend URL defined in the configuration using a POST request.
     * On successful upload, the user is alerted with a success message.
     * If the upload fails or an error occurs, an appropriate error message is shown.
     */
    const handleGlobalUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${config.backendURL}/tasks/upload/main`, {
                method: "POST",
                body: formData,
            });
            if (response.ok) {
                alert("File Caricato correttamente");
            } else {
                alert("File upload failed!");
            }
        } catch (error) {
            alert("Error uploading file: " + error.message);
        }
    };

    /**
     * An object that maps upload handler types to their corresponding functions.
     *
     * The `uploadHandlers` object allows for different upload handling strategies
     * based on the specified type. Currently supported types are:
     *
     * - `local`: Handles uploads in a local environment.
     * - `global`: Handles uploads in a global environment.
     *
     * Each property of this object is a function that executes the upload logic for that particular type.
     *
     * @type {Object.<string, function>}
     */
    const uploadHandlers = {
        local: handleLocalUpload,
        global: handleGlobalUpload
    }

    /**
     * Renders the application UI with the following structure:
     * 1. File upload buttons in the top-left corner
     * 2. Notification container for displaying system messages
     * 3. Step bar navigation showing the current configuration step
     * 4. Configuration flow component for user setup
     * 
     * The file upload buttons use a pattern where the actual file input is hidden
     * and styled buttons trigger the file selection dialog.
     */
    return (
        <>
            {/* File upload buttons fixed to the top-left corner */}
            <div class="fixed top-0 left-0 p-4 flex items-center space-x-4 z-20">
                {/* Button Group Container */}
                <div class="flex space-x-4">
                    {/* Local integration file upload button */}
                    <div class="relative">
                        <input
                            type="file"
                            onChange={(event) => handleFileSelect(event, "local")}
                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            id="fileInput1"
                        />
                        <button
                            class="btn btn-primary z-20"
                            onClick={() => document.getElementById('fileInput1').click()}
                        >
                            Carica integrazione locale
                        </button>
                    </div>
                    {/* Global configuration file upload button */}
                    <div class="relative">
                        <input
                            type="file"
                            onChange={(event) => handleFileSelect(event, "global")}
                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            id="fileInput2"
                        />
                        <button
                            class="btn btn-accent z-20"
                            onClick={() => document.getElementById('fileInput2').click()}
                        >
                            Carica config trasversale
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification system for displaying messages to the user */}
            <NotificationContainer/>

            {/* Navigation bar showing the current configuration step */}
            <StepBar/>
            <br/>

            {/* Main configuration flow component for user setup */}
            <ConfigFlow/>

            {/* WebSocket connection status indicator */}
            <WebSocketStatus/>

        </>
    )
}

export default App
