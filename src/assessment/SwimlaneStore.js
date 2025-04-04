/**
 * SwimlaneStore.js
 * 
 * This file implements a store for managing swimlanes in the assessment view.
 * It provides functionality for initializing swimlane data, moving cards between lanes,
 * and updating task information for events.
 * 
 * The store uses SolidJS's createSignal for reactive state management and
 * handles the complex logic of card movement between different severity levels.
 */
import {createSignal} from "solid-js";
import {postEscalateEvent} from "../dataService/eventOverviewService.js";
import {addNotification, notificationPriorities} from "../store/notificationStore.js";

/**
 * Creates and returns a store for managing swimlane state.
 * 
 * @returns {Object} An object containing methods to interact with the swimlane state.
 */
export function createStore() {
    // Create a reactive state array to hold the swimlane data
    const [state, setState] = createSignal([]);

    // Return methods to interact with the state
    return {
        /**
         * Returns the current state of the swimlanes.
         * 
         * @returns {Array} The current swimlane state.
         */
        getState: () => state(),

        /**
         * Initializes the store with provided swimlane data.
         * 
         * @param {Array} data - The initial swimlane data to set in the store.
         */
        initializeStore: (data) => {
            setState(data)
        },

        /**
         * Moves a card from one lane to another, handling the complex logic of
         * escalation and de-escalation between different severity levels.
         * 
         * @param {string} cardId - The ID of the card to move.
         * @param {string} laneId - The ID of the destination lane.
         * @param {string|null} incidentLevel - The incident level section ID if moving to an incident lane.
         * @returns {Promise<void>} - A promise that resolves when the move operation is complete.
         */
        moveCardToLane: async (cardId, laneId, incidentLevel = null) => {
            let lanes = state(); // Get the current lanes
            let card; // To store the card being moved
            let initialLaneId; // The original lane where the card was found
            let initialSectionId = null; // The original section within a lane (if applicable)

            // Find and remove card from its current lane
            lanes = lanes.map(lane => {
                // Check top-level cards in the swimlane
                lane.cards = lane.cards.filter(cardData => {
                    if (cardData.id === cardId) {
                        card = cardData;
                        initialLaneId = lane.id;
                        return false; // Remove the card from the lane
                    }
                    return true;
                })

                // Check sections within the swimlane
                if (lane.sections) {
                    lane.sections = lane.sections.map(section => {
                        section.cards = section.cards.filter(cardData => {
                            if (cardData.id === cardId) {
                                card = cardData;
                                initialLaneId = lane.id;
                                initialSectionId = section.id;
                                return false; // Remove the card from the section
                            }
                            return true;
                        });
                        return section;
                    });
                }

                return lane;
            })

            // If the card was not found in any lane or section
            if (!initialLaneId) {
                console.error('Card not found in any lane');
                return;
            }

            // If the card is dropped in the same lane, no move occurred
            if (laneId === initialLaneId && incidentLevel === initialSectionId) {
                console.log('No move occurred. No backend call will be made.');
                return;
            }

            // Determine the action (escalation or deescalation)
            let action;

            /**
             * Severity order mapping for all levels.
             * This defines the hierarchy of severity from lowest (10) to highest (60).
             * Used to determine if a card move is an escalation or de-escalation.
             * 
             * Main swimlanes:
             * - allarme (10): Alarm level
             * - emergenza (20): Emergency level
             * 
             * Incidente sublanes (in ascending severity):
             * - bianca (30): White level (lowest severity)
             * - verde (40): Green level
             * - gialla (50): Yellow level
             * - rossa (60): Red level (highest severity)
             */
            const severityOrder = {
                // Main swimlanes
                'allarme': 10,
                'emergenza': 20,
                // Incidente sublanes
                'bianca': 30,
                'verde': 40,
                'gialla': 50,
                'rossa': 60
            };

            /**
             * Compares two severity levels and returns their difference.
             * A positive result indicates an escalation, negative indicates de-escalation.
             * 
             * @param {string} level1 - The first severity level to compare.
             * @param {string} level2 - The second severity level to compare.
             * @returns {number} - The difference between severity levels.
             */
            const compareSeverity = (level1, level2) => {
                return severityOrder[level1] - severityOrder[level2];
            };

            // Find lane objects
            const originalLane = lanes.find(lane => lane.id === initialLaneId);
            const newLane = lanes.find(lane => lane.id === laneId);

            // Get lane names
            const originalLaneName = originalLane?.name?.toLowerCase();
            const newLaneName = newLane?.name?.toLowerCase();


            if (!newLaneName) {
                console.error('New lane not found');
                return;
            }

            // Special case: If both lanes are 'incidente', determine action based on incident levels directly
            if (laneId === initialLaneId && laneId === '3') {
                // Both are incidente lanes, compare incident levels directly
                const originalLevel = initialSectionId || 'bianca';
                const newLevel = incidentLevel || 'bianca';

                // Use the severityOrder to compare the incident levels
                const levelDiff = severityOrder[newLevel] - severityOrder[originalLevel];
                action = levelDiff > 0 ? 'escalate' : 'deescalate';
            } else {
                // Normal case: Determine severity levels based on lane names and section IDs
                // Determine the original severity level and ID
                let originalSeverityId;
                if (originalLaneName === 'incidente' && initialSectionId) {
                    // For incidente, use the section ID
                    originalSeverityId = initialSectionId;
                } else {
                    // For other swimlanes, use the swimlane name
                    originalSeverityId = originalLaneName;
                }

                // Determine the new severity level and ID
                let newSeverityId;
                if (newLaneName === 'incidente') {
                    // For incidente, use the section ID
                    newSeverityId = incidentLevel || 'bianca';
                } else {
                    // For other swimlanes, use the swimlane name
                    newSeverityId = newLaneName;
                }

                // Determine action based on severity comparison
                const severityDiff = compareSeverity(newSeverityId, originalSeverityId);
                action = severityDiff > 0 ? 'escalate' : 'deescalate';
            }


            // Prepare data for backend call
            const backendData = {
                eventNumber: parseInt(card.event),
                newLevel: newLaneName,
                direction: action,
            }

            // Add incidentLevel if the lane is 'incidente'
            if (newLaneName === 'incidente') {
                // Use provided incidentLevel or default to 'bianca' if not provided
                backendData.incidentLevel = incidentLevel || 'bianca';
            }

            // Call the backend to persist the change
            const response = await postEscalateEvent(backendData);
            if (response && response.result) {
                // Add the card to the new lane or section
                lanes = lanes.map(lane => {
                    if (lane.id === laneId) {
                        // For incidente lane, always add to a section
                        if (lane.name.toLowerCase() === 'incidente') {
                            // Use provided incidentLevel or default to 'bianca'
                            const targetSectionId = incidentLevel || 'bianca';
                            lane.sections = lane.sections.map(section => {
                                if (section.id === targetSectionId) {
                                    section.cards.push(card);
                                }
                                return section;
                            });
                        } else {
                            // For other lanes, add to the top-level cards
                            lane.cards.push(card);
                        }
                    }
                    return lane;
                });

                // Update the state with the modified lanes
                setState(lanes);
            } else {
                addNotification("Errore durante l'escalation", notificationPriorities.ERROR);
            }

        },
        /**
         * Updates the total number of tasks for a specific event across all swimlanes.
         * This method finds all cards with the matching event number and updates their
         * completion.total property by adding the specified number of tasks.
         * 
         * @param {number} eventNumber - The event number to update.
         * @param {number} addedTasks - The number of tasks to add to the current total.
         */
        updateEventTotalTasks: (eventNumber, addedTasks) => {
            // Get the current state
            const lanes = state();

            // Map through the lanes and update the relevant card
            const updatedLanes = lanes.map(lane => {
                // Update cards in the top-level cards array
                const updatedCards = lane.cards.map(card => {
                    if (parseInt(card.event) === eventNumber) {
                        // Update the total tasks in the completion field
                        return {
                            ...card,
                            completion: {
                                ...card.completion,
                                total: card.completion.total + addedTasks
                            }
                        };
                    }
                    return card;
                });

                // If the lane has sections (like incidente), update cards in each section
                let updatedSections = lane.sections;
                if (lane.sections) {
                    updatedSections = lane.sections.map(section => {
                        const updatedSectionCards = section.cards.map(card => {
                            if (parseInt(card.event) === eventNumber) {
                                // Update the total tasks in the completion field
                                return {
                                    ...card,
                                    completion: {
                                        ...card.completion,
                                        total: card.completion.total + addedTasks
                                    }
                                };
                            }
                            return card;
                        });
                        return { ...section, cards: updatedSectionCards };
                    });
                }

                return {
                    ...lane,
                    cards: updatedCards,
                    sections: updatedSections
                };
            });

            // Update the state with the new lanes
            setState(updatedLanes);
        }
    }
}
