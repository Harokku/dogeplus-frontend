import {createSignal, For, onMount, Show} from "solid-js";
import {configStore} from "../store/configStore.js";
import {getCategories} from "../dataService/categoriesService.js";
import {bgColor, textColor} from "../theme/bg.js";
import {postCreateNewOverview, postCreteNewEvent} from "../dataService/activeEventService.js";
import {addNotification, notificationPriorities} from "../store/notificationStore.js";
import {parseEnvToBoolean} from "../utils/varCasting.js";

function ItemSelection() {
    const [selectedItems, setSelectedItems] = createSignal([])
    const [categories, setCategories] = createSignal(null)
    const [eventNumber, setEventNumber] = createSignal(null)
    const [fetchError, setFetchError] = createSignal(false)
    const [location, setLocation] = createSignal(null)
    const [locationDetail, setLocationDetail] = createSignal(null)
    const PRO22= 'PRO22'

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
        setSelectedItems(selectedItems().includes(PRO22) ? [PRO22] : []);
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

        // Call backend and create the event
        const data = {
            categories: categoryToPost,
            event_number: eventNumber(),
            central_id: configStore.central.value,
            escalation_level: localStorage.getItem("store_escalation"),
        }

        const overviewData = {
            central_id: configStore.central.value,
            event_number: eventNumber(),
            location: location(),
            location_detail: locationDetail(),
            type: categoryToPost,
            level: localStorage.getItem("store_escalation")
        }

        // If form si valid submit data to backend
        if (formValidity()) {
            const response = await postCreteNewEvent(data)

            // Add new overview
            const overviewResponse = postCreateNewOverview(overviewData)

            if (response.result) {
                configStore.eventNr.set(null)
                configStore.newEvent.set(false)
            } else {
                addNotification("Errore durante la creazione maxi", notificationPriorities.ERROR)
            }
        }

    }

    // Check form validity
    const formValidity = () => {
        const items = selectedItems();
        const number = eventNumber();

        const itemsAreValid = Array.isArray(items) && items.length > 0;
        const numberIsValid = typeof number === "number" && number > 0;

        return itemsAreValid && numberIsValid;
    }

    // TODO: Add selection for incidentLevel in case of Incident

    return (
        <div class="fixed inset-0 flex flex-col items-center justify-center">
            <Show when={!fetchError()}
                  fallback={<p>Nessuna categoria trovata</p>}
            >
                <h1>Crea nuovo monitoraggio di livello {localStorage.getItem("store_escalation")}</h1>
                <br/>

                <input type="text" placeholder="Numero evento"
                       onInput={(e) => {
                           const newValue = e.target.value.replace(/\D/g, '');
                           setEventNumber(parseInt(newValue))
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

                Seleziona categorie
                <For each={categories()} fallback={<div>Loading...</div>}>
                    {(category) => (
                        <div key={category} onClick={() => handleOnChange(category)}
                             class={"flex items-center justify-center my-1 cursor-pointer p-2 rounded " + (selectedItems().includes(category) ? bgColor.SELECTED : bgColor.NORMAL)}>
                            <p class={"font-bold" + textColor.NORMAL}>{category}</p>
                        </div>
                    )}
                </For>
            </Show>
            <div class="join mt-6">
                <button type="button" disabled={!formValidity()} onClick={handleOnSubmit}
                        class="btn btn-success join-item">Crea evento
                </button>
                <button type="button" onClick={handleReset} class="btn btn-secondary btn-outline join-item">Cancella
                    selezione
                </button>
                <button type="button" onClick={() => configStore.newEvent.set(false)}
                        class="btn btn-error btn-outline join-item">Annulla
                    creazione
                </button>
            </div>
        </div>
    )
}

export default ItemSelection