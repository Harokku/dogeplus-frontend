import { assessmentCardBG } from "../../theme/bg.js";
import { getTextColor } from "../../utils/colorsHelper.js";
import TaskProgressBar from "./TaskProgressBar.jsx";

/**
 * Component that displays an event card with event details and completion progress
 * 
 * @param {Object} props - Component props
 * @param {string} props.swimlaneKey - Key identifying the swimlane type for styling
 * @param {Object} props.card - Card data containing event details
 * @returns {JSX.Element} - The EventCard component
 */
const EventCard = (props) => {
    const swimlaneKey = props.swimlaneKey.toUpperCase();
    const bgColor = assessmentCardBG[swimlaneKey] || assessmentCardBG.BIANCA;

    return (
        <div class="card shadow-sm p-1 mb-1 rounded-lg text-xs transition-all duration-300 ease-in-out hover:scale-105"
             style={{
                 "background-color": bgColor,
                 "color": getTextColor(bgColor),
             }}>
            <div class="flex justify-between">
                <span class="font-semibold">{props.card.event}</span>
                <span class="text-xs">{props.card.central_id}</span>
            </div>
            <div class="truncate text-2xl capitalize text-center">
                {props.card.location} {props.card.location_detail ? `- ${props.card.location_detail}` : ''}
            </div>
            <div class="text-xl bold text-center">{props.card.type}</div>
            <TaskProgressBar completion={props.card.completion} />
        </div>
    );
};

export default EventCard;