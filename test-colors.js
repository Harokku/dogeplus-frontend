// Test script to verify the getTextColor function with OKLCH values
import { getTextColor } from './src/utils/colorsHelper.js';

// Test with the OKLCH values mentioned in the issue description
console.log("Testing OKLCH values from issue description:");
console.log("getTextColor(\"14.7% 0.004 49.25\") =", getTextColor("14.7% 0.004 49.25"));
console.log("getTextColor(\"97.7% 0.017 320.058\") =", getTextColor("97.7% 0.017 320.058"));

// Test with the assessmentCardBG values
console.log("\nTesting assessmentCardBG values:");
console.log("getTextColor(\"oklch(60.9% 0.126 221.723)\") =", getTextColor("oklch(60.9% 0.126 221.723)"));
console.log("getTextColor(\"oklch(54.6% 0.245 262.881)\") =", getTextColor("oklch(54.6% 0.245 262.881)"));
console.log("getTextColor(\"oklch(92.3% 0.003 48.717)\") =", getTextColor("oklch(92.3% 0.003 48.717)"));
console.log("getTextColor(\"oklch(62.7% 0.194 149.214)\") =", getTextColor("oklch(62.7% 0.194 149.214)"));
console.log("getTextColor(\"oklch(79.5% 0.184 86.047)\") =", getTextColor("oklch(79.5% 0.184 86.047)"));
console.log("getTextColor(\"oklch(63.7% 0.237 25.331)\") =", getTextColor("oklch(63.7% 0.237 25.331)"));
