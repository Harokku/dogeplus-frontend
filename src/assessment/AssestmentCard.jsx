function AssessmentCard({title, body}) {
    return (
        <div class="bg-white rounded-md p-4 m-2 shadow-lg">
            <h3 class="font-semibold text-xl mb-2">{title}</h3>
            <p>{body}</p>
        </div>
    );
}

export default AssessmentCard;