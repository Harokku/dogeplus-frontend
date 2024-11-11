
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
    backendURL: `https://${baseUrl}/api/${apiVersion}`,
    wsUrl: `wss://${baseUrl}/api/${apiVersion}/ws`,
}