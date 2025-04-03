/**
 * Test script to verify the getTextColor function with OKLCH color values.
 * 
 * This script tests the getTextColor utility function which determines whether
 * black or white text should be used for optimal contrast against a given background color.
 * The function is tested with various OKLCH color values to ensure proper contrast
 * calculation across different color brightness levels.
 */
import { getTextColor } from './src/utils/colorsHelper.js';

/**
 * First test set: OKLCH values in percentage format
 * These values test the parser's ability to handle raw OKLCH values without the 'oklch()' wrapper.
 * - 14.7% 0.004 49.25: A very dark color (should return white text)
 * - 97.7% 0.017 320.058: A very light color (should return black text)
 */
console.log("Testing OKLCH values from issue description:");
console.log("getTextColor(\"14.7% 0.004 49.25\") =", getTextColor("14.7% 0.004 49.25"));
console.log("getTextColor(\"97.7% 0.017 320.058\") =", getTextColor("97.7% 0.017 320.058"));

/**
 * Second test set: OKLCH values in standard format
 * These values test the parser's ability to handle the full 'oklch()' format.
 * The values correspond to the assessmentCardBG colors used in the application:
 * - 60.9% 0.126 221.723: Blue (ALLARME)
 * - 54.6% 0.245 262.881: Purple (EMERGENZA)
 * - 92.3% 0.003 48.717: Off-white (BIANCA)
 * - 62.7% 0.194 149.214: Green (VERDE)
 * - 79.5% 0.184 86.047: Yellow (GIALLA)
 * - 63.7% 0.237 25.331: Red (ROSSA)
 */
console.log("\nTesting assessmentCardBG values:");
console.log("getTextColor(\"oklch(60.9% 0.126 221.723)\") =", getTextColor("oklch(60.9% 0.126 221.723)"));
console.log("getTextColor(\"oklch(54.6% 0.245 262.881)\") =", getTextColor("oklch(54.6% 0.245 262.881)"));
console.log("getTextColor(\"oklch(92.3% 0.003 48.717)\") =", getTextColor("oklch(92.3% 0.003 48.717)"));
console.log("getTextColor(\"oklch(62.7% 0.194 149.214)\") =", getTextColor("oklch(62.7% 0.194 149.214)"));
console.log("getTextColor(\"oklch(79.5% 0.184 86.047)\") =", getTextColor("oklch(79.5% 0.184 86.047)"));
console.log("getTextColor(\"oklch(63.7% 0.237 25.331)\") =", getTextColor("oklch(63.7% 0.237 25.331)"));
