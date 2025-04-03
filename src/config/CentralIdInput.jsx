import {configStore} from "../store/configStore.js";
import {createSignal} from "solid-js";
import {buttonHoverColors, borderColors} from "../theme/bg.js";

function CentralIdInput() {
    const [id, setId] = createSignal("");
    const ids = ["SRA", "SRL", "SRM", "SRP", "GLOBALE"]; // List of mock IDs

    // Split the IDs into top row, middle (GLOBALE), and bottom row
    const topRowIds = ids.slice(0, 2); // SRA, SRL
    const middleId = "GLOBALE";
    const bottomRowIds = ids.slice(2, 4); // SRM, SRP

    const handleSelectId = (selectedId) => {
        setId(selectedId);
        // Immediately submit when a button is clicked
        configStore.central.set(selectedId);
    }

    return (
        <div class="fixed inset-0 flex items-center justify-center">
            <div class="flex flex-col items-center justify-center gap-8">
                <h2 class="uppercase text-accent text-3xl font-bold mb-8 pb-2 border-b-2 border-gray-300">Seleziona Centrale</h2>

                {/* Top row - 2 buttons */}
                <div class="flex gap-8 justify-center">
                    {topRowIds.map((centralId) => (
                        <button
                            key={centralId}
                            type="button"
                            onClick={() => handleSelectId(centralId)}
                            class={`btn ${id() === centralId ? 'btn-primary' : 'btn-outline'} 
                            px-8  text-lg shadow-md hover:shadow-lg 
                            transform transition-all duration-200 hover:scale-105 
                             ${borderColors[centralId]} 
                            ${buttonHoverColors[centralId]}`}
                        >
                            {centralId}
                        </button>
                    ))}
                </div>

                {/* Middle - GLOBALE button */}
                <div class="flex justify-center my-2">
                    <button
                        key={middleId}
                        type="button"
                        onClick={() => handleSelectId(middleId)}
                        class={`btn ${id() === middleId ? 'btn-primary' : 'btn-outline'} 
                        px-8  text-lg shadow-md hover:shadow-lg 
                        transform transition-all duration-200 hover:scale-105 
                         ${borderColors[middleId]} 
                        ${buttonHoverColors[middleId]}`}
                    >
                        {middleId}
                    </button>
                </div>

                {/* Bottom row - 2 buttons */}
                <div class="flex gap-8 justify-center">
                    {bottomRowIds.map((centralId) => (
                        <button
                            key={centralId}
                            type="button"
                            onClick={() => handleSelectId(centralId)}
                            class={`btn ${id() === centralId ? 'btn-primary' : 'btn-outline'} 
                            px-8  text-lg shadow-md hover:shadow-lg 
                            transform transition-all duration-200 hover:scale-105 
                             ${borderColors[centralId]} 
                            ${buttonHoverColors[centralId]}`}
                        >
                            {centralId}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CentralIdInput;
