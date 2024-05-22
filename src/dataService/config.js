
/**
 * The base URL for the server.
 * @type {string}
 */
const baseUrl= 'http://localhost:3000'

/**
 * Represents the version of the API.
 *
 * @type {string}
 */
const apiVersion= 'v1'

/**
 * Configuration object.
 * @typedef {Object} Config
 * @property {string} backendURL - The backend URL.
 */
export const config = {
    backendURL: `${baseUrl}/api/${apiVersion}`,
}