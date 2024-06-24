import {createSignal} from "solid-js";

export function createStore() {
    // our reactive state
    const [state, setState] = createSignal([]);

    // methods to interact with the state
    return {
        getState: () => state(),
        initializeStore: (data) => {
            setState(data)
        },
        moveCardToLane: (cardId, laneId) => {
            let lanes = state();
            let card;

            // Find and remove card from its current lane
            lanes = lanes.map(lane => {
                lane.cards = lane.cards.filter(cardData => {
                    if (cardData.id === cardId) {
                        card = cardData;
                        return false;
                    }
                    return true;
                })
                return lane;
            })

            // Add card to new lane
            lanes = lanes.map(lane => {
                if (lane.id === laneId) {
                    lane.cards.push(card);
                }
                return lane;
            });

            setState(lanes);
        }
    }
}