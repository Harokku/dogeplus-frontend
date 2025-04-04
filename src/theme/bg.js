/**
 * Theme constants for the application.
 * This file contains color definitions used throughout the application for consistent styling.
 */

/**
 * Background color constants for UI elements.
 * Used for indicating normal and selected states of elements.
 */
export const bgColor = Object.freeze({
    NORMAL: "bg-gray-200",    // Default background for unselected elements
    SELECTED: "bg-orange-700", // Background for selected elements
})

/**
 * Text color constants for UI elements.
 * Used for consistent text styling across the application.
 */
export const textColor = {
    NORMAL: "text-gray-700",  // Default text color
}

/**
 * Button hover color constants for different categories.
 * Each category has a specific hover color for visual distinction.
 *
 * SRA: Servizio Risposta Allarme (Alarm Response Service)
 * SRL: Servizio Risposta Locale (Local Response Service)
 * SRM: Servizio Risposta Mobile (Mobile Response Service)
 * SRP: Servizio Risposta Prioritaria (Priority Response Service)
 * GLOBALE: Global response category
 */
export const buttonHoverColors = Object.freeze({
    SRA: "hover:bg-yellow-500",  // Yellow hover for Alarm Response Service
    SRL: "hover:bg-blue-500",    // Blue hover for Local Response Service
    SRM: "hover:bg-red-500",     // Red hover for Mobile Response Service
    SRP: "hover:bg-green-500",   // Green hover for Priority Response Service
    GLOBALE: "hover:bg-purple-500", // Purple hover for Global category
})

/**
 * Border color constants for different categories.
 * Each category has a specific border color for visual distinction.
 * The hover state removes the border for a cleaner look when interacting.
 */
export const borderColors = Object.freeze({
    SRA: "border-4 border-yellow-500 hover:border-none",  // Yellow border for Alarm Response Service
    SRL: "border-4 border-blue-500 hover:border-none",    // Blue border for Local Response Service
    SRM: "border-4 border-red-500 hover:border-none",     // Red border for Mobile Response Service
    SRP: "border-4 border-green-500 hover:border-none",   // Green border for Priority Response Service
    GLOBALE: "border-4 border-purple-500 hover:border-none", // Purple border for Global category
})

/**
 * Background color constants for assessment cards in different swimlanes.
 * These colors represent different incident levels or categories in the assessment view.
 * Colors are defined in OKLCH format for better color perception and accessibility.
 *
 * ALLARME: Alarm level (light blue)
 * EMERGENZA: Emergency level (blue)
 * BIANCA: White level (off-white) - Lowest severity
 * VERDE: Green level (green) - Low severity
 * GIALLA: Yellow level (yellow) - Medium severity
 * ROSSA: Red level (red) - High severity
 */
export const assessmentCardBG = Object.freeze({
    ALLARME: "oklch(60.9% 0.126 221.723)",    // Light Blue for Alarm level
    EMERGENZA: "oklch(54.6% 0.245 262.881)",  // Blue for Emergency level
    BIANCA: "oklch(86.9% 0.005 56.366)",      // Off-white for White level (lowest severity)
    VERDE: "oklch(62.7% 0.194 149.214)",      // Green for Green level (low severity)
    GIALLA: "oklch(79.5% 0.184 86.047)",      // Yellow for Yellow level (medium severity)
    ROSSA: "oklch(63.7% 0.237 25.331)",       // Red for Red level (high severity)
})
