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
            let lanes = state();
            let card;
            let initialLaneId;

            // Find and remove card from its current lane
            lanes = lanes.map(lane => {
                lane.cards = lane.cards.filter(cardData => {
                    if (cardData.id === cardId) {
                        card = cardData;
                        initialLaneId = lane.id;
                        return false;
                    }
                    return true;
                })
                return lane;
            })

            // If no lane id is found
            if (!initialLaneId) {
                console.error('Card not found in any lane');
                return;
            }

            // If the card is dropped in the same lane, no move occurred
            if (laneId === initialLaneId) {
                console.log('No move occurred. No backend call will be made.');
                return;
            }

            // Determine the action (escalation or deescalation)
            const action = laneId > initialLaneId ? 'escalate' : 'deescalate';

            // Find new lane name for constructing backend data
            const newLaneName = lanes.find(lane => lane.id === laneId)?.name?.toLowerCase();
            if (!newLaneName) {
                console.error('New lane not found');
                return;
            }

            // Prepare data for backend call
            const backendData = {
                eventNumber: parseInt(card.event),
                newLevel: newLaneName,
                direction: action,
            }

            // Add incidentLevel if provided and the lane is 'incidente'
            if (newLaneName === 'incidente' && incidentLevel) {
                backendData.incidentLevel = incidentLevel;
            }

            // Call backend to persist the change
            const response = await postEscalateEvent(backendData);
            if (response && response.result) {
                // Add card to new lane
                lanes = lanes.map(lane => {
                    if (lane.id === laneId) {
                        lane.cards.push(card);
                    }
                    return lane;
                });
                // Update the state with new lanes
                setState(lanes);
            } else {
                addNotification("Errore durante l'escalation", notificationPriorities.ERROR)
            }
        },
        updateEventTotalTasks: (eventNumber, addedTasks) => {
            // Get the current state
            const lanes = state();

            // Map through the lanes and update the relevant card
            const updatedLanes = lanes.map(lane => {
                return {
                    ...lane,
                    cards: lane.cards.map(card => {
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
                    }),
                };
            });

            // Update the state with the new lanes
            setState(updatedLanes);
        }
    }
}