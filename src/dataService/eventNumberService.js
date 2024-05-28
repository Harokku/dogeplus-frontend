import {config} from "./config.js";
import {configStore} from "../store/configStore.js";
import {createDataService} from "./dataService.js";

function getMockData() {
    return ({
        "Events": [
            2430110112, 2430110113, 2430110114
        ],
        "Result": "Multiple events found",
        "Tasks": null
    })
}

async function getBackendData() {
    const url = `${config.backendURL}/active-events/${configStore.central.value}`
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
        },
    })
    if (!response.ok && response.status !== 300) {
        throw new Error(response.statusText)
    }
    return await response.json()
}

/**
 * Creates a function called getActiveEvents that returns active events data.
 *
 * @function getActiveEvents
 *
 * @param {Function} getBackendData - The function to retrieve data from the backend.
 * @param {Function} getMockData - The function to retrieve mock data for testing.
 *
 * @returns {Function} - The getActiveEvents function.
 */
export const getActiveEvents = createDataService(getBackendData, getMockData)