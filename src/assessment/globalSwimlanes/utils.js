/**
 * Transforms the backend data by aggregating cards by central_id.
 *
 * @param {Array} data - The original data from the backend
 * @returns {Object} An object with central_id as keys and arrays of swimlane data as values
 */
export function aggregateDataByCentralId(data) {
    // Initialize result object with empty arrays for each central_id
    const result = {
        'SRA': [],
        'SRL': [],
        'SRM': [],
        'SRP': []
    };

    // Process each swimlane in the data
    data.forEach(swimlane => {
        // Process top-level cards
        if (swimlane.cards && swimlane.cards.length > 0) {
            swimlane.cards.forEach(card => {
                if (card.central_id && result[card.central_id]) {
                    // Create a copy of the swimlane for this central_id if it doesn't exist yet
                    const centralIdSwimlaneName = `${swimlane.name}`;

                    // Find or create the swimlane for this central_id
                    let centralIdSwimlane = result[card.central_id].find(lane => lane.name === centralIdSwimlaneName);
                    if (!centralIdSwimlane) {
                        centralIdSwimlane = {
                            id: swimlane.id,
                            name: centralIdSwimlaneName,
                            cards: []
                        };
                        result[card.central_id].push(centralIdSwimlane);
                    }

                    // Add the card to the swimlane
                    centralIdSwimlane.cards.push(card);
                }
            });
        }

        // Process sections if they exist
        if (swimlane.sections && swimlane.sections.length > 0) {
            swimlane.sections.forEach(section => {
                if (section.cards && section.cards.length > 0) {
                    section.cards.forEach(card => {
                        if (card.central_id && result[card.central_id]) {
                            // Create a copy of the section for this central_id if it doesn't exist yet
                            const centralIdSectionName = `${swimlane.name} - ${section.name}`;

                            // Find or create the swimlane for this central_id
                            let centralIdSwimlane = result[card.central_id].find(lane => lane.name === centralIdSectionName);
                            if (!centralIdSwimlane) {
                                centralIdSwimlane = {
                                    id: `${swimlane.id}-${section.id}`,
                                    name: centralIdSectionName,
                                    cards: [],
                                    swimlane: section.id // Store the original swimlane for color coding
                                };
                                result[card.central_id].push(centralIdSwimlane);
                            }

                            // Add the card to the swimlane
                            centralIdSwimlane.cards.push(card);
                        }
                    });
                }
            });
        }
    });

    return result;
}

/**
 * Transforms the backend data by organizing cards by swimlane type (allarme, emergenza, incidente).
 * For incidente, it aggregates all rossa, gialla, verde, and bianca sections.
 *
 * @param {Array} data - The original data from the backend
 * @returns {Object} An object with swimlane types as keys and arrays of cards as values
 */
export function organizeDataBySwimlaneType(data) {
    // Initialize result object with empty arrays for each swimlane type
    const result = {
        'allarme': [],
        'emergenza': [],
        'incidente': []
    };

    // First, aggregate data by central_id
    const aggregatedData = aggregateDataByCentralId(data);

    // Combine all central_id data
    const allCentralData = [
        ...aggregatedData['SRA'] || [],
        ...aggregatedData['SRL'] || [],
        ...aggregatedData['SRM'] || [],
        ...aggregatedData['SRP'] || []
    ];

    // Organize by swimlane type
    allCentralData.forEach(laneData => {
        const laneName = laneData.name.toLowerCase();

        // Determine which category this belongs to
        if (laneName.includes('allarme')) {
            result['allarme'].push({
                ...laneData,
                central_id: laneData.central_id || getCentralIdFromCards(laneData.cards)
            });
        } else if (laneName.includes('emergenza')) {
            result['emergenza'].push({
                ...laneData,
                central_id: laneData.central_id || getCentralIdFromCards(laneData.cards)
            });
        } else if (laneName.includes('incidente') ||
            laneName.includes('rossa') ||
            laneName.includes('gialla') ||
            laneName.includes('verde') ||
            laneName.includes('bianca')) {
            result['incidente'].push({
                ...laneData,
                central_id: laneData.central_id || getCentralIdFromCards(laneData.cards)
            });
        }
    });

    return result;
}

/**
 * Helper function to extract central_id from cards
 * 
 * @param {Array} cards - Array of card objects
 * @returns {string} - The central_id from the first card, or empty string if not found
 */
export function getCentralIdFromCards(cards) {
    if (cards && cards.length > 0 && cards[0].central_id) {
        return cards[0].central_id;
    }
    return '';
}

/**
 * Helper function to get event number from card
 * 
 * @param {Object} card - Card object
 * @param {number} eventNumber - Event number to compare with
 * @returns {number|null} - The event number from the card, or null if not found
 */
export function getCardEventNumber(card, eventNumber) {
    if (!card.event) return null;
    if (card.event === String(eventNumber)) return Number(card.event);
    if (!isNaN(parseInt(card.event))) return parseInt(card.event);
    const match = card.event.match(/Event (\d+)/);
    return match ? parseInt(match[1]) : null;
}