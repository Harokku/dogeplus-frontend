/**
 * Application Entry Point
 * 
 * This is the main entry file for the DogePlus frontend application.
 * It initializes the SolidJS application and renders the root App component
 * into the DOM element with id 'root'.
 */

/* @refresh reload */
// This directive tells SolidJS's development server to
// perform a full page reload when this file is updated

import { render } from 'solid-js/web'

import './index.css'
import App from './App'

// Get the DOM element where the application will be mounted
const root = document.getElementById('root')

// Render the App component into the root DOM element
// The arrow function wrapper allows SolidJS to properly manage reactivity
render(() => <App />, root)
