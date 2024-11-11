
/**
 * The base URL for the server.
 * @type {string}
 */
// const baseUrl= 'localhost:3000'
const baseUrl= 'dogeplus-backend.onrender.com'

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
    backendURL: `http://${baseUrl}/api/${apiVersion}`,
    wsUrl: `ws://${baseUrl}/api/${apiVersion}/ws`,
}