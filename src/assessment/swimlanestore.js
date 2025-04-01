import {createSignal} from "solid-js";
import {postEscalateEvent} from "../dataService/eventOverviewService.js";
import {addNotification, notificationPriorities} from "../store/notificationStore.js";

export function createStore() {
    // our reactive state
    const [state, setState] = createSignal([]);

    // methods to interact with the state
    return {
        getState: () => state(),
        initializeStore: (data) => {
            setState(data)
        },
        moveCardToLane: async (cardId, laneId, incidentLevel = null) => {
            let lanes = state() // Get the current lanes;
            let card // To store the card being moved;
            let initialLaneId // The original lane where the card was found
            let initialSectionId = null; // The original section within a lane (if applicable);

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

            // Define severity order for all levels
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

            // Define a function to compare severity levels
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
