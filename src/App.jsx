import './App.css'
import ConfigFlow from "./config/ConfigFlow.jsx";
import {configStore} from "./store/configStore.js";
import NotificationContainer from "./NotificationContainer.jsx";
import StepBar from "./navbar/StepBar.jsx";
import Swimlanes from "./assessment/Swimlanes.jsx";
import {createSignal} from "solid-js";


function App() {
    const [selectedFile, setSelectedFile] = createSignal(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            await handleUpload(file);
        }
    };

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:3000/api/v1/tasks/upload/local", {
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

    return (
        <>
            {/*<Swimlanes/>*/}
            {/*<br/>*/}
            {/*<hr/>*/}

            <div style={{ position: 'fixed', top: '0', left: '0' }} class="p-4">
                <input
                    type="file"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="fileInput"
                />
                <button
                    class="btn btn-primary"
                    onClick={() => document.getElementById('fileInput').click()}
                >
                    Carica integrazione locale
                </button>
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
