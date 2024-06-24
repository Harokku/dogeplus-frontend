import {config} from "./config.js";
import {createDataService} from "./dataService.js";

function getMockData() {
    return ({
        "data": [
            {
                id: '1',
                name: 'Allarme',
                cards: [{
                    id: 'card1',
                    event: '243112345',
                    location: 'Villa Guardia',
                    location_detail: '',
                    type: 'stradale'
                }]
            },
            {
                id: '2',
                name: 'Emergenza',
                cards: [{
                    id: 'card2',
                    event: '24316543',
                    location: 'Varese',
                    location_detail: 'Via Gasparotto',
                    type: 'sociali'
                }, {id: 'card3', event: '24318473', location: 'Desio', location_detail: '', type: 'ferroviario'}]
            },
            {
                id: '3',
                name: 'Incidente',
                cards: [{
                    id: 'card4',
                    event: '243198433',
                    location: 'Lecco',
                    location_detail: 'Fiocchi munizioni',
                    type: 'esplosione'
                }]
            },
        ],
        "length": 3,
        "result": "Retrieved al monitored events"
    })
}

// TODO: Implement backend logic
async function getBackEndData() {
    return null
}

export const getEventOverview = createDataService(getBackEndData, getMockData)

