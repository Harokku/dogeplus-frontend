import {config} from "./config.js";
import {createDataService} from "./dataService.js";

function getMockData(){
    return ({
        "data":[
            {name: "Allarme", description:"Evento che NON presenti immediatamente caratteristiche tali da configurare una situazione di maxiemergenza o per il quale non vi siano notizie dirette immediatamente disponibili"},
            {name: "Emergenza", description: "Evento CON notizie dirette da cui si desume uno stato di potenziale pericolo e la presenza di soggetti coinvolti ma che necessita di una conferma"},
            {name: "Incidente", description: "Evento dannoso per i soggetti coinvolti in cui si rende necessario attivare il PIM (Piano Interno Maxiemergenza"}
        ],
        "length": 3,
        "result": "Retrieved escalation levels definitions"
    })
}

// TODO: Implement backend logic
async function getBackEndData(){
    return null
}

export const getEscalationLevelsDefinitions = createDataService(getBackEndData, getMockData)
