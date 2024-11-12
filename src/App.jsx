import './App.css'
import ConfigFlow from "./config/ConfigFlow.jsx";
import {configStore} from "./store/configStore.js";
import NotificationContainer from "./NotificationContainer.jsx";
import StepBar from "./navbar/StepBar.jsx";
import Swimlanes from "./assessment/Swimlanes.jsx";
import {createSignal} from "solid-js";
import {config} from "./dataService/config.js";


function App() {
    const [selectedFile, setSelectedFile] = createSignal(null);

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

    return (
        <>
            {/*<Swimlanes/>*/}
            {/*<br/>*/}
            {/*<hr/>*/}

            <div class="fixed top-0 left-0 p-4 flex items-center space-x-4 z-20">
                {/* Button Group Container */}
                <div class="flex space-x-4">
                    {/* First Button Wrapper */}
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
                    {/* Second Button Wrapper */}
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

            <NotificationContainer/>
            <StepBar/>
            <hr/>
            <ConfigFlow/>

            {/*<pre>*/}
            {/*    {JSON.stringify({*/}
            {/*        username: configStore.username.value,*/}
            {/*        central: configStore.central.value,*/}
            {/*        eventNr: configStore.eventNr.value,*/}
            {/*        categories: configStore.categories.value,*/}
            {/*    },null, 1)}*/}
            {/*</pre>*/}
        </>
    )
}

export default App
