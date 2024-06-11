import {createSignal} from "solid-js";
import SingleSwimlane from "./SingleSwimlane.jsx";

function Swimlane() {
    const [data, setData] = createSignal([
        { id: 1, name: 'Swimlane 1', cards: [{title: 'Card 1', body: 'Some text'}] },
        { id: 2, name: 'Swimlane 2', cards: [{title: 'Card 2', body: 'Some text'}, {title: 'Card 3', body: 'Some text'}] },
        { id: 3, name: 'Swimlane 3', cards: [{title: 'Card 4', body: 'Some text'}] },
    ]);

    return (
        <div class="flex justify-between">
            {data().map(lane =>
                <SingleSwimlane {...lane} />
            )}
        </div>
    );
}

export default Swimlane;