import { For } from "solid-js";
import EventCard from "./EventCard.jsx";

/**
 * Component that displays a swimlane with multiple event cards organized by sections
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of lane data objects containing cards
 * @returns {JSX.Element} - The QuadrantSwimlane component
 */
const QuadrantSwimlane = (props) => {
    return (
        <div class="h-full">
            <For each={props.data}>
                {(laneData) => (
                    <div class="mb-2">
                        <div class="border border-gray-300 rounded-lg p-1 bg-gray-50">
                            <h3 class="text-sm font-bold text-center">
                                {laneData.central_id ? `${laneData.central_id} - ` : ''}{laneData.name}
                            </h3>
                            <div class="mt-1">
                                <For each={laneData.cards}>
                                    {(card) => {
                                        const swimlane = laneData.swimlane ||
                                            (laneData.name.toLowerCase().includes('allarme') ? 'allarme' :
                                             laneData.name.toLowerCase().includes('emergenza') ? 'emergenza' :
                                             laneData.name.toLowerCase().includes('rossa') ? 'rossa' :
                                             laneData.name.toLowerCase().includes('gialla') ? 'gialla' :
                                             laneData.name.toLowerCase().includes('verde') ? 'verde' : 'bianca');

                                        return <EventCard card={card} swimlaneKey={swimlane} />;
                                    }}
                                </For>
                            </div>
                        </div>
                    </div>
                )}
            </For>
        </div>
    );
};

export default QuadrantSwimlane;