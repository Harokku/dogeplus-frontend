import {createMemo, createSignal} from "solid-js";
import {getColor, getTextColor, lightenColor} from "../utils/colorsHelper.js";
import {configStore} from "../store/configStore.js";

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

    // Compute percentage and colors reactively
    const percentage = createMemo(() => {
        return Math.round((props.completion.completed / props.completion.total) * 100);
    });
    const backgroundColor = createMemo(() => getColor(percentage()));
    const lighterBackgroundColor = createMemo(() => lightenColor(backgroundColor(), 80));
    const textColor = createMemo(() => getTextColor(lighterBackgroundColor()));

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
                border: `3px solid ${backgroundColor()}`,
                "background-color": `${lighterBackgroundColor()}`,
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
                            "background-color": getColor(percentage()),
                            "width": `${percentage()}%`
                        }}
                    ></div>
                </div>
                <span class="text-sm">{percentage()}%</span>
            </div>
        </div>
    );
}

export default AssessmentCard;