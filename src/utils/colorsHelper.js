/**
 * Generates a color code that transitions from red to green based on the given percentage.
 *
 * @param {number} percentage - A value between 0 and 100 indicating the percentage of the transition.
 * @returns {string} - The resulting color in the format `rgb(r,g,b)`.
 */
export const getColor = (percentage) => {
    // Normalize percentage and divide into the thirds.
    if (percentage < 50) {
        // Transition from red to yellow
        const ratio = percentage / 50;
        const red = 255;
        const green = Math.floor(ratio * 255);
        const blue = 0;
        return `rgb(${red},${green},${blue})`;
    } else {
        // Transition from yellow to green
        const ratio = (percentage - 50) / 50;
        const red = Math.floor(255 * (1 - ratio));
        const green = 255;
        const blue = 0;
        return `rgb(${red},${green},${blue})`;
    }
};

/**
 * Adjusts the lightness of a provided color by a given percentage.
 *
 * @param {string} color - The color to be lightened in hexadecimal format (e.g., "#RRGGBB").
 * @param {number} percent - The percentage by which the color should be lightened. Positive values make the color lighter, while negative values make it darker.
 * @returns {string} - The resulting color in RGB format (e.g., "rgb(R, G, B)").
 */
export const lightenColor = (color, percent) => {
    const rgb = color.match(/\d+/g);
    if (!rgb) {
        return color;
    }
    let [r, g, b] = rgb.map(Number);
    r = Math.min(255, r + Math.round((255 - r) * (percent / 100)));
    g = Math.min(255, g + Math.round((255 - g) * (percent / 100)));
    b = Math.min(255, b + Math.round((255 - b) * (percent / 100)));
    return `rgb(${r},${g},${b})`;
};

/**
 * Determines the appropriate text color (black or white) based on the provided background color.
 *
 * @param {string} backgroundColor - The background color in rgb format, e.g., "rgb(255, 255, 255)".
 * @return {string} The text color that ensures appropriate contrast, either "#000000" for black or "#FFFFFF" for white.
 */
export const getTextColor = (backgroundColor) => {
    const rgb = backgroundColor.match(/\d+/g);
    if (!rgb) return "#000000";
    const [r, g, b] = rgb.map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
};