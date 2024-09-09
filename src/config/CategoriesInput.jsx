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

    // Data fetching
    onMount(async () => {
        const response = await getCategories(parseEnvToBoolean(import.meta.env.VITE_MOCK) || false)
        if (response.result) {
            setCategories(response.data.data)
        } else {
            setFetchError(true)
        }
    })

    // When an item is clicked, add or remove it from selection array
    const handleOnChange = (category) => {
        let selected = selectedItems().slice();
        const targetIndex = selected.indexOf(category);

        if (targetIndex === -1)
            selected.push(category);
        else
            selected.splice(targetIndex, 1);

        setSelectedItems(selected);
    }

    // Clear the selected items array
    const handleReset = (e) => {
        if (e) e.preventDefault();
        // Clear the array
        setSelectedItems([])
    }

    // Save on store and create the new event
    const handleOnSubmit = async (e) => {
        if (e) e.preventDefault();
        // Save the selected items in store
        configStore.categories.set(selectedItems());
        // Call backend and create the event
        const data = {
            categories: selectedItems(),
            event_number: eventNumber(),
            central_id: configStore.central.value
        }

        const overviewData = {
            central_id: configStore.central.value,
            event_number: eventNumber(),
            location: location(),
            location_detail: locationDetail(),
            type: selectedItems()[1],
            level: localStorage.getItem("store_escalation")
        }

        // If form si valid submit data to backend
        if (formValidity()) {
            // FIXME: remove console logs
            const response = await postCreteNewEvent(data)
            console.log(response)

            // Add new overview
            console.log(overviewData)
            const overviewResponse = postCreateNewOverview(overviewData)
            console.log(overviewResponse)

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
                            <p class={"font-bold" + (textColor.NORMAL)}>{category}</p>
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