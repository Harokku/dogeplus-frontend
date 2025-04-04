// GlobalSwimlanes.jsx
import { createSignal, onMount } from "solid-js";
import { getEventOverview } from "../dataService/eventOverviewService.js";
import { parseEnvToBoolean } from "../utils/varCasting.js";
import Swimlane from "./Swimlanes.jsx";
import { assessmentCardBG } from "../theme/bg.js";
import "../theme/hideScrollBar.css"

/**
 * Transforms the backend data by aggregating cards by central_id.
 * 
 * @param {Array} data - The original data from the backend
 * @returns {Object} An object with central_id as keys and arrays of swimlane data as values
 */
function aggregateDataByCentralId(data) {
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
function organizeDataBySwimlaneType(data) {
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

// Helper function to extract central_id from cards
function getCentralIdFromCards(cards) {
    if (cards && cards.length > 0 && cards[0].central_id) {
        return cards[0].central_id;
    }
    return '';
}

function GlobalSwimlanes(props) {
    // Default scroll interval is 5 seconds if not provided
    const scrollInterval = props.scrollInterval || 5;

    const [sraData, setSraData] = createSignal([]);
    const [srlData, setSrlData] = createSignal([]);
    const [srmData, setSrmData] = createSignal([]);
    const [srpData, setSrpData] = createSignal([]);
    const [isLoading, setIsLoading] = createSignal(true);

    // State to track the current scroll position for each quadrant
    const [sraScrollIndex, setSraScrollIndex] = createSignal(0);
    const [srlScrollIndex, setSrlScrollIndex] = createSignal(0);
    const [srmScrollIndex, setSrmScrollIndex] = createSignal(0);
    const [srpScrollIndex, setSrpScrollIndex] = createSignal(0);

    // Refs for the quadrant containers
    let sraRef;
    let srlRef;
    let srmRef;
    let srpRef;

    // Fetch data from the backend
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await getEventOverview(parseEnvToBoolean(import.meta.env.VITE_MOCK) || false);
            if (response.result && response.data && response.data.data && response.data.data.length > 0) {
                // Process the data
                const allData = response.data.data;

                // Transform the data to aggregate by central_id
                const aggregatedData = aggregateDataByCentralId(allData);

                // Set the data for each central_id
                setSraData(aggregatedData['SRA'] || []);
                setSrlData(aggregatedData['SRL'] || []);
                setSrmData(aggregatedData['SRM'] || []);
                setSrpData(aggregatedData['SRP'] || []);
            } else {
                // No data returned, set empty arrays for all quadrants
                setSraData([]);
                setSrlData([]);
                setSrmData([]);
                setSrpData([]);
            }
        } catch (err) {
            // Set empty arrays for all quadrants even in case of error
            setSraData([]);
            setSrlData([]);
            setSrmData([]);
            setSrpData([]);
            // Still log the error for debugging purposes
            console.error("Error fetching data:", err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to scroll to the next card in a quadrant
    const scrollToNextCard = (quadrantRef, currentIndex, totalCards, setIndexFn) => {
        if (!quadrantRef || totalCards === 0) return;

        // Get all cards in the quadrant
        const cards = quadrantRef.querySelectorAll('.card');
        if (cards.length === 0) return;

        // Find the first non-visible card
        const quadrantRect = quadrantRef.getBoundingClientRect();
        let nextVisibleIndex = -1;

        // Start checking from the card after the current one
        for (let i = 0; i < cards.length; i++) {
            // Calculate the index to check, starting from the next card after current
            const indexToCheck = (currentIndex + 1 + i) % totalCards;
            const card = cards[indexToCheck];
            const cardRect = card.getBoundingClientRect();

            // Check if the card is below the visible area or only partially visible
            // We consider a card non-visible if its top edge is below the bottom of the viewport
            // or if less than 50% of the card is visible
            const cardVisibleHeight = Math.min(cardRect.bottom, quadrantRect.bottom) - Math.max(cardRect.top, quadrantRect.top);
            const isCardFullyVisible = cardVisibleHeight > cardRect.height * 0.5;

            if (!isCardFullyVisible) {
                nextVisibleIndex = indexToCheck;
                break;
            }
        }

        // If we couldn't find a non-visible card, just go to the next one
        if (nextVisibleIndex === -1) {
            nextVisibleIndex = (currentIndex + 1) % totalCards;
        }

        // Get the card to scroll to
        const cardToScrollTo = cards[nextVisibleIndex];
        if (!cardToScrollTo) return;

        // Scroll to the card with a smooth animation
        cardToScrollTo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Update the index
        setIndexFn(nextVisibleIndex);
    };

    // Function to synchronize scrolling across all quadrants
    const syncScroll = () => {
        // Get the total number of cards in each quadrant
        const sraCards = sraRef?.querySelectorAll('.card')?.length || 0;
        const srlCards = srlRef?.querySelectorAll('.card')?.length || 0;
        const srmCards = srmRef?.querySelectorAll('.card')?.length || 0;
        const srpCards = srpRef?.querySelectorAll('.card')?.length || 0;

        // Scroll each quadrant to the next card
        scrollToNextCard(sraRef, sraScrollIndex(), sraCards, setSraScrollIndex);
        scrollToNextCard(srlRef, srlScrollIndex(), srlCards, setSrlScrollIndex);
        scrollToNextCard(srmRef, srmScrollIndex(), srmCards, setSrmScrollIndex);
        scrollToNextCard(srpRef, srpScrollIndex(), srpCards, setSrpScrollIndex);
    };

    onMount(() => {
        fetchData();

        // Variable to store the interval ID
        let intervalId;

        // Trigger the first scroll after the first interval (5 seconds)
        const initialScrollTimeout = setTimeout(() => {
            syncScroll();

            // Set up the interval for subsequent scrolls
            intervalId = setInterval(() => {
                syncScroll();
            }, scrollInterval * 1000);
        }, scrollInterval * 1000);

        // Clean up the timeout and interval when the component unmounts
        return () => {
            clearTimeout(initialScrollTimeout);
            if (intervalId) clearInterval(intervalId);
        };
    });

    return (
        <div class="h-[85vh] overflow-hidden">
            {isLoading() ? (
                <div class="flex justify-center items-center h-full">
                    <span class="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <div class="grid grid-cols-2 grid-rows-2 gap-4 h-full">
                    {/* SRA Quadrant */}
                    <div class="border border-gray-300 rounded-lg p-2 overflow-auto">
                        <h2 class="text-xl font-bold mb-2 text-center">SRA</h2>
                        <div ref={el => sraRef = el} class="h-[calc(100%-2rem)] overflow-auto scrollbar-hidden">
                            <QuadrantSwimlane data={sraData()} title="SRA" />
                        </div>
                    </div>

                    {/* SRL Quadrant */}
                    <div class="border border-gray-300 rounded-lg p-2 overflow-auto">
                        <h2 class="text-xl font-bold mb-2 text-center">SRL</h2>
                        <div ref={el => srlRef = el} class="h-[calc(100%-2rem)] overflow-auto scrollbar-hidden">
                            <QuadrantSwimlane data={srlData()} title="SRL" />
                        </div>
                    </div>

                    {/* SRM Quadrant */}
                    <div class="border border-gray-300 rounded-lg p-2 overflow-auto">
                        <h2 class="text-xl font-bold mb-2 text-center">SRM</h2>
                        <div ref={el => srmRef = el} class="h-[calc(100%-2rem)] overflow-auto scrollbar-hidden">
                            <QuadrantSwimlane data={srmData()} title="SRM" />
                        </div>
                    </div>

                    {/* SRP Quadrant */}
                    <div class="border border-gray-300 rounded-lg p-2 overflow-auto">
                        <h2 class="text-xl font-bold mb-2 text-center">SRP</h2>
                        <div ref={el => srpRef = el} class="h-[calc(100%-2rem)] overflow-auto scrollbar-hidden">
                            <QuadrantSwimlane data={srpData()} title="SRP" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper component for rendering a swimlane within a quadrant
function QuadrantSwimlane({ data, title }) {
    return (
        <div class="h-full">
            {data.map(laneData => (
                <div class="mb-2">
                    <div class="border border-gray-300 rounded-lg p-1 bg-gray-50">
                        {/* Display central_id in the header for better identification */}
                        <h3 class="text-sm font-bold text-center">
                            {laneData.central_id ? `${laneData.central_id} - ` : ''}{laneData.name}
                        </h3>
                        <div class="mt-1">
                            {laneData.cards.map(card => {
                                // Calculate completion percentage
                                const percentage = card.completion ? 
                                    Math.round((card.completion.completed / card.completion.total) * 100) : 0;

                                // Determine swimlane for color
                                const swimlane = laneData.swimlane || 
                                    (laneData.name.toLowerCase().includes('allarme') ? 'allarme' : 
                                     laneData.name.toLowerCase().includes('emergenza') ? 'emergenza' : 
                                     laneData.name.toLowerCase().includes('rossa') ? 'rossa' :
                                     laneData.name.toLowerCase().includes('gialla') ? 'gialla' :
                                     laneData.name.toLowerCase().includes('verde') ? 'verde' : 'bianca');

                                // Get background color based on swimlane
                                const swimlaneKey = swimlane.toUpperCase();
                                const bgColor = assessmentCardBG[swimlaneKey] || assessmentCardBG.BIANCA;

                                return (
                                    <div class="card shadow-sm p-1 mb-1 rounded-lg text-xs transition-all duration-300 ease-in-out hover:scale-105"
                                         style={{
                                             "background-color": bgColor,
                                             "color": swimlaneKey === 'ROSSA' || swimlaneKey === 'GIALLA' ? '#FFFFFF' : '#000000'
                                         }}>
                                        <div class="flex justify-between">
                                            <span class="font-semibold">{card.event}</span>
                                            <span class="text-xs">{card.central_id}</span>
                                        </div>
                                        <div class="truncate">{card.location} {card.location_detail ? `- ${card.location_detail}` : ''}</div>

                                        {/* Compact layout with type and completion in one line */}
                                        <div class="flex justify-between items-center">
                                            <span class="text-xs">{card.type}</span>

                                            {/* Task completion percentage */}
                                            {card.completion && (
                                                <span class="text-xs">{percentage}%</span>
                                            )}
                                        </div>

                                        {/* Task completion progress bar */}
                                        {card.completion && (
                                            <div class="h-1 w-full bg-gray-300 rounded-full overflow-hidden mt-1">
                                                <div
                                                    class="h-1 rounded-full bg-green-500"
                                                    style={{
                                                        "width": `${percentage}%`
                                                    }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default GlobalSwimlanes;
