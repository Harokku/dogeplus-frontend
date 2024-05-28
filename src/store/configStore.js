import {createEffect, createRoot, createSignal} from 'solid-js';

/**
 * A frozen object containing keys for various storage values.
 * @type {Object}
 * @property {string} USERNAME - The key for the username storage value.
 * @property {string} CENTRAL - The key for the central storage value.
 * @property {string} EVENTNR - The key for the event number value.
 * @property {string} CATEGORIES - The key for the categories storage value.
 * @property {string} INCREATION - The key for the new event creation status
 */
const storageKeys = Object.freeze({
    USERNAME: 'store_username',
    CENTRAL: 'store_central',
    EVENTNR: 'store_eventnr',
    CATEGORIES: 'store_categories',
    NEWEVENT: 'store_newevent',
})

/**
 * Immutable object representing the configuration step.
 *
 * @constant
 * @type {Object}
 * @property {string} USERNAME - The username configuration step.
 * @property {string} CENTRAL - The central configuration step.
 * @property {string} EVENTNR - The event number configuration step.
 * @property {string} FINISHED - The end of config process
 * @property {string} NEWEVENT - The new event creation step
 */
const configStep = Object.freeze({
    USERNAME: 'username',
    CENTRAL: 'central',
    EVENTNR: 'eventnr',
    NEWEVENT: 'newevent',
    FINISHED: 'finished',
})


/**
 * Retrieve a value from localStorage with the specified key.
 * If no value is found, return the defaultValue.
 *
 * @param {string} key - The key to look up in localStorage.
 * @param {*} defaultValue - The value to return if no stored value is found.
 * @returns {*} - The retrieved value from localStorage or the defaultValue.
 */
const getFromStorage = (key, defaultValue) => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
}

/**
 * Represents a store object with persisted data.
 *
 * @typedef {Object} Store
 * @property {Object} username - The username property.
 * @property {string} username.value - The current value of the username.
 * @property {function} username.set - Sets the value of the username.
 * @property {Object} central - The central property.
 * @property {string} central.value - The current value of the central.
 * @property {function} central.set - Sets the value of the central.
 * @property {Object} categories - The categories property.
 * @property {Array} categories.value - The current value of the categories.
 * @property {function} categories.set - Sets the value of the categories.
 */
let configStore = createRoot(() => {
    const [username, setUsername] = createSignal(getFromStorage(storageKeys.USERNAME, null));
    const [central, setCentral] = createSignal(getFromStorage(storageKeys.CENTRAL, null));
    const [eventNr, setEventNr] = createSignal(getFromStorage(storageKeys.EVENTNR, null));
    const [categories, setCategories] = createSignal(getFromStorage(storageKeys.CATEGORIES, null));
    const [newEvent, setNewEvent] = createSignal(getFromStorage(storageKeys.NEWEVENT, false))

    // persist the username
    createEffect(() => {
        localStorage.setItem(storageKeys.USERNAME, JSON.stringify(username()));
    })

    // persist centralID
    // automatically clear subsequent config values if this change
    let prevCentral = central() // Storing previous value to be checked inside effect
    createEffect(() => {
        // If central has changed, clear out event number and categories
        if (central() !== prevCentral) {
            setEventNr(null)
            setCategories(null)
        }

        // Update prev central for next check
        prevCentral = central()

        // Update localstorage with new value
        localStorage.setItem(storageKeys.CENTRAL, JSON.stringify(central()));
    })

    // persist event  umber
    createEffect(() => {
        localStorage.setItem(storageKeys.EVENTNR, JSON.stringify(eventNr()));
    })

    // persist the categories
    createEffect(() => {
        localStorage.setItem(storageKeys.CATEGORIES, JSON.stringify(categories()));
    })

    // persist new event in creation
    createEffect(() => {
        localStorage.setItem(storageKeys.NEWEVENT, JSON.stringify(newEvent()));
    })

    return {
        username: {
            get value() {
                return username()
            },
            set: setUsername,
        },

        central: {
            get value() {
                return central()
            },
            set: setCentral,
        },

        eventNr: {
            get value() {
                return eventNr()
            },
            set: setEventNr,
        },

        categories: {
            get value() {
                return categories()
            },
            set: setCategories,
        },

        newEvent: {
            get value() {
                return newEvent()
            },
            set: setNewEvent,
        },

        getCurrentStep: () => {
            if (username() === null) {
                return configStep.USERNAME
            }
            if (central() === null) {
                return configStep.CENTRAL
            }
            if (eventNr() === null) {
                return configStep.EVENTNR
            }
            if (newEvent() === true) {
                return configStep.NEWEVENT
            }
            return configStep.FINISHED
        },
    };
});

// export default configStore;

export {configStore, configStep};