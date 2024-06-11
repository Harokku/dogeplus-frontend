function AssessmentCard({id, title, body}) {

    const onDragStart = (event)=>{
        event.dataTransfer.setData("cardId", id);
    }

    return (
        <div
            id={id}
            draggable={true}
            onDragStart={onDragStart}
            class="bg-white rounded-md p-4 m-2 shadow-lg">
            <h3 class="font-semibold text-xl mb-2">{title}</h3>
            <p>{body}</p>
        </div>
    );
}

export default AssessmentCard;