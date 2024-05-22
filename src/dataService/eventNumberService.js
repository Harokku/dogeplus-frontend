import {config} from "./config.js";
import {configStore} from "../store/configStore.js";

export async function getActiveEvents(useMock = false) {
    try {
        let data
        if (useMock) {
            data = getMockData()
        } else {
            data = await getBackendData()
        }
        return {result: true, data}
    } catch (error) {
        console.error(error)
        return {result: false, error}
    }
}

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