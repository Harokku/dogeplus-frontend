import {config} from "./config.js";
import {createDataService, createUpdateDataService} from "./dataService.js";
import {configStore} from "../store/configStore.js";

function getMockData() {
    return ({
        "data": [{
            id: '1', name: 'Allarme', cards: [{
                id: 'card1', event: '243112345', location: 'Villa Guardia', location_detail: '', type: 'stradale'
            }]
        }, {
            id: '2', name: 'Emergenza', cards: [{
                id: 'card2', event: '24316543', location: 'Varese', location_detail: 'Via Gasparotto', type: 'sociali'
            }, {id: 'card3', event: '24318473', location: 'Desio', location_detail: '', type: 'ferroviario'}]
        }, {
            id: '3', name: 'Incidente', cards: [{
                id: 'card4',
                event: '243198433',
                location: 'Lecco',
                location_detail: 'Fiocchi munizioni',
                type: 'esplosione'
            }]
        },], "length": 3, "result": "Retrieved al monitored events"
    })
}

// TODO: Implement backend logic
async function getBackEndData() {
    // Overview data fetching
    const dataUrl = `${config.backendURL}/escalation_aggregation/details/${configStore.central.value}`
    const responseData = await fetch(dataUrl, {
        method: 'GET',
        headers: {
            "accept": "application/json",
        }
    })
    if (!responseData.ok) {
        throw new Error(responseData.statusText);
    }

    const data = await responseData.json()

    // Completion ratio data fetching
    const completionUrl = `${config.backendURL}/completion_aggregation`
    const responseCompletion = await fetch(completionUrl, {
        method: 'GET',
        headers: {
            "accept": "application/json",
        }
    })
    if (!responseCompletion.ok) {
        throw new Error(responseCompletion.statusText);
    }
    const completionData = await responseCompletion.json()

    // transform data to requested format and return it
    return transformResponse(data, completionData)
}

/**
 * Capitalizes the first character of the given string.
 *
 * @param {string} str - The string to capitalize.
 * @return {string} The capitalized string.
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Transforms the server response to the predefined structure.
 *
 * @param {Object} serverResponse - The response object from the server.
 * @param {Array} serverResponse.data - An array of data objects received from the server.
 * @param {string} serverResponse.result - The result status from the server.
 * @return {Object} The transformed response containing the predefined levels and grouped data.
 */
function transformResponse(serverResponse, completionData) {
    const {data, result} = serverResponse;

    // Predefined levels
    const predefinedLevels = [
        {id: '1', name: 'Allarme', cards: []},
        {id: '2', name: 'Emergenza', cards: []},
        {id: '3', name: 'Incidente', cards: []}
    ];

    const groupedData = data.reduce((acc, item) => {
        if (!acc[item.level]) {
            acc[item.level] = [];
        }
        acc[item.level].push(item);
        return acc;
    }, {});

    // Populate cards for each predefined level
    const transformedData = predefinedLevels.map((level) => {
        return {
            id: level.id,
            name: level.name,
            cards: (groupedData[level.name.toLowerCase()] || []).map((item) => ({
                id: item.uuid, // Populate 'id' with 'uuid' field.
                event: item.event_number.toString(), // Convert 'event_number' to string.
                location: item.location,
                location_detail: item.location_detail,
                type: item.type,
                central_id: item.central_id, // Add the 'central_id' field.
                completion: completionData[item.event_number]
            }))
        };
    });

    return {
        data: transformedData,
        length: transformedData.length, // Update length based on transformed data.
        result: result
    };
}

async function postBackEndData(data) {
    const url = `${config.backendURL}/escalation_aggregation/${data.direction}`
    const response = await fetch(url, {
        method: 'POST',
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
 * Retrieves an overview of events by invoking a data service function.
 * The data service function is created using the provided back-end and mock data retrieval functions.
 *
 * The behavior of `getEventOverview` can switch between real back-end data and mock data
 * based on the implementation of the provided data retrieval functions.
 *
 * @type {Function}
 */
export const getEventOverview = createDataService(getBackEndData, getMockData)

export const postEscalateEvent = createUpdateDataService(postBackEndData)

