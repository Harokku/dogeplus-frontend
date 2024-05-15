import {createSignal} from "solid-js";
import store from "../store/store.js";

function ItemSelection() {
    const [selectedItems, setSelectedItems] = createSignal([]);

    // Mock items array
    const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

    const handleOnChange = (e) => {
        let selected = selectedItems().slice();
        const targetIndex = selected.indexOf(e.target.value);

        if (targetIndex === -1)
            selected.push(e.target.value);
        else
            selected.splice(targetIndex, 1);

        setSelectedItems(selected);
    }

    const handleOnSubmit = (e) => {
        e.preventDefault();
        // Save the selected items in store
        store.categories.set(selectedItems());
    }

    return (
        <form onSubmit={handleOnSubmit}>
            {items.map(item => (
                <label>
                    <input type="checkbox" value={item} onChange={handleOnChange}/>
                    {item}
                </label>
            ))}
            <button type="submit">Next</button>
        </form>
    )
}

export default ItemSelection