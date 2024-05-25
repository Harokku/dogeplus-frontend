import {config} from "./config.js";
import {createUpdateDataService} from "./dataService.js";

/**
 * Updates data in the backend.
 *
 * @param {Object} data - The data to update in the backend. required fields are uuid ,status, modified_by
 * @return {Promise} - A Promise resolving to the updated data from the backend.
 * @throws {Error} - If the response from the backend is not successful.
 */
async function updateBackendData(data) {
    const url = `${config.backendURL}/active-events`
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
        },
        body: JSON.stringify(data)
    })
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return await response.json()
}

/**
 * A function that updates the active event by calling the provided updateBackendData function.
 *
 * @param {function} updateBackendData - A function that performs the backend data update.
 * @returns {function} - The updateActiveEvent function.
 */
export const updateActiveEvent = createUpdateDataService(updateBackendData)