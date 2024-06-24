import { createSignal } from "solid-js";

export function createStore() {
    // our reactive state
    const [state, setState] = createSignal([
        { id: '1', name: 'Allarme', cards: [{id: 'card1', title: 'Card 1', body: 'Some text'}] },
        { id: '2', name: 'Emergenza', cards: [{id: 'card2', title: 'Card 2', body: 'Some text'}, {id: 'card3', title: 'Card 3', body: 'Some text'}] },
        { id: '3', name: 'Incidente', cards: [{id: 'card4', title: 'Card 4', body: 'Some text'}] },
    ]);

    // methods to interact with the state
    return {
        getState: () => state(),
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