import { createMemo, Show } from "solid-js";
import { getColor } from "../../utils/colorsHelper.js";

/**
 * Component that displays a progress bar for task completion
 * 
 * @param {Object} props - Component props
 * @param {Object} props.completion - Completion data with completed and total counts
 * @returns {JSX.Element} - The TaskProgressBar component
 */
const TaskProgressBar = (props) => {
    const percentage = createMemo(() => {
        if (!props.completion) return 0;
        return Math.round((props.completion.completed / props.completion.total) * 100);
    });

    return (
        <Show when={props.completion}>
            <div class="flex items-center gap-2">
                <span class="text-xs">{percentage()}%</span>
                <div class="h-3 flex-1 bg-gray-300 rounded-full overflow-hidden">
                    <div
                        class="h-3 rounded-full transition-all duration-300"
                        style={{
                            "width": `${percentage()}%`,
                            "background-color": getColor(percentage()),
                        }}
                    />
                </div>
            </div>
        </Show>
    );
};

export default TaskProgressBar;