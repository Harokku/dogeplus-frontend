
/**
 * The base URL for the server.
 *
 *const baseUrl= 'localhost:3000'
 * @type {string}
 */
const baseUrl = import.meta.env.VITE_BASE_URL;

/**
 * Represents the version of the API.
 *
 * const apiVersion= 'v1'
 * @type {string}
 */
const apiVersion = import.meta.env.VITE_API_VERSION;

/**
 * A boolean variable that indicates whether the application is running in production mode.
 *
 * This variable is determined by comparing the application's environment mode with the string 'production'.
 * If the environment mode is 'production', `isProduction` will be true; otherwise, it will be false.
 */
const isProduction = import.meta.env.MODE === 'production';


/**
 * Configuration object containing URLs for backend and WebSocket connections.
 *
 * @typedef {Object} config
 * @property {string} backendURL - URL for the backend HTTP API.
 *                                 It uses HTTPS if in a production environment, otherwise HTTP.
 * @property {string} wsUrl - URL for the WebSocket connection.
 *                            It uses WSS if in a production environment, otherwise WS.
 */
export const config = {
    backendURL: `${isProduction ? 'https' : 'http'}://${baseUrl}/api/${apiVersion}`,
    wsUrl: `${isProduction ? 'wss' : 'ws'}://${baseUrl}/api/${apiVersion}/ws`,
}