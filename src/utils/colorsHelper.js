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
 * @param {string} backgroundColor - The background color in any CSS format (rgb, rgba, hex, hsl, hsla, oklch, named color).
 * @return {string} The text color that ensures appropriate contrast, either "#000000" for black or "#FFFFFF" for white.
 */
export const getTextColor = (backgroundColor) => {
    // Parse the color to get RGB values
    const rgb = parseColorToRgb(backgroundColor);
    if (!rgb) return "#000000";

    const [r, g, b] = rgb;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.4 ? "#000000" : "#FFFFFF";
};

/**
 * Parses a color string in various formats and returns RGB values.
 * 
 * @param {string} color - Color string in any CSS format (rgb, rgba, hex, hsl, hsla, oklch, named color)
 * @return {number[]|null} Array of [r, g, b] values or null if parsing failed
 */
const parseColorToRgb = (color) => {
    if (!color) return null;

    // Normalize color string
    color = color.toLowerCase().trim();

    // Check for hex format
    if (color.startsWith('#')) {
        return parseHexColor(color);
    }

    // Check for rgb/rgba format
    if (color.startsWith('rgb')) {
        return parseRgbColor(color);
    }

    // Check for hsl/hsla format
    if (color.startsWith('hsl')) {
        return parseHslColor(color);
    }

    // Check for oklch format
    if (color.startsWith('oklch')) {
        return parseOklchColor(color);
    }

    // Check for raw OKLCH values (e.g., "14.7% 0.004 49.25")
    // This pattern matches strings with percentage and space-separated values
    if (color.includes('%') && /^[\d.]+%\s+[\d.]+\s+[\d.]+$/.test(color)) {
        return parseOklchColor(`oklch(${color})`);
    }

    // Check for named colors
    const namedColor = NAMED_COLORS[color];
    if (namedColor) {
        return namedColor;
    }

    return null;
};

/**
 * Parses a hex color string and returns RGB values.
 * 
 * @param {string} hex - Hex color string (e.g., "#FFF" or "#FFFFFF")
 * @return {number[]|null} Array of [r, g, b] values or null if parsing failed
 */
const parseHexColor = (hex) => {
    // Remove # if present
    hex = hex.replace('#', '');

    // Convert shorthand hex (e.g., #FFF) to full form (e.g., #FFFFFF)
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    // Check if valid hex
    if (hex.length !== 6) {
        return null;
    }

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return [r, g, b];
};

/**
 * Parses an RGB/RGBA color string and returns RGB values.
 * 
 * @param {string} rgb - RGB/RGBA color string (e.g., "rgb(255, 255, 255)" or "rgba(255, 255, 255, 0.5)")
 * @return {number[]|null} Array of [r, g, b] values or null if parsing failed
 */
const parseRgbColor = (rgb) => {
    const values = rgb.match(/\d+/g);
    if (!values || values.length < 3) {
        return null;
    }

    return values.slice(0, 3).map(Number);
};

/**
 * Parses an HSL/HSLA color string and returns RGB values.
 * 
 * @param {string} hsl - HSL/HSLA color string (e.g., "hsl(0, 100%, 50%)" or "hsla(0, 100%, 50%, 0.5)")
 * @return {number[]|null} Array of [r, g, b] values or null if parsing failed
 */
const parseHslColor = (hsl) => {
    const values = hsl.match(/[\d.]+/g);
    if (!values || values.length < 3) {
        return null;
    }

    // Extract HSL values
    const h = parseFloat(values[0]) / 360;
    const s = parseFloat(values[1]) / 100;
    const l = parseFloat(values[2]) / 100;

    // Convert HSL to RGB
    let r, g, b;

    if (s === 0) {
        // Achromatic (gray)
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

/**
 * Parses an OKLCH color string and returns RGB values.
 * 
 * @param {string} oklch - OKLCH color string (e.g., "oklch(0.5 0.2 240)", "oklch(50% 0.2 240)" or "oklch(0.5 0.2 240 / 0.5)")
 * @return {number[]|null} Array of [r, g, b] values or null if parsing failed
 */
const parseOklchColor = (oklch) => {
    // Check if the string contains percentage for lightness
    const hasPercentage = oklch.includes('%');

    // Extract values using regex that handles both space and comma separators
    const values = oklch.match(/[\d.]+/g);
    if (!values || values.length < 3) {
        return null;
    }

    // Extract OKLCH values
    let l = parseFloat(values[0]); // lightness (0-1 or 0-100%)

    // If lightness is expressed as percentage, convert to 0-1 range
    if (hasPercentage && l > 1) {
        l = l / 100;
    }

    const c = parseFloat(values[1]); // chroma (0-0.4 typically)
    const h = parseFloat(values[2]); // hue (0-360 degrees)

    // Convert OKLCH to RGB
    return oklchToRgb(l, c, h);
};

/**
 * Converts OKLCH values to RGB.
 * 
 * @param {number} l - Lightness (0-1)
 * @param {number} c - Chroma (0-0.4 typically)
 * @param {number} h - Hue (0-360 degrees)
 * @return {number[]} Array of [r, g, b] values (0-255)
 */
const oklchToRgb = (l, c, h) => {
    // Convert hue to radians
    const hRad = h * Math.PI / 180;

    // Convert OKLCH to OKLab
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);

    // Convert OKLab to linear RGB
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

    // Apply non-linearity
    const l_cubed = l_ * l_ * l_;
    const m_cubed = m_ * m_ * m_;
    const s_cubed = s_ * s_ * s_;

    // Convert to linear RGB
    const lr = +4.0767416621 * l_cubed - 3.3077115913 * m_cubed + 0.2309699292 * s_cubed;
    const lg = -1.2684380046 * l_cubed + 2.6097574011 * m_cubed - 0.3413193965 * s_cubed;
    const lb = -0.0041960863 * l_cubed - 0.7034186147 * m_cubed + 1.7076147010 * s_cubed;

    // Convert linear RGB to sRGB
    const r = linearToSrgb(lr);
    const g = linearToSrgb(lg);
    const blue_val = linearToSrgb(lb);

    // Clamp values to 0-255 range
    return [
        Math.max(0, Math.min(255, Math.round(r * 255))),
        Math.max(0, Math.min(255, Math.round(g * 255))),
        Math.max(0, Math.min(255, Math.round(blue_val * 255)))
    ];
};

/**
 * Converts a linear RGB value to sRGB.
 * 
 * @param {number} x - Linear RGB value
 * @return {number} sRGB value (0-1)
 */
const linearToSrgb = (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1/2.4) - 0.055;
};

/**
 * Map of common named colors to their RGB values.
 */
const NAMED_COLORS = {
    'transparent': [0, 0, 0],
    'black': [0, 0, 0],
    'silver': [192, 192, 192],
    'gray': [128, 128, 128],
    'white': [255, 255, 255],
    'maroon': [128, 0, 0],
    'red': [255, 0, 0],
    'purple': [128, 0, 128],
    'fuchsia': [255, 0, 255],
    'green': [0, 128, 0],
    'lime': [0, 255, 0],
    'olive': [128, 128, 0],
    'yellow': [255, 255, 0],
    'navy': [0, 0, 128],
    'blue': [0, 0, 255],
    'teal': [0, 128, 128],
    'aqua': [0, 255, 255],
    'orange': [255, 165, 0],
    'aliceblue': [240, 248, 255],
    'antiquewhite': [250, 235, 215],
    'pink': [255, 192, 203]
};
