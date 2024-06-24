import {createSignal} from "solid-js";

function AssessmentCard({id, title, body}) {
    const [dragging, setDragging] = createSignal(false)

    const onDragStart = (event) => {
        event.dataTransfer.setData("cardId", id);
        event.dataTransfer.effectAllowed = 'move'
        // Reduce the opacity of the card for a better view context
        event.currentTarget.style.opacity = "0.4"
        setDragging(true)
    }

    const onDragEnd = (event) => {
        event.currentTarget.style.opacity = "1";
        setDragging(false)
    }

    const completedCount = 10
    const totalCount = 21

    return (
        <div
            id={id}
            draggable={true}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            class={`bg-white rounded-md p-4 m-2 pb-0 shadow-lg ${dragging() ? 'cursor-grabbing' : 'cursor-grab'}`}>
            <h3 class="font-semibold text-xl mb-2">{title}</h3>
            <p>{body}</p>
            <div class={"flex items-center justify-between"}>
                <span class={"text-sm"}>Completato</span>
                <div class={"h-1 mx-2 flex-grow bg-gray-300"}>
                    <div
                        class="h-1 "
                        style={{
                            "background-color": `${completedCount / totalCount > 0.5 ? 'green' : 'red'}`,
                            "width": `${(completedCount / totalCount) * 100}%`
                        }}
                    >
                    </div>
                </div>
                <span class={"text-sm"}>50%</span>
            </div>
        </div>
    );
}

export default AssessmentCard;