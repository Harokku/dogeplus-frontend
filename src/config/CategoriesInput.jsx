import {createSignal, For, onMount, Show} from "solid-js";
import {configStore} from "../store/configStore.js";
import {getCategories} from "../dataService/categoriesService.js";
import {bgColor, textColor} from "../theme/bg.js";
import {postCreateNewOverview, postCreteNewEvent} from "../dataService/activeEventService.js";
import {addNotification, notificationPriorities} from "../store/notificationStore.js";
import {parseEnvToBoolean} from "../utils/varCasting.js";

function CategoriesInput() {
    const [selectedItems, setSelectedItems] = createSignal([])
    const [categories, setCategories] = createSignal(null)
    const [eventNumber, setEventNumber] = createSignal(null)
    const [fetchError, setFetchError] = createSignal(false)
    const [location, setLocation] = createSignal(null)
    const [locationDetail, setLocationDetail] = createSignal(null)
    // Initialize incidentLevel with the value from localStorage if available
    const storedIncidentLevel = localStorage.getItem("store_incident_level")
    const escalationLevel = localStorage.getItem("store_escalation")
    const PRO22 = 'PRO22'

    // Data fetching
    onMount(async () => {
        const response = await getCategories(parseEnvToBoolean(import.meta.env.VITE_MOCK) || false)
        if (response.result) {
            const fetchedCategories = response.data.data;
            setCategories(fetchedCategories);

            // Check if PRO22 is present and add it to selectedItems
            if (fetchedCategories.includes(PRO22)) {
                setSelectedItems([PRO22]);
            }
        } else {
            setFetchError(true)
        }
    })

    // When an item is clicked, add or remove it from selection array
    const handleOnChange = (category) => {
        if (category === PRO22) return; // Prevent PRO22 from being deselected

        let selected = selectedItems().slice();
        const targetIndex = selected.indexOf(category);

        if (targetIndex === -1)
            selected = [PRO22, category]; // Ensure PRO22 is always selected
        else
            selected.splice(targetIndex, 1);

        setSelectedItems(selected);
    }

    // Clear the selected items array
    const handleReset = (e) => {
        if (e) e.preventDefault();
        // Clear the array but keep PRO22 if it's present
        setSelectedItems(selectedItems().includes(PRO22) ? [PRO22] : [])
    }

    // Save on store and create the new event
    const handleOnSubmit = async (e) => {
        if (e) e.preventDefault();

        // Filter out PRO22 from the selected items
        const categoriesToPost = selectedItems().filter(category => category !== PRO22);

        // Since backend expects only a single category, take the first item from the filtered array
        const categoryToPost = categoriesToPost.length > 0 ? categoriesToPost[0] : null;

        // Save the selected category in store (excluding PRO22)
        configStore.categories.set(categoryToPost ? [categoryToPost] : []);

        // Get the current escalation level from localStorage
        const currentEscalationLevel = localStorage.getItem("store_escalation");
        // Get the current incident level (if applicable)
        const currentIncidentLevel = currentEscalationLevel === "incidente" ? storedIncidentLevel : null;

        // Call backend and create the event
        const data = {
            categories: categoryToPost,
            event_number: eventNumber(),
            central_id: configStore.central.value,
            escalation_level: currentEscalationLevel,
            incident_level: currentIncidentLevel,
        }

        const overviewData = {
            central_id: configStore.central.value,
            event_number: eventNumber(),
            location: location(),
            location_detail: locationDetail(),
            type: categoryToPost,
            level: currentEscalationLevel,
            incident_level: currentIncidentLevel
        }

        // If form is valid submit data to backend
        if (formValidity()) {
            try {
                const response = await postCreteNewEvent(data)

                if (!response.result) {
                    addNotification("Errore durante la creazione evento", notificationPriorities.ERROR)
                    return
                }

                // Add new overview
                try {
                    const overviewResponse = await postCreateNewOverview(overviewData)

                    if (!overviewResponse.result) {
                        addNotification("Errore durante la creazione overview", notificationPriorities.ERROR)
                        // Continue execution as the main event was created successfully
                    }
                } catch (overviewError) {
                    console.error("Error creating overview:", overviewError)
                    addNotification("Errore durante la creazione overview", notificationPriorities.ERROR)
                    // Continue execution as the main event was created successfully
                }

                // If we got here, the main event was created successfully
                configStore.eventNr.set(null)
                configStore.newEvent.set(false)
                // Clean up localStorage
                localStorage.removeItem("store_incident_level")
                addNotification("Evento creato con successo", notificationPriorities.SUCCESS)
            } catch (error) {
                console.error("Error creating event:", error)
                addNotification("Errore durante la creazione evento", notificationPriorities.ERROR)
            }
        }

    }

    // Check form validity
    const formValidity = () => {
        const items = selectedItems();
        const number = eventNumber();

        const itemsAreValid = Array.isArray(items) && items.length > 0;
        const numberIsValid = typeof number === "number" && number > 0;

        // No need to validate incident level as it's set from localStorage
        return itemsAreValid && numberIsValid;
    }

    return (
        <div class="fixed inset-0 flex flex-col items-center justify-center">
            <Show when={!fetchError()}
                  fallback={<p>Nessuna categoria trovata</p>}
            >
                <h1>Crea nuovo monitoraggio di livello {escalationLevel} {storedIncidentLevel ? `- ${storedIncidentLevel}` : ''}</h1>
                <br/>

                <input type="text" placeholder="Numero evento"
                       onInput={(e) => {
                           const newValue = e.target.value.replace(/\D/g, '');
                           setEventNumber(newValue ? parseInt(newValue) : null)
                           e.target.value = newValue
                       }}
                       class="mb-6 input input-bordered w-full max-w-xs"/>

                <input type={"text"} placeholder={"Luogo Evento"}
                       onInput={(e) => {
                           setLocation(e.target.value)
                       }}
                       class="mb-6 input input-bordered w-full max-w-xs"/>

                <input type={"text"} placeholder={"Dettaglio Luogo Evento"}
                       onInput={(e) => {
                           setLocationDetail(e.target.value)
                       }}
                       class="mb-6 input input-bordered w-full max-w-xs"/>

                <label>Seleziona categorie</label>
                <div className="flex flex-row gap-2">
                    <For each={categories()} fallback={<div>Loading...</div>}>
                        {(category) => (
                            <div key={category} onClick={() => handleOnChange(category)}
                                 className={"flex items-center justify-center my-1 cursor-pointer p-2 rounded " + (selectedItems().includes(category) ? bgColor.SELECTED : bgColor.NORMAL)}>
                                <p class={"font-bold " + textColor.NORMAL}>{category}</p>
                            </div>
                        )}
                    </For>
                </div>


            </Show>

            <div class="join mt-6">
                <button type="button" disabled={!formValidity()} onClick={handleOnSubmit}
                        class="btn btn-success join-item">Crea evento
                </button>
                <button type="button" onClick={handleReset} class="btn btn-secondary btn-outline join-item">Cancella
                    selezione
                </button>
                <button type="button" onClick={() => {
                            configStore.newEvent.set(false);
                            // Clean up localStorage when canceling
                            localStorage.removeItem("store_incident_level");
                        }}
                        class="btn btn-error btn-outline join-item">Annulla
                    creazione
                </button>
            </div>
        </div>
    )
}

export default CategoriesInput
