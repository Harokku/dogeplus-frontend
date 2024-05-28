import {config} from "./config.js";
import {createDataService} from "./dataService.js";

function getMockData() {
    return ({
        "data": [
            "SRL",
            "SRM",
            "HQ"
        ],
        "length": 3,
        "result": "Retrieved categories"
    })
}

async function getBackendData(){
    const url = `${config.backendURL}/tasks`
    const response = await fetch(url, {
        method: 'GET',
        headers:{
            'accept': 'application/json',
        }
    })
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return await response.json()
}

/**
 * Creates a data service for retrieving categories.
 *
 * @function createDataService
 * @param {Function} getBackendData - Function that retrieves data from the backend.
 * @param {Function} getMockData - Function that retrieves mock data for testing.
 * @returns {Function} - Data service function that can be used to get categories.
 */
export const getCategories = createDataService(getBackendData, getMockData)