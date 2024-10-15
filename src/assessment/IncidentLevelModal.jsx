function IncidentLevelModal({ onSelect, onCancel }) {
    const incidentLevels = ['bianca', 'verde', 'gialla', 'rossa'];

    const handleSelect = (level) => {
        onSelect(level);
    };

    return (
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 class="text-xl font-bold mb-4">Select Incident Level</h2>
                <div class="flex justify-between">
                    {incidentLevels.map(level => (
                        <div
                            class="p-2 border rounded cursor-pointer hover:bg-gray-200"
                            onClick={() => handleSelect(level)}
                        >
                            {level}
                        </div>
                    ))}
                </div>
                <button class="mt-4 px-4 py-2 bg-red-500 text-white rounded" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default IncidentLevelModal;