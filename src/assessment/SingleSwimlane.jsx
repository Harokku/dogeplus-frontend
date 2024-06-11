import AssessmentCard from "./AssestmentCard.jsx";

function SingleSwimlane({name, cards}) {
    return (
        <div class="w-full border mx-2 p-4">
            <h2 class="text-center font-bold">{name}</h2>
            {cards.map(card => <AssessmentCard {...card} />)}
        </div>
    );
}

export default SingleSwimlane;