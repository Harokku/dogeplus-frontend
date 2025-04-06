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

async function getBackEndData() {
    try {
        // Overview data fetching
        const dataUrl = `${config.backendURL}/escalation_aggregation/details/${configStore.central.value || ''}`
        const responseData = await fetch(dataUrl, {
            method: 'GET',
            headers: {
                "accept": "application/json",
            }
        })
        if (!responseData.ok) {
            throw new Error(responseData.statusText || 'Failed to fetch data');
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
            throw new Error(responseCompletion.statusText || 'Failed to fetch completion data');
        }
        const completionData = await responseCompletion.json()

        // transform data to requested format and return it
        return transformResponse(data, completionData)
    } catch (error) {
        console.error('Error in getBackEndData:', error);
        // Return empty data structure to prevent null reference errors
        return {
            data: [],
            length: 0,
            result: 'Error fetching data'
        };
    }
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
 * @param completionData - Data about completion level
 * @param {Array} serverResponse.data - An array of data objects received from the server.
 * @param {string} serverResponse.result - The result status from the server.
 * @return {Object} The transformed response containing the predefined levels and grouped data.
 */
function transformResponse(serverResponse, completionData) {
    // Ensure serverResponse is not null or undefined
    serverResponse = serverResponse || {};
    completionData = completionData || {};

    const {data = [], result} = serverResponse;

    // Predefined levels
    const predefinedLevels = [
        {id: '1', name: 'Allarme', cards: []},
        {id: '2', name: 'Emergenza', cards: []},
        {id: '3', name: 'Incidente', cards: [], sections: []}
    ];

    // Initialize the sub-sections for "Incidente"
    const incidentSections = {
        rossa: [],
        gialla: [],
        verde: [],
        bianca: []
    };

    // Check if data is null or undefined, and provide a default empty array
    const groupedData = (data || []).reduce((acc, item) => {
        if (!acc[item.level]) {
            acc[item.level] = [];
        }
        acc[item.level].push(item);
        return acc;
    }, {});


    // Populate cards for each predefined level
    const transformedData = predefinedLevels.map((level) => {
        if (level.id === '3') {
            // Populate the "Incidente" swimlane with subsections
            (groupedData && groupedData['incidente'] ? groupedData['incidente'] : []).forEach((item) => {
                // Ensure item and incident_level are valid
                if (item && item.incident_level && incidentSections && incidentSections[item.incident_level]) {
                    incidentSections[item.incident_level].push({
                        id: item.uuid || '',
                        event: item.event_number ? item.event_number.toString() : '',
                        location: item.location || '',
                        location_detail: item.location_detail || '',
                        type: item.type || '',
                        central_id: item.central_id || '',
                        completion: completionData && item.event_number ? completionData[item.event_number] : null
                    });
                }
            });

            return {
                id: level.id,
                name: level.name,
                cards: [], // Keep `cards` empty for parent lane
                sections: [
                    {id: 'rossa', name: 'Rossa', cards: incidentSections.rossa},
                    {id: 'gialla', name: 'Gialla', cards: incidentSections.gialla},
                    {id: 'verde', name: 'Verde', cards: incidentSections.verde},
                    {id: 'bianca', name: 'Bianca', cards: incidentSections.bianca}
                ]
            };
        } else {
            // Populate other swimlanes normally
            return {
                id: level.id,
                name: level.name,
                cards: (groupedData && groupedData[level.name.toLowerCase()] ? groupedData[level.name.toLowerCase()] : []).map((item) => ({
                    id: item.uuid || '',
                    event: item.event_number ? item.event_number.toString() : '',
                    location: item.location || '',
                    location_detail: item.location_detail || '',
                    type: item.type || '',
                    central_id: item.central_id || '',
                    completion: completionData && item.event_number ? completionData[item.event_number] : null
                }))
            };
        }
    });


    // Ensure transformedData is not null or undefined
    const finalData = transformedData || [];

    return {
        data: finalData,
        length: finalData.length, // Update length based on transformed data.
        result: result || 'No result'
    };
}

async function postBackEndData(data) {
    // Ensure data is not null or undefined
    if (!data) {
        throw new Error('Data is required');
    }

    // Use the direction from the data object directly
    const direction = data.direction || 'up';

    const url = `${config.backendURL}/escalation_aggregation/${direction}`

    // Create a copy of the data to avoid modifying the original
    const postData = { ...data };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
        },
        body: JSON.stringify(postData)
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
