/**
 * Escalation Levels Definitions Service
 * 
 * This file provides functionality for retrieving escalation level definitions from the backend.
 * Escalation levels represent different severity categories for incidents:
 * 
 * Main levels:
 * - Allarme (Alarm): Initial alert level
 * - Emergenza (Emergency): Elevated alert with potential danger
 * - Incidente (Incident): Confirmed incident requiring emergency plan activation
 * 
 * Incident sub-levels (based on number of people involved):
 * - Bianca (White): Up to 10 people
 * - Verde (Green): 11-20 people
 * - Gialla (Yellow): 21-50 people
 * - Rossa (Red): More than 50 people
 */
import {config} from "./config.js";
import {createDataService} from "./dataService.js";

/**
 * Returns mock escalation level definitions for testing purposes.
 * This version only includes the main levels without the incident sub-levels.
 * 
 * @returns {Object} An object containing mock escalation level data with the following properties:
 *   - data: Array of escalation level objects with name and description
 *   - length: Number of escalation levels
 *   - result: Status message
 */
function getMockData() {
    return ({
        "data": [
            {
                name: "Allarme",
                description: "Evento che NON presenti immediatamente caratteristiche tali da configurare una situazione di maxiemergenza o per il quale non vi siano notizie dirette immediatamente disponibili"
            },
            {
                name: "Emergenza",
                description: "Evento CON notizie dirette da cui si desume uno stato di potenziale pericolo e la presenza di soggetti coinvolti ma che necessita di una conferma"
            },
            {
                name: "Incidente",
                description: "Evento dannoso per i soggetti coinvolti in cui si rende necessario attivare il PIM (Piano Interno Maxiemergenza"
            }
        ],
        "length": 3,
        "result": "Retrieved escalation levels definitions"
    })
}

/**
 * Fetches escalation level definitions from the backend API.
 * Currently returns mock data, but should be implemented to fetch from the backend.
 * This version includes both main levels and incident sub-levels.
 * 
 * @async
 * @returns {Promise<Object>} A promise that resolves to the escalation level data
 * @todo Implement actual backend API call instead of returning mock data
 */
async function getBackEndData() {
    // TODO: Implement backend logic
    return ({
        "data": [
            {
                name: "Allarme",
                description: "Evento che NON presenti immediatamente caratteristiche tali da configurare una situazione di maxiemergenza o per il quale non vi siano notizie dirette immediatamente disponibili"
            },
            {
                name: "Emergenza",
                description: "Evento CON notizie dirette da cui si desume uno stato di potenziale pericolo e la presenza di soggetti coinvolti ma che necessita di una conferma"
            },
            {
                name: "Incidente",
                description: "Evento dannoso per i soggetti coinvolti in cui si rende necessario attivare il PIM (Piano Interno Maxiemergenza"
            },
            {name: "Bianca", description: "Fino a ( <= ) 10 coinvolti"},
            {name: "Verde", description: "Da 21 a 20 coinvolti"},
            {name: "Gialla", description: "Da 11 a 50 coinvolti"},
            {name: "Rossa", description: "Oltre ( > ) 50 coinvolti"},
        ],
        "length": 3,
        "result": "Retrieved escalation levels definitions"
    })
}

/**
 * Service function for retrieving escalation level definitions.
 * 
 * This function uses the createDataService utility to create a service that will:
 * - Use real backend data when in production mode
 * - Fall back to mock data when in development mode or if the backend is unavailable
 * 
 * @function getEscalationLevelsDefinitions
 * @returns {Promise<Object>} A promise that resolves to the escalation level definitions data
 */
export const getEscalationLevelsDefinitions = createDataService(getBackEndData, getMockData)
