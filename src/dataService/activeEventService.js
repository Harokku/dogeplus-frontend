import {config} from "./config.js";
import {configStore} from "../store/configStore.js";
import {createDataService, createUpdateDataService} from "./dataService.js";

function getMockData() {
    return ({
        "Result": "Event Found",
        "Tasks": [
            {
                "uuid": "344dc041-edc2-44ce-b279-a4ca6e66e0e5",
                "event_number": 18,
                "event_date": "2024-05-21T12:50:07.602086+02:00",
                "central_id": "SRP",
                "priority": 5,
                "title": "Title 13",
                "description": "Description 13",
                "role": "Role 13",
                "status": "working",
                "modified_by": "Alfio",
                "ip_address": "121.1.18.4",
                "timestamp": "2024-05-21T12:50:07.602086+02:00"
            },
            {
                "uuid": "f34d1c43-5f19-4d12-82e5-096e459ed9c6",
                "event_number": 18,
                "event_date": "2024-05-21T12:50:07.602582+02:00",
                "central_id": "SRP",
                "priority": 2,
                "title": "Title 11",
                "description": "Description 11",
                "role": "Role 11",
                "status": "done",
                "modified_by": "",
                "ip_address": "",
                "timestamp": "2024-05-21T12:50:07.602582+02:00"
            },
            {
                "uuid": "16e53f9f-1b77-41ca-943f-e562ca6e39e7",
                "event_number": 18,
                "event_date": "2024-05-21T12:50:07.602614+02:00",
                "central_id": "SRP",
                "priority": 6,
                "title": "Title 12",
                "description": "Description 12",
                "role": "Role 12",
                "status": "notdone",
                "modified_by": "",
                "ip_address": "",
                "timestamp": "2024-05-21T12:50:07.602614+02:00"
            },
            {
                "uuid": "d38d0e55-521e-449c-98df-f93b280f525e",
                "event_number": 18,
                "event_date": "2024-05-21T12:50:07.602636+02:00",
                "central_id": "SRP",
                "priority": 6,
                "title": "Title 14",
                "description": "Description 14",
                "role": "Role 14",
                "status": "notdone",
                "modified_by": "",
                "ip_address": "",
                "timestamp": "2024-05-21T12:50:07.602636+02:00"
            },
            {
                "uuid": "76000f3e-1841-4f5e-a43f-a5d22a02fb6f",
                "event_number": 18,
                "event_date": "2024-05-21T12:50:07.602653+02:00",
                "central_id": "SRP",
                "priority": 2,
                "title": "Title 4",
                "description": "Description 4",
                "role": "Role 13",
                "status": "notdone",
                "modified_by": "",
                "ip_address": "",
                "timestamp": "2024-05-21T12:50:07.602654+02:00"
            }
        ]
    })
}

async function getBackendData() {
    // Check if central and eventNr values are properly initialized
    if (!configStore.central.value || !configStore.eventNr.value) {
        console.error('Central or Event Number not initialized');
        throw new Error('Configuration not complete: Central or Event Number missing');
    }

    const url = `${config.backendURL}/active-events/${configStore.central.value}/${configStore.eventNr.value}`
    console.log(`Fetching data from: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            },
            // Add a timeout to prevent long-hanging requests
            signal: AbortSignal.timeout(10000) // 10 second timeout
        })

        if (!response.ok) {
            throw new Error(response.statusText)
        }

        return await response.json()
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        throw error;
    }
}

function postMockData() {
    return ({
        "Result": "Ok",
    })
}

async function postBackendData(data) {
    const url = `${config.backendURL}/active-events`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
        },
        body: JSON.stringify(data)
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }
    return await response.json()
}

async function postBackendOverviewData(data) {
    const url = `${config.backendURL}/active-events/overview`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
        },
        body: JSON.stringify(data)
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }
    return await response.json()
}

/**
 * Creates a function called getActiveEvent that returns active event data.
 *
 * @function getActiveEvents
 *
 * @param {Function} getBackendData - The function to retrieve data from the backend.
 * @param {Function} getMockData - The function to retrieve mock data for testing.
 *
 * @returns {Function} - The getActiveEvents function.
 */

export const getActiveEvent = createDataService(getBackendData, getMockData)

/**
 * Creates a new event using the provided backend data and returns a DataService instance.
 *
 * @param {object} postBackendData - The backend data to be used for creating the event.
 * @returns {Function} - An instance of DataService that allows performing CRUD operations on the newly created event.
 */
export const postCreteNewEvent = createUpdateDataService(postBackendData)

/**
 * The `postCreateNewOverview` constant holds a service function that manages the creation and updating of overview data.
 * This function is created by passing `postBackendOverviewData` to the `createUpdateDataService` function.
 * `postBackendOverviewData` handles the backend interaction for posting overview data, while `createUpdateDataService`
 * wraps this interaction with additional services such as validation or logging.
 *
 * @constant {Function} postCreateNewOverview
 */
export const postCreateNewOverview = createUpdateDataService(postBackendOverviewData)
