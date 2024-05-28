// Re-export specific data fetching function
export * from "./eventNumberService.js";
export * from "./activeEventService.js";
export * from "./updateTaskService.js";
export * from "./categoriesService.js";

/**
 * Creates a data service that returns backend data or mock data based on the provided parameters.
 *
 * @param {function} getBackendData - The function to get the data from the backend.
 * @param {function} getMockData - The function to get the mock data.
 * @return {function} - A function that returns the data.
 */
export function createDataService(getBackendData, getMockData) {
    return async function (useMock = false) {
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
}

/**
 * Creates a service for updating data in the backend.
 * @param {function} updateBackendData - A function that updates data in the backend.
 * @return {function} - A function that updates data in the backend and returns a result object.
 */
export function createUpdateDataService(updateBackendData) {
    return async function (data, useMock = false) {
        try {
            if (useMock) {
                return {
                    result: true, data: {
                        "Result": "Event Task Updated",
                        "Events": "Updated data",
                    }
                }
            } else {
                const updatedData = await updateBackendData(data)
                return {result: true, data: updatedData}
            }
        } catch (error) {
            console.error(error)
            return {result: false, error}
        }
    }
}