/**
 * Categories Service
 * 
 * This file provides functionality for retrieving category data from the backend.
 * It uses the createDataService utility to handle both real API calls and mock data for testing.
 * Categories represent different service types like SRL (Servizio Risposta Locale), 
 * SRM (Servizio Risposta Mobile), etc.
 */
import {config} from "./config.js";
import {createDataService} from "./dataService.js";

/**
 * Returns mock category data for testing purposes.
 * 
 * @returns {Object} An object containing mock category data with the following properties:
 *   - data: Array of category strings
 *   - length: Number of categories
 *   - result: Status message
 */
function getMockData() {
    return ({
        "data": [
            "SRL",  // Servizio Risposta Locale (Local Response Service)
            "SRM",  // Servizio Risposta Mobile (Mobile Response Service)
            "HQ"    // Headquarters
        ],
        "length": 3,
        "result": "Retrieved categories"
    })
}

/**
 * Fetches category data from the backend API.
 * 
 * @async
 * @returns {Promise<Object>} A promise that resolves to the category data from the backend
 * @throws {Error} If the API request fails
 */
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
 * Service function for retrieving categories.
 * 
 * This function uses the createDataService utility to create a service that will:
 * - Use real backend data when in production mode
 * - Fall back to mock data when in development mode or if the backend is unavailable
 * 
 * @function getCategories
 * @returns {Promise<Object>} A promise that resolves to the category data
 */
export const getCategories = createDataService(getBackendData, getMockData)
