/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            overflow: ['auto'], // Adds overflow-auto utility class
            whiteSpace: ['nowrap'], // Adds whitespace-nowrap utility class},
        },
    },
    plugins: [
        require("daisyui")
    ],
    daisyui: {
        themes: [
            "autumn",
            {
                default: {
                    ...require("daisyui/src/theming/themes")["autumn"],
                }
            }
        ],
    },
}

