import {createMemo, createSignal} from "solid-js";
import {getColor, getTextColor, lightenColor} from "../utils/colorsHelper.js";
import {configStore} from "../store/configStore.js";
import {assessmentCardBG} from "../theme/bg.js";

function AssessmentCard(props) {
    const [dragging, setDragging] = createSignal(false)

    const onDragStart = (event) => {
        event.dataTransfer.setData("cardId", props.id);
        event.dataTransfer.effectAllowed = 'move'
        // Reduce the opacity of the card for a better view context
        event.currentTarget.style.opacity = "0.4"
        setDragging(true)
    }

    const onDragEnd = (event) => {
        event.currentTarget.style.opacity = "1";
        setDragging(false)
    }

    // Compute percentage reactively
    const percentage = createMemo(() => {
        return Math.round((props.completion.completed / props.completion.total) * 100);
    });

    // Get background color based on swimlane
    const swimlaneBackgroundColor = createMemo(() => {
        // Convert swimlane name to uppercase to match the keys in assessmentCardBG
        const swimlaneKey = props.swimlane ? props.swimlane.toUpperCase() : 'BIANCA';
        // Use the corresponding background color from assessmentCardBG
        return assessmentCardBG[swimlaneKey] || assessmentCardBG.BIANCA;
    });

    // For the progress bar, still use the completion percentage
    const progressBarColor = createMemo(() => getColor(percentage()));

    // For text color, use a contrasting color based on the swimlane background
    const textColor = createMemo(() => getTextColor(swimlaneBackgroundColor()));

    // Handle click to set event number and display associated tasks
    const handleClick = () => {
        configStore.eventNr.set(props.event)
    }

    return (
        <div
            id={props.id}
            draggable={true}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            class={`bg-white rounded-lg p-4 m-2 shadow-md transform ${dragging() ? 'cursor-grabbing scale-95' : 'cursor-grab'} hover:scale-105 transition-transform duration-300`}
            style={{
                border: `3px solid ${progressBarColor()}`,
                "background-color": `${swimlaneBackgroundColor()}`,
                color: textColor(),
            }}
            onClick={handleClick}
        >
            <h3 class="font-semibold text-xl mb-2">{`${props.location} - ${props.location_detail}`}</h3>
            <div class="flex flex-col items-start mb-4">
                <p class="flex justify-between w-full">Evento: <span class="text-lg">{props.event}</span></p>
                <p class="flex justify-between w-full">Tipo: <span class="text-lg capitalize">{props.type}</span></p>
            </div>
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
            {console.log(getTextColor("13% 0.028 261.692"))}
            {console.log(getTextColor("97.7% 0.017 320.058"))}
        </div>
    );
}

export default AssessmentCard;
