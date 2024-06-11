import AssessmentCard from "./AssestmentCard.jsx";

function SingleSwimlane({id, name, cards, store}) {
    // Define the behavior during the drop event
    const onDrop = (event) => {
        event.preventDefault();

        const cardId = event.dataTransfer.getData("cardId");

        store.moveCardToLane(cardId, id)
    };

    // Define how the swimlane will react to a card being dragged over it
    const onDragOver = (event) => {
        event.preventDefault();
    };

    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            class="w-full border mx-2 p-4"
        >
            <h2 class="text-center font-bold">{name}</h2>
            {cards.map(cardData => <AssessmentCard key={cardData.id} {...cardData} />)}
        </div>
    );
}

export default SingleSwimlane;