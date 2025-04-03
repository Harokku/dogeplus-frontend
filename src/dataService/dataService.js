/**
 * Data Service Module
 * 
 * This module provides utility functions for creating data services that handle
 * communication with the backend API. It includes factory functions for creating
 * services that can:
 * 1. Fetch data from the backend with fallback to mock data
 * 2. Update data in the backend with mock support for testing
 * 
 * The module also re-exports all specific data services to provide a centralized
 * entry point for data-related functionality throughout the application.
 */

// Re-export specific data fetching functions for centralized imports
export * from "./eventNumberService.js";
export * from "./activeEventService.js";
export * from "./updateTaskService.js";
export * from "./categoriesService.js";
export * from "./escalationLevelsDefinitionsService.js"
export * from "./eventOverviewService.js"

/**
 * Creates a data service that returns backend data or mock data based on the provided parameters.
 * 
 * This factory function creates a service that will attempt to fetch data from the backend,
 * but can fall back to mock data when:
 * - The useMock parameter is set to true (useful for testing)
 * - The backend request fails (provides graceful degradation)
 *
 * @param {function} getBackendData - The function to get the data from the backend.
 * @param {function} getMockData - The function to get the mock data.
 * @return {function} - A function that returns a promise resolving to an object with:
 *   - result: Boolean indicating success or failure
 *   - data: The fetched data (if successful)
 *   - error: The error object (if failed)
 */
export function createDataService(getBackendData, getMockData) {
    /**
     * The actual data service function that fetches data.
     * 
     * @param {boolean} useMock - Whether to use mock data instead of real backend data.
     * @return {Promise<Object>} - A promise resolving to the result object.
     */
    return async function (useMock = false) {
        try {
            let data
            if (useMock) {
                // Use mock data for testing or development
                data = getMockData()
            } else {
                // Attempt to fetch real data from the backend
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
 * 
 * This factory function creates a service that will attempt to update data in the backend,
 * but can also return mock success responses when:
 * - The useMock parameter is set to true (useful for testing)
 * 
 * Unlike createDataService, this function doesn't require a separate mock function,
 * as it provides a standard mock response internally.
 *
 * @param {function} updateBackendData - A function that updates data in the backend.
 * @return {function} - A function that updates data in the backend and returns a result object.
 */
export function createUpdateDataService(updateBackendData) {
    /**
     * The actual update service function that sends data to the backend.
     * 
     * @param {Object} data - The data to be sent to the backend for updating.
     * @param {boolean} useMock - Whether to use a mock success response instead of calling the backend.
     * @return {Promise<Object>} - A promise resolving to an object with:
     *   - result: Boolean indicating success or failure
     *   - data: The response data from the backend (if successful)
     *   - error: The error object (if failed)
     */
    return async function (data, useMock = false) {
        try {
            if (useMock) {
                // Return a standard mock success response for testing
                return {
                    result: true, 
                    data: {
                        "Result": "Event Task Updated",
                        "Events": "Updated data",
                    }
                }
            } else {
                // Attempt to update data in the backend
                const updatedData = await updateBackendData(data)
                return {result: true, data: updatedData}
            }
        } catch (error) {
            console.error(error)
            return {result: false, error}
        }
    }
}
