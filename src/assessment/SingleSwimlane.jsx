import AssessmentCard from "./AssestmentCard.jsx";
import {createSignal, onMount} from "solid-js";
import {getEscalationLevelsDefinitions} from "../dataService/escalationLevelsDefinitionsService.js";

function SingleSwimlane({id, name, cards, store}) {
    const [tooltipData, setTooltipData] = createSignal(null)
    const [fetchError, setFetchError] = createSignal(false)

    // Data fetch
    // If tooltipData is already set skip data fetching and return
    const fetchData = async () => {
        // Check if tooltipData is set and return
        if (tooltipData() !== null) return

        // Actually fetch data
        const response = await getEscalationLevelsDefinitions(parseEnvToBoolean(import.meta.env.VITE_MOCK) || false)
        if (response.result) {
            // Find element that match props.name
            const levelDefinition = response.data.data.find(item => item.name === name)
            // If Found set the tooltip data with the description
            if (levelDefinition) {
                setTooltipData(levelDefinition.description)
            }
        } else {
            setFetchError(true)
        }
    }

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
            <div class={"flex justify-center relative"}>
                {/*Swimlane add button*/}
                <div class={"absolute left-0 ml-2 h-6 w-6 cursor-pointer tooltip tooltip-bottom tooltip-primary"}
                     data-tip={`Aggiungi ${name}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                         stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                    </svg>
                </div>

                {/*Swimlane title*/}
                <h2 class="text-center font-bold">{name}</h2>

                {/*Swimlane info tooltip*/}
                <div onMouseEnter={fetchData} class={"absolute right-0 mr-2 h-6 w-6 cursor-help tooltip tooltip-left tooltip-info"} data-tip={tooltipData()}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                         stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"/>
                    </svg>
                </div>
            </div>
            {cards.map(cardData => <AssessmentCard key={cardData.id} {...cardData} />)}
        </div>
    );
}

export default SingleSwimlane;