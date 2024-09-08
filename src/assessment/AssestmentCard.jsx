import {createMemo, createSignal} from "solid-js";
import {getColor, getTextColor, lightenColor} from "../utils/colorsHelper.js";

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

    return (
        <div
            id={props.id}
            draggable={true}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            class={`bg-white rounded-md p-4 m-2 pb-0 shadow-lg ${dragging() ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
                border: `5px solid ${backgroundColor()}`,
                "background-color": `${lighterBackgroundColor()}`,
                color: textColor(),
            }}
        >
            <h3 class="font-semibold text-xl mb-2">{`${props.location} - ${props.location_detail}`}</h3>
            <div class="flex flex-col items-start">
                <p class="flex justify-between w-full">Evento: <span class="text-lg">{props.event}</span></p>
                <p class="flex justify-between w-full">Tipo: <span class="text-lg capitalize">{props.type}</span></p>
            </div>
            <div class={"flex items-center justify-between"}>
                <span class={"text-sm"}>Completato</span>
                <div class={"h-1 mx-2 flex-grow bg-gray-300"}>
                    <div
                        class="h-1 "
                        style={{
                            "background-color": getColor(percentage()),
                            "width": `${percentage()}%`
                        }}
                    >
                    </div>
                </div>
                <span class={"text-sm"}>{percentage()}%</span>
            </div>
        </div>
    );
}

export default AssessmentCard;