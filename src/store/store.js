import {createEffect, createRoot, createSignal} from 'solid-js';

/**
 * A frozen object containing keys for various storage values.
 * @type {Object}
 * @property {string} USERNAME - The key for the username storage value.
 * @property {string} CENTRAL - The key for the central storage value.
 * @property {string} CATEGORIES - The key for the categories storage value.
 */
const storageKeys = Object.freeze({
    USERNAME: 'store_username',
    CENTRAL: 'store_central',
    CATEGORIES: 'store_categories',
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
let store = createRoot(() => {
    const [username, setUsername] = createSignal(getFromStorage(storageKeys.USERNAME, null));
    const [central, setCentral] = createSignal(getFromStorage(storageKeys.CENTRAL, null));
    const [categories, setCategories] = createSignal(getFromStorage(storageKeys.CATEGORIES, null));

    // persist the username
    createEffect(() => {
        localStorage.setItem(storageKeys.USERNAME, JSON.stringify(username()));
    })

    // persist centralID
    createEffect(() => {
        localStorage.setItem(storageKeys.CENTRAL, JSON.stringify(central()));
    })

    // persist the categories
    createEffect(() => {
        localStorage.setItem(storageKeys.CATEGORIES, JSON.stringify(categories()));
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

        categories: {
            get value() {
                return categories()
            },
            set: setCategories,
        },

        getCurrentStep: () => {
            if (username() === null) {
                return 'username'
            }
            if (central() === null) {
                return 'central'
            }
            if (categories() === null) {
                return 'categories'
            }
            return 'finished'
        },
    };
});

export default store;