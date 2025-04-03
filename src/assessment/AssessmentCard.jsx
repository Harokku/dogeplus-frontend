/**
 * Assessment Card Component
 * 
 * This component renders a draggable card representing an event in the assessment view.
 * Each card displays information about an event, including:
 * - Location and location details
 * - Event number
 * - Event type
 * - Task completion progress
 * 
 * The card's background color is determined by its swimlane (severity level),
 * and the text color is automatically adjusted for optimal contrast.
 * The card can be dragged between swimlanes to change its severity level.
 * Clicking on a card selects that event for detailed task viewing.
 */
import {createMemo, createSignal} from "solid-js";
import {getColor, getTextColor, lightenColor} from "../utils/colorsHelper.js";
import {configStore} from "../store/configStore.js";
import {assessmentCardBG} from "../theme/bg.js";

/**
 * Renders a draggable assessment card for an event.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the card
 * @param {string} props.event - Event number
 * @param {string} props.location - Primary location of the event
 * @param {string} props.location_detail - Detailed location information
 * @param {string} props.type - Type of event
 * @param {string} props.swimlane - Current swimlane/severity level of the event
 * @param {Object} props.completion - Task completion information
 * @param {number} props.completion.completed - Number of completed tasks
 * @param {number} props.completion.total - Total number of tasks
 * @returns {JSX.Element} The assessment card UI
 */
function AssessmentCard(props) {
    /**
     * State to track whether the card is currently being dragged.
     * Used to apply visual feedback during drag operations.
     */
    const [dragging, setDragging] = createSignal(false)

    /**
     * Handles the start of a drag operation.
     * Sets the card ID in the drag data and applies visual feedback.
     * 
     * @param {DragEvent} event - The drag start event
     */
    const onDragStart = (event) => {
        event.dataTransfer.setData("cardId", props.id);
        event.dataTransfer.effectAllowed = 'move'
        // Reduce the opacity of the card for a better view context
        event.currentTarget.style.opacity = "0.4"
        setDragging(true)
    }

    /**
     * Handles the end of a drag operation.
     * Restores the card's visual appearance.
     * 
     * @param {DragEvent} event - The drag end event
     */
    const onDragEnd = (event) => {
        event.currentTarget.style.opacity = "1";
        setDragging(false)
    }

    /**
     * Computes the task completion percentage.
     * 
     * @returns {number} The percentage of completed tasks (0-100)
     */
    const percentage = createMemo(() => {
        return Math.round((props.completion.completed / props.completion.total) * 100);
    });

    /**
     * Determines the background color based on the card's swimlane.
     * Uses predefined colors from the theme for different severity levels.
     * 
     * @returns {string} The OKLCH color value for the card's background
     */
    const swimlaneBackgroundColor = createMemo(() => {
        // Convert swimlane name to uppercase to match the keys in assessmentCardBG
        const swimlaneKey = props.swimlane ? props.swimlane.toUpperCase() : 'BIANCA';
        // Use the corresponding background color from assessmentCardBG
        return assessmentCardBG[swimlaneKey] || assessmentCardBG.BIANCA;
    });

    /**
     * Determines the color for the progress bar based on completion percentage.
     * Uses a red-to-green gradient based on the percentage.
     * 
     * @returns {string} The RGB color value for the progress bar
     */
    const progressBarColor = createMemo(() => getColor(percentage()));

    /**
     * Determines the text color for optimal contrast with the background.
     * Returns either black or white depending on the background brightness.
     * 
     * @returns {string} The hex color value for the text (#000000 or #FFFFFF)
     */
    const textColor = createMemo(() => getTextColor(swimlaneBackgroundColor()));

    /**
     * Handles click events on the card.
     * Sets the selected event number in the config store to view its tasks.
     */
    const handleClick = () => {
        configStore.eventNr.set(props.event)
    }

    /**
     * Renders the assessment card with event information and completion progress.
     * The card has the following features:
     * - Draggable behavior for moving between swimlanes
     * - Visual feedback during drag operations
     * - Background color based on swimlane/severity
     * - Text color that adjusts for optimal contrast
     * - Progress bar showing task completion percentage
     * - Click behavior to select the event
     */
    return (
        <div
            id={props.id}
            draggable={true}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            // Apply different styles based on drag state and add hover effects
            class={`bg-white rounded-lg p-4 m-2 shadow-md transform ${dragging() ? 'cursor-grabbing scale-95' : 'cursor-grab'} hover:scale-105 transition-transform duration-300`}
            style={{
                // Border color based on completion percentage
                border: `3px solid ${progressBarColor()}`,
                // Background color based on swimlane
                "background-color": `${swimlaneBackgroundColor()}`,
                // Text color for optimal contrast with background
                color: textColor(),
            }}
            onClick={handleClick}
        >
            {/* Event location header */}
            <h3 class="font-semibold text-xl mb-2">{`${props.location} - ${props.location_detail}`}</h3>

            {/* Event details section */}
            <div class="flex flex-col items-start mb-4">
                <p class="flex justify-between w-full">Evento: <span class="text-lg">{props.event}</span></p>
                <p class="flex justify-between w-full">Tipo: <span class="text-lg capitalize">{props.type}</span></p>
            </div>

            {/* Task completion progress bar */}
            <div class="flex items-center justify-between w-full">
                <span class="text-sm">Completato</span>
                <div class="h-1 mx-2 flex-grow bg-gray-300 rounded-full overflow-hidden">
                    <div
                        class="h-1 rounded-full"
                        style={{
                            "background-color": progressBarColor(),
                            "width": `${percentage()}%`
                        }}
                    ></div>
                </div>
                <span class="text-sm">{percentage()}%</span>
            </div>
            {/* Debug logs for text color calculation - can be removed */}
            {/* {console.log(getTextColor("13% 0.028 261.692"))}
            {console.log(getTextColor("97.7% 0.017 320.058"))} */}
        </div>
    );
}

export default AssessmentCard;
