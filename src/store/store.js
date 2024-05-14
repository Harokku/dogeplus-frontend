import {createSignal} from 'solid-js';

let store = (() => {
    const [username, setUsername] = createSignal('');
    const [central, setCentral] = createSignal('');
    const [categories, setCategories] = createSignal([]);

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

        categories:{
            get value(){
                return categories()
            },
            set: setCategories,
        },
    };
})();

export default store;