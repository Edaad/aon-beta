import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Import shared components
import PageHeader from '../../../components/PageHeader/PageHeader';
import ContentCard from '../../../components/ContentCard/ContentCard';
import LoadingState from '../../../components/LoadingState/LoadingState';
import ErrorState from '../../../components/ErrorState/ErrorState';
import EmptyState from '../../../components/EmptyState/EmptyState';
import AddButton from '../../../components/AddButton/AddButton';
import AddItemForm from '../../../components/AddItemForm/AddItemForm';
import InputGroup from '../../../components/InputGroup/InputGroup';
import DeleteButton from '../../../components/DeleteButton/DeleteButton';
import StatusBadge from '../../../components/StatusBadge/StatusBadge';
import { useClub } from '../../../contexts/ClubContext';

import {
    fetchWeeks,
    fetchWeekData,
    fetchPlayers,
    fetchAgents,
    fetchSuperAgents,
    updateWeek,
    addWeek as addWeekAPI,
    deleteWeek as deleteWeekAPI,
    deleteWeekData as deleteWeekDataAPI,
    addWeekData as addWeekDataAPI
} from '../../../services/apis';

import './RakebackData.css';

// Sub-components for cleaner code organization
const WeekItem = ({
    week,
    expandedWeekId,
    toggleWeekExpansion,
    deleteWeek,
    fileInputRefs,
    handleFileUpload,
    processRakeback,
    processingWeekId,
    generatePDF,
    expandedPlayersTab,
    expandedAgentsTab,
    expandedSuperAgentsTab,
    togglePlayersTab,
    toggleAgentsTab,
    toggleSuperAgentsTab,
    expandedAgentId,
    toggleAgentDetails
}) => {
    // Format date for display
    const formatDate = (dateStr) => {
        return format(parseISO(dateStr), 'MMM d, yyyy');
    };

    return (
        <div className="week-item">
            <div className="week-header">
                <div className="week-title" onClick={() => toggleWeekExpansion(week._id)}>
                    <span className={`week-expand-icon ${expandedWeekId === week._id ? 'expanded' : ''}`}>
                        {expandedWeekId === week._id ? '▼' : '►'}
                    </span>
                    <h3>
                        Week of {formatDate(week.startDate)} - {formatDate(week.endDate)}
                    </h3>
                </div>
                <div className="week-controls">
                    <div className="week-status">
                        {week.processed ? (
                            <StatusBadge status="processed" text="Processed" />
                        ) : week.hasData ? (
                            <StatusBadge status="has-data" text="Data Uploaded" />
                        ) : (
                            <StatusBadge status="no-data" text="No Data" />
                        )}
                    </div>
                    {week.processed && week.data && (
                        <button
                            className="download-report-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                generatePDF(week);
                            }}
                            aria-label="Download report"
                            title="Download PDF Report"
                        >
                            <span className="download-icon">↓</span>
                        </button>
                    )}
                    <DeleteButton
                        onDelete={(e) => deleteWeek(week._id, e)}
                        itemName="week"
                    />
                </div>
            </div>

            <div className={`week-content ${expandedWeekId === week._id ? 'expanded' : ''}`}>
                {week.processed && week.data ? (
                    <ProcessedWeekContent
                        week={week}
                        expandedPlayersTab={expandedPlayersTab}
                        expandedAgentsTab={expandedAgentsTab}
                        expandedSuperAgentsTab={expandedSuperAgentsTab}
                        togglePlayersTab={togglePlayersTab}
                        toggleAgentsTab={toggleAgentsTab}
                        toggleSuperAgentsTab={toggleSuperAgentsTab}
                        expandedAgentId={expandedAgentId}
                        toggleAgentDetails={toggleAgentDetails}
                    />
                ) : week.hasData ? (
                    <div className="week-actions">
                        <button
                            className="process-btn"
                            onClick={() => processRakeback(week._id)}
                            disabled={processingWeekId === week._id}
                        >
                            {processingWeekId === week._id ? 'Processing...' : 'Process Rakeback'}
                        </button>
                    </div>
                ) : (
                    <div className="upload-section">
                        <p>Upload Member Statistics Excel file to continue.</p>
                        <label className="upload-btn">
                            Upload Excel File
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={(e) => handleFileUpload(week._id, e)}
                                ref={el => fileInputRefs.current[week._id] = el}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProcessedWeekContent = ({
    week,
    expandedPlayersTab,
    expandedAgentsTab,
    expandedSuperAgentsTab,
    togglePlayersTab,
    toggleAgentsTab,
    toggleSuperAgentsTab,
    expandedAgentId,
    toggleAgentDetails
}) => {
    return (
        <>
            <div className="rakeback-tabs">
                <div
                    className={`tab ${expandedPlayersTab ? 'active' : ''}`}
                    onClick={togglePlayersTab}
                >
                    <h4>Players Rakeback</h4>
                </div>
                <div
                    className={`tab ${expandedAgentsTab ? 'active' : ''}`}
                    onClick={toggleAgentsTab}
                >
                    <h4>Agents Rakeback</h4>
                </div>
                <div
                    className={`tab ${expandedSuperAgentsTab ? 'active' : ''}`}
                    onClick={toggleSuperAgentsTab}
                >
                    <h4>Super Agents Rakeback</h4>
                </div>
            </div>

            <div className={`tab-content ${expandedPlayersTab ? 'expanded' : ''}`}>
                <div className="rakeback-table-container">
                    <h4 className="table-title">Player Rakeback</h4>
                    <table className="rakeback-table">
                        <thead>
                            <tr>
                                <th>Agent</th>
                                <th>Username</th>
                                <th>Rakeback</th>
                                <th>Percentage (%)</th>
                                <th>Rake</th>
                            </tr>
                        </thead>
                        <tbody>
                            {week.data.playerResults.map((result, index) => (
                                <tr key={index}>
                                    <td>{result.agentDisplay}</td>
                                    <td>{result.username}</td>
                                    <td>${result.rakeback.toFixed(0)}</td>
                                    <td>{result.percentage}%</td>
                                    <td>${result.rake.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td></td>
                                <td><strong>Total</strong></td>
                                <td><strong>${week.data.summary.totalPlayerRakeback.toFixed(2)}</strong></td>
                                <td></td>
                                <td><strong>${week.data.summary.totalPlayerRake.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className={`tab-content ${expandedAgentsTab ? 'expanded' : ''}`}>
                <div className="rakeback-table-container">
                    <h4 className="table-title">Agent Rakeback</h4>
                    {week.data.agentResults && week.data.agentResults.length > 0 ? (
                        <table className="rakeback-table">
                            <thead>
                                <tr>
                                    <th>Super Agent</th>
                                    <th>Agent</th>
                                    <th>Rakeback</th>
                                    <th>Percentage (%)</th>
                                    <th>Downline Rake</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {week.data.agentResults.map((agent, index) => (
                                    <React.Fragment key={index}>
                                        <tr>
                                            <td>{agent.superAgent !== '-' ? agent.superAgent : '-'}</td>
                                            <td>{agent.username}</td>
                                            <td>${agent.rakeback.toFixed(0)}</td>
                                            <td>{agent.percentage}%</td>
                                            <td>${agent.totalDownlineRake.toFixed(2)}</td>
                                            <td>
                                                <button
                                                    className="expand-details-btn"
                                                    onClick={() => toggleAgentDetails(index)}
                                                    aria-label="Show downline details"
                                                >
                                                    {expandedAgentId === index ? '▼' : '▶'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedAgentId === index && (
                                            <tr className="agent-details-row">
                                                <td colSpan="6">
                                                    <div className="agent-details">
                                                        <h5>Downline Players</h5>
                                                        <table className="downline-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Player</th>
                                                                    <th>Rake</th>
                                                                    <th>Contribution (%)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {agent.downlinePlayers.map((player, idx) => (
                                                                    <tr key={idx}>
                                                                        <td>{player.username}</td>
                                                                        <td>${player.rake.toFixed(2)}</td>
                                                                        <td>{player.contribution}%</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td><strong>Total</strong></td>
                                    <td><strong>${week.data.summary.totalAgentRakeback.toFixed(2)}</strong></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    ) : (
                        <EmptyState
                            small={true}
                            title="No Agent Data"
                            message="No agent data available for this week"
                        />
                    )}
                </div>
            </div>

            <div className={`tab-content ${expandedSuperAgentsTab ? 'expanded' : ''}`}>
                <div className="rakeback-table-container">
                    <h4 className="table-title">Super Agent Rakeback</h4>
                    {week.data.superAgentResults && week.data.superAgentResults.length > 0 ? (
                        <table className="rakeback-table">
                            <thead>
                                <tr>
                                    <th>Super Agent</th>
                                    <th>Rakeback</th>
                                    <th>Percentage (%)</th>
                                    <th>Downline Rake</th>
                                    <th>Agents</th>
                                    <th>Players</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {week.data.superAgentResults.map((superAgent, index) => (
                                    <React.Fragment key={`sa-${index}`}>
                                        <tr>
                                            <td>{superAgent.username}</td>
                                            <td>${superAgent.rakeback.toFixed(0)}</td>
                                            <td>{superAgent.percentage}%</td>
                                            <td>${superAgent.totalDownlineRake.toFixed(2)}</td>
                                            <td>{superAgent.agentsCount}</td>
                                            <td>{superAgent.playersCount}</td>
                                            <td>
                                                <button
                                                    className="expand-details-btn"
                                                    onClick={() => toggleAgentDetails(`sa-${index}`)}
                                                    aria-label="Show downline details"
                                                >
                                                    {expandedAgentId === `sa-${index}` ? '▼' : '▶'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedAgentId === `sa-${index}` && (
                                            <tr className="agent-details-row">
                                                <td colSpan="7">
                                                    <div className="agent-details">
                                                        <h5>Downline Agents</h5>
                                                        <table className="downline-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Agent</th>
                                                                    <th>Rake</th>
                                                                    <th>Contribution (%)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {superAgent.downlineAgents.map((agent, idx) => (
                                                                    <tr key={idx}>
                                                                        <td>{agent.username}</td>
                                                                        <td>${agent.rake.toFixed(2)}</td>
                                                                        <td>{agent.contribution}%</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>

                                                        <h5>Downline Players</h5>
                                                        <table className="downline-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Player</th>
                                                                    <th>Rake</th>
                                                                    <th>Contribution (%)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {superAgent.downlinePlayers.map((player, idx) => (
                                                                    <tr key={idx}>
                                                                        <td>{player.username}</td>
                                                                        <td>${player.rake.toFixed(2)}</td>
                                                                        <td>{player.contribution}%</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td><strong>Total</strong></td>
                                    <td><strong>${week.data.summary.totalSuperAgentRakeback.toFixed(2)}</strong></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    ) : (
                        <EmptyState
                            small={true}
                            title="No Super Agent Data"
                            message="No super agent data available for this week"
                        />
                    )}
                </div>

                <div className="rakeback-summary">
                    <h4>Weekly Summary</h4>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <span className="summary-label">Players Rakeback:</span>
                            <span className="summary-value">${week.data.summary.totalPlayerRakeback.toFixed(2)}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Agents Rakeback:</span>
                            <span className="summary-value">${week.data.summary.totalAgentRakeback.toFixed(2)}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Super Agents Rakeback:</span>
                            <span className="summary-value">${week.data.summary.totalSuperAgentRakeback.toFixed(2)}</span>
                        </div>
                        <div className="summary-item total">
                            <span className="summary-label">Grand Total:</span>
                            <span className="summary-value">${week.data.summary.grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const AddWeekForm = ({
    startDate,
    endDate,
    weekError,
    setStartDate,
    setEndDate,
    cancelAddWeek,
    addWeek
}) => {
    return (
        <AddItemForm
            error={weekError}
            onCancel={cancelAddWeek}
            onSubmit={addWeek}
            submitLabel="Add Week"
        >
            <InputGroup
                label="Start Date"
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
            />
            <InputGroup
                label="End Date"
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
            />
        </AddItemForm>
    );
};

const RakebackData = () => {
    const { currentClub } = useClub();

    // State management
    const [weeks, setWeeks] = useState([]);
    const [players, setPlayers] = useState([]);
    const [agents, setAgents] = useState([]);
    const [superAgents, setSuperAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // View control
    const [expandedPlayersTab, setExpandedPlayersTab] = useState(true);
    const [expandedAgentsTab, setExpandedAgentsTab] = useState(false);
    const [expandedSuperAgentsTab, setExpandedSuperAgentsTab] = useState(false);
    const [expandedAgentId, setExpandedAgentId] = useState(null);

    // Week adding state
    const [isAddingWeek, setIsAddingWeek] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [weekError, setWeekError] = useState('');

    // Excel upload refs
    const fileInputRefs = useRef({});

    // Process state
    const [processingWeekId, setProcessingWeekId] = useState(null);
    const [expandedWeekId, setExpandedWeekId] = useState(null);

    const fetchData = useCallback(async () => {
        if (!currentClub) return;
        setIsLoading(true);
        try {
            // Fetch all necessary data for the current club
            const [weeksData, weekDataList, playersData, agentsData, superAgentsData] = await Promise.all([
                fetchWeeks(currentClub.name),
                fetchWeekData(currentClub.name),
                fetchPlayers(currentClub.name),
                fetchAgents(currentClub.name),
                fetchSuperAgents(currentClub.name)
            ]);

            // Merge week data into weeks
            const mergedWeeks = weeksData.map(week => {
                const data = weekDataList.find(wd => wd.weekId === week._id);

                if (data) {
                    // Convert backend data structure to frontend format
                    const frontendData = {
                        ...data,
                        playerResults: data.playersData?.map(player => ({
                            username: player.nickname,
                            nickname: player.nickname,
                            rake: player.rake,
                            percentage: player.rakebackPercent,
                            rakeback: player.rakebackAmount,
                            agent: player.agent || '-',
                            superAgent: player.superAgent || '-',
                            agentDisplay: player.superAgent && player.superAgent !== '-'
                                ? `${player.superAgent} (SA)`
                                : player.agent && player.agent !== '-'
                                    ? `${player.agent} (A)`
                                    : "-"
                        })) || [],
                        agentResults: data.agentsData?.map(agent => ({
                            username: agent.nickname || 'Unknown Agent',
                            percentage: agent.rakebackPercent || 0,
                            totalDownlineRake: agent.totalRake || 0,
                            rakeback: agent.rakebackAmount || 0,
                            superAgent: agent.superAgent || '-',
                            downlinePlayers: agent.downlinePlayers || [] // Preserve downline players data
                        })) || [],
                        superAgentResults: data.superAgentsData?.map(superAgent => ({
                            username: superAgent.nickname || 'Unknown Super Agent',
                            percentage: superAgent.rakebackPercent || 0,
                            totalDownlineRake: superAgent.totalRake || 0,
                            rakeback: superAgent.rakebackAmount || 0,
                            agentsCount: superAgent.agentsCount || 0,
                            playersCount: superAgent.playersCount || 0,
                            downlineAgents: superAgent.downlineAgents || [],
                            downlinePlayers: superAgent.downlinePlayers || []
                        })) || [],
                        clubOverview: {
                            clubName: currentClub.name,
                            totalFee: data.totalFee,
                            profitLoss: data.totalPL,
                            activePlayers: data.activePlayers,
                            totalHands: data.totalHands
                        },
                        summary: {
                            totalPlayerRake: data.playersData?.reduce((sum, player) => sum + player.rake, 0) || 0,
                            totalPlayerRakeback: data.totalPlayerRakeback,
                            totalAgentRakeback: data.totalAgentRakeback,
                            totalSuperAgentRakeback: data.totalSuperAgentRakeback || 0,
                            grandTotal: data.totalRakeback
                        }
                    };

                    return {
                        ...week,
                        data: frontendData,
                        hasData: true,
                        processed: true
                    };
                }

                return {
                    ...week,
                    data: null,
                    hasData: false,
                    processed: false
                };
            });

            setWeeks(mergedWeeks);
            setPlayers(playersData);
            setAgents(agentsData);
            setSuperAgents(superAgentsData);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
            setIsLoading(false);
        }
    }, [currentClub]);

    // Fetch data on component mount and when club changes
    useEffect(() => {
        if (currentClub) {
            fetchData();
        }
    }, [currentClub, fetchData]);

    // Add a new week
    const addWeek = async () => {
        // Validation
        if (!startDate || !endDate) {
            setWeekError('Both start date and end date are required');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setWeekError('Start date cannot be after end date');
            return;
        }

        try {
            // Create new week
            const newWeek = {
                weekNumber: weeks.length + 1,
                startDate,
                endDate,
                status: 'active'
            };

            const savedWeek = await addWeekAPI(currentClub.name, newWeek);
            setWeeks([...weeks, savedWeek]);

            // Reset form
            setStartDate('');
            setEndDate('');
            setIsAddingWeek(false);
            setWeekError('');
        } catch (err) {
            setWeekError('Error adding week: ' + err.message);
        }
    };

    // Cancel adding week
    const cancelAddWeek = () => {
        setIsAddingWeek(false);
        setStartDate('');
        setEndDate('');
        setWeekError('');
    };

    // Handle Excel file upload
    const handleFileUpload = async (weekId, event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Check if "Member Statistics" sheet exists
                if (!workbook.SheetNames.includes('Member Statistics')) {
                    alert('Excel file must contain a sheet named "Member Statistics"');
                    return;
                }

                // Check for Club Overview sheet
                if (!workbook.SheetNames.includes('Club Overview')) {
                    alert('Excel file must contain a sheet named "Club Overview"');
                    return;
                }

                // Get the Member Statistics sheet
                const statsSheet = workbook.Sheets['Member Statistics'];

                // Extract player data from columns:
                // - F (Agent) 
                // - J (Nickname)
                // - BM (Rake) // Updated from BL to BM
                // - D (Super Agent)
                // Starting from row 7
                const extractedData = [];
                let row = 7;

                while (true) {
                    const nicknameCell = statsSheet[`J${row}`];
                    const rakeCell = statsSheet[`BM${row}`]; // Changed from BL to BM
                    const agentCell = statsSheet[`F${row}`]; // Column F (A)
                    const superAgentCell = statsSheet[`D${row}`]; // Column D (SA)

                    if (!nicknameCell || !nicknameCell.v) break;

                    const nickname = nicknameCell.v;
                    const rake = rakeCell?.v || 0;
                    const agent = agentCell?.v || '-';
                    const superAgent = superAgentCell?.v || '-';

                    extractedData.push({
                        nickname,
                        rake,
                        agent,
                        superAgent
                    });
                    row++;
                }

                if (extractedData.length === 0) {
                    alert('No data found in the Excel file');
                    return;
                }

                // Get the Club Overview sheet
                const overviewSheet = workbook.Sheets['Club Overview'];

                // Extract club overview data
                const clubOverview = {
                    clubName: overviewSheet['D6']?.v || 'Unknown Club',
                    totalFee: overviewSheet['I7']?.v || 0,
                    profitLoss: overviewSheet['R7']?.v || 0,
                    activePlayers: overviewSheet['G7']?.v || 0,
                    totalHands: overviewSheet['H7']?.v || 0
                };

                // Save extracted data to the week
                const updatedWeek = weeks.find(w => w._id === weekId);
                if (!updatedWeek) return;

                const updatedWeeks = weeks.map(w => {
                    if (w._id === weekId) {
                        return {
                            ...w,
                            hasData: true,
                            extractedData,
                            clubOverview
                        };
                    }
                    return w;
                });

                // Update week on server
                await updateWeek(currentClub.name, weekId, { hasData: true });

                // Store extracted data temporarily with the week
                setWeeks(updatedWeeks);

                alert('Data uploaded successfully. Click "Process" to calculate rakeback.');
            } catch (error) {
                console.error('Error processing Excel file:', error);
                alert('Error processing Excel file: ' + error.message);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    // Process rakeback for a week
    const processRakeback = async (weekId) => {
        setProcessingWeekId(weekId);

        try {
            const week = weeks.find(w => w._id === weekId);
            if (!week || !week.extractedData) {
                throw new Error('No data available to process');
            }

            // Helper function to calculate rakeback percentage for threshold-based players
            const calculateThresholdPercentage = (rakeAmount, thresholds) => {
                if (!thresholds || thresholds.length === 0) {
                    return 0;
                }

                // Sort thresholds by start amount to ensure proper ordering
                const sortedThresholds = [...thresholds].sort((a, b) => a.start - b.start);

                // Find the applicable threshold
                for (const threshold of sortedThresholds) {
                    if (rakeAmount >= threshold.start && rakeAmount <= threshold.end) {
                        return threshold.percentage;
                    }
                }

                // If no threshold matches, return 0
                return 0;
            };

            // 1. Process player rakeback
            const playerResults = week.extractedData.map(player => {
                // Find matching player in rakeback list
                const matchedPlayer = players.find(p =>
                    p.nickname.toLowerCase() === player.nickname.toLowerCase()
                );

                if (matchedPlayer) {
                    let rakebackPercentage;

                    if (matchedPlayer.rakebackType === 'threshold' && matchedPlayer.thresholds) {
                        // Calculate percentage based on thresholds
                        rakebackPercentage = calculateThresholdPercentage(player.rake, matchedPlayer.thresholds);
                    } else {
                        // Use flat percentage
                        rakebackPercentage = matchedPlayer.rakeback;
                    }

                    const rakeback = (player.rake * rakebackPercentage / 100).toFixed(2);

                    // Determine agent display
                    let agentDisplay = "-";
                    if (player.superAgent && player.superAgent !== '-') {
                        agentDisplay = `${player.superAgent} (SA)`;
                    } else if (player.agent && player.agent !== '-') {
                        agentDisplay = `${player.agent} (A)`;
                    }

                    return {
                        username: matchedPlayer.nickname,
                        nickname: player.nickname,
                        rake: player.rake,
                        percentage: rakebackPercentage,
                        rakeback: parseFloat(rakeback),
                        agent: player.agent || '-',
                        superAgent: player.superAgent || '-',
                        agentDisplay: agentDisplay
                    };
                }

                return null;
            }).filter(Boolean); // Remove null entries (unmatched players)

            // 2. Process agent rakeback
            const agentDownlines = {};

            // Group players by their agents and calculate total rake per agent
            week.extractedData.forEach(player => {
                const agentName = player.agent;

                if (agentName && agentName.trim() !== '') {
                    // Initialize agent downline if not exists
                    if (!agentDownlines[agentName]) {
                        agentDownlines[agentName] = {
                            totalRake: 0,
                            players: [],
                            superAgent: player.superAgent || '-'
                        };
                    }

                    // Add player's rake to agent's total and track player details
                    agentDownlines[agentName].totalRake += player.rake;
                    agentDownlines[agentName].players.push({
                        username: player.nickname,
                        rake: player.rake
                    });
                }
            });

            // Calculate rakeback for each agent
            const agentResults = Object.entries(agentDownlines).map(([agentName, data]) => {
                // Find agent's percentage from agents list
                const matchedAgent = agents.find(a =>
                    a.nickname.toLowerCase() === agentName.toLowerCase()
                );

                if (matchedAgent) {
                    const totalDownlineRake = data.totalRake;

                    let rakebackPercentage;
                    if (matchedAgent.rakebackType === 'threshold' && matchedAgent.thresholds) {
                        // Calculate percentage based on thresholds
                        rakebackPercentage = calculateThresholdPercentage(totalDownlineRake, matchedAgent.thresholds);
                    } else {
                        // Use flat percentage
                        rakebackPercentage = matchedAgent.rakeback;
                    }

                    const rakeback = (totalDownlineRake * rakebackPercentage / 100).toFixed(2);

                    return {
                        username: matchedAgent.nickname,
                        percentage: rakebackPercentage,
                        totalDownlineRake,
                        rakeback: parseFloat(rakeback),
                        superAgent: data.superAgent,
                        downlinePlayers: data.players.map(player => ({
                            ...player,
                            contribution: ((player.rake / totalDownlineRake) * 100).toFixed(2)
                        }))
                    };
                }

                return null;
            }).filter(Boolean); // Remove null entries (unmatched agents)

            // 3. Process super agent rakeback
            const superAgentDownlines = {};

            // Group players directly by their super agents (from Excel data)
            week.extractedData.forEach(player => {
                const superAgentName = player.superAgent;

                if (superAgentName && superAgentName.trim() !== '' && superAgentName !== '-') {
                    // Initialize super agent downline if not exists
                    if (!superAgentDownlines[superAgentName]) {
                        superAgentDownlines[superAgentName] = {
                            totalRake: 0,
                            agents: new Set(),
                            players: []
                        };
                    }

                    // Add player's rake to super agent's total
                    superAgentDownlines[superAgentName].totalRake += player.rake;

                    // Track the player
                    superAgentDownlines[superAgentName].players.push({
                        username: player.nickname,
                        rake: player.rake
                    });

                    // Track the agent if exists
                    if (player.agent && player.agent.trim() !== '' && player.agent !== '-') {
                        superAgentDownlines[superAgentName].agents.add(player.agent);
                    }
                }
            });

            // Convert agent sets to arrays with rake totals
            Object.keys(superAgentDownlines).forEach(superAgentName => {
                const agentSet = superAgentDownlines[superAgentName].agents;
                const agentArray = [];

                agentSet.forEach(agentName => {
                    // Calculate total rake for this agent under this super agent
                    const agentRake = week.extractedData
                        .filter(player => player.superAgent === superAgentName && player.agent === agentName)
                        .reduce((sum, player) => sum + player.rake, 0);

                    agentArray.push({
                        username: agentName,
                        rake: agentRake
                    });
                });

                superAgentDownlines[superAgentName].agents = agentArray;
            });

            // Calculate rakeback for each super agent
            const superAgentResults = Object.entries(superAgentDownlines).map(([superAgentName, data]) => {
                // Find super agent's percentage from super agents list
                const matchedSuperAgent = superAgents.find(a =>
                    a.nickname.toLowerCase() === superAgentName.toLowerCase()
                );

                if (matchedSuperAgent) {
                    const totalDownlineRake = data.totalRake;

                    let rakebackPercentage;
                    if (matchedSuperAgent.rakebackType === 'threshold' && matchedSuperAgent.thresholds) {
                        // Calculate percentage based on thresholds
                        rakebackPercentage = calculateThresholdPercentage(totalDownlineRake, matchedSuperAgent.thresholds);
                    } else {
                        // Use flat percentage
                        rakebackPercentage = matchedSuperAgent.rakeback;
                    }

                    const rakeback = (totalDownlineRake * rakebackPercentage / 100).toFixed(2);

                    return {
                        username: matchedSuperAgent.nickname,
                        percentage: rakebackPercentage,
                        totalDownlineRake,
                        rakeback: parseFloat(rakeback),
                        agentsCount: data.agents.length,
                        playersCount: data.players.length,
                        downlineAgents: data.agents.map(agent => ({
                            ...agent,
                            contribution: ((agent.rake / totalDownlineRake) * 100).toFixed(2)
                        })),
                        downlinePlayers: data.players.map(player => ({
                            ...player,
                            contribution: ((player.rake / totalDownlineRake) * 100).toFixed(2)
                        }))
                    };
                }

                return null;
            }).filter(Boolean); // Remove null entries (unmatched super agents)

            // Calculate totals
            const totalPlayerRakeback = playerResults.reduce((sum, item) => sum + item.rakeback, 0);
            const totalAgentRakeback = agentResults.reduce((sum, item) => sum + parseFloat(item.rakeback), 0);
            const totalSuperAgentRakeback = superAgentResults.reduce((sum, item) => sum + parseFloat(item.rakeback), 0);

            // Create week data object
            const weekData = {
                weekId: weekId,
                weekNumber: week.weekNumber,
                startDate: week.startDate,
                endDate: week.endDate,
                totalFee: week.clubOverview?.totalFee || 0,
                totalPL: week.clubOverview?.profitLoss || 0,
                activePlayers: week.clubOverview?.activePlayers || 0,
                totalHands: week.clubOverview?.totalHands || 0,
                playersData: playerResults.map(player => ({
                    nickname: player.nickname,
                    agent: player.agent,
                    rake: player.rake,
                    rakebackPercent: player.percentage,
                    rakebackAmount: player.rakeback,
                    superAgent: player.superAgent
                })),
                agentsData: agentResults.map(agent => ({
                    nickname: agent.username,
                    totalRake: agent.totalDownlineRake,
                    rakebackPercent: agent.percentage,
                    rakebackAmount: agent.rakeback,
                    playersCount: agent.downlinePlayers.length,
                    superAgent: agent.superAgent,
                    downlinePlayers: agent.downlinePlayers.map(player => ({
                        username: player.username,
                        rake: player.rake,
                        contribution: parseFloat(player.contribution)
                    }))
                })),
                superAgentsData: superAgentResults.map(superAgent => ({
                    nickname: superAgent.username,
                    totalRake: superAgent.totalDownlineRake,
                    rakebackPercent: superAgent.percentage,
                    rakebackAmount: superAgent.rakeback,
                    agentsCount: superAgent.agentsCount,
                    playersCount: superAgent.playersCount,
                    downlineAgents: superAgent.downlineAgents.map(agent => ({
                        username: agent.username,
                        rake: agent.rake,
                        contribution: parseFloat(agent.contribution)
                    })),
                    downlinePlayers: superAgent.downlinePlayers.map(player => ({
                        username: player.username,
                        rake: player.rake,
                        contribution: parseFloat(player.contribution)
                    }))
                })),
                totalPlayerRakeback: parseFloat(totalPlayerRakeback.toFixed(2)),
                totalAgentRakeback: parseFloat(totalAgentRakeback.toFixed(2)),
                totalSuperAgentRakeback: parseFloat(totalSuperAgentRakeback.toFixed(2)),
                totalRakeback: parseFloat((totalPlayerRakeback + totalAgentRakeback + totalSuperAgentRakeback).toFixed(2))
            };

            // Save to server
            const savedData = await addWeekDataAPI(currentClub.name, weekData);

            // Create frontend-friendly data structure
            const frontendData = {
                ...savedData,
                playerResults,
                agentResults,
                superAgentResults,
                clubOverview: week.clubOverview || null,
                summary: {
                    totalPlayerRake: playerResults.reduce((sum, item) => sum + item.rake, 0),
                    totalPlayerRakeback: parseFloat(totalPlayerRakeback.toFixed(2)),
                    totalAgentRakeback: parseFloat(totalAgentRakeback.toFixed(2)),
                    totalSuperAgentRakeback: parseFloat(totalSuperAgentRakeback.toFixed(2)),
                    grandTotal: parseFloat((totalPlayerRakeback + totalAgentRakeback + totalSuperAgentRakeback).toFixed(2))
                }
            };

            // Update week processed status
            await updateWeek(currentClub.name, weekId, { processed: true });

            // Update local state
            setWeeks(weeks.map(w => {
                if (w._id === weekId) {
                    return {
                        ...w,
                        processed: true,
                        data: frontendData
                    };
                }
                return w;
            }));

            // Auto expand the processed week
            setExpandedWeekId(weekId);
        } catch (err) {
            alert('Error processing rakeback: ' + err.message);
        } finally {
            setProcessingWeekId(null);
        }
    };

    // Toggle week expansion
    const toggleWeekExpansion = (weekId) => {
        if (expandedWeekId === weekId) {
            setExpandedWeekId(null);
        } else {
            setExpandedWeekId(weekId);
        }
    };

    // Toggle agent details
    const toggleAgentDetails = (agentId) => {
        if (expandedAgentId === agentId) {
            setExpandedAgentId(null);
        } else {
            setExpandedAgentId(agentId);
        }
    };

    // Delete a week and its associated data
    const deleteWeek = async (weekId, event) => {
        // Stop event from triggering toggleWeekExpansion
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }

        // Confirm deletion
        const confirmed = window.confirm('Are you sure you want to delete this week and all associated data?');
        if (!confirmed) return;

        try {
            // First check if there is week data and delete it
            const weekToDelete = weeks.find(w => w._id === weekId);
            if (weekToDelete?.data) {
                await deleteWeekDataAPI(currentClub.name, weekToDelete.data._id);
            }

            // Then delete the week
            await deleteWeekAPI(currentClub.name, weekId);

            // Update state
            setWeeks(weeks.filter(week => week._id !== weekId));

            // If the deleted week was expanded, reset expandedWeekId
            if (expandedWeekId === weekId) {
                setExpandedWeekId(null);
            }
        } catch (err) {
            console.error('Error deleting week:', err);
            alert('Error deleting week: ' + err.message);
        }
    };

    // Toggle tabs
    const togglePlayersTab = () => {
        setExpandedPlayersTab(!expandedPlayersTab);
    };

    const toggleAgentsTab = () => {
        setExpandedAgentsTab(!expandedAgentsTab);
    };

    const toggleSuperAgentsTab = () => {
        setExpandedSuperAgentsTab(!expandedSuperAgentsTab);
    };

    // Generate PDF report
    const generatePDF = (week) => {
        // Create new PDF document in portrait, A4 format
        const doc = new jsPDF();

        // Add company logo/title
        doc.setFontSize(18);
        doc.setTextColor(64, 81, 137);
        doc.text('Round Table Rakeback Report', 105, 15, { align: 'center' });

        // Add report title with date range
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`Weekly Rakeback Report: ${format(parseISO(week.startDate), 'MMM d, yyyy')} - ${format(parseISO(week.endDate), 'MMM d, yyyy')}`, 105, 25, { align: 'center' });

        // Add date generated
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${format(new Date(), 'MMM d, yyyy, h:mm a')}`, 105, 32, { align: 'center' });

        // Add summary section
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Weekly Summary', 14, 45);

        doc.setDrawColor(200, 200, 200);
        doc.line(14, 47, 196, 47);

        // Summary table
        const summaryBody = [
            ['Players Rakeback:', `$${week.data.summary.totalPlayerRakeback.toFixed(2)}`],
            ['Agents Rakeback:', `$${week.data.summary.totalAgentRakeback.toFixed(2)}`],
            ['Total Rakeback:', `$${week.data.summary.grandTotal.toFixed(2)}`]
        ];

        // Track the current Y position after each table
        let currentY = 50;

        // Using a try-catch to handle any issues with table generation
        try {
            // Generate summary table
            autoTable(doc, {
                startY: currentY,
                head: [['Category', 'Amount']],
                body: summaryBody,
                headStyles: {
                    fillColor: [100, 149, 237],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [240, 245, 255]
                },
                margin: { left: 14, right: 14 },
                didDrawPage: (data) => {
                    // Update the current Y position after table is drawn
                    currentY = data.cursor.y + 15;
                }
            });

            // Players Section
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text('Player Rakeback Details', 14, currentY);
            doc.setDrawColor(200, 200, 200);
            doc.line(14, currentY + 2, 196, currentY + 2);
            currentY += 10;

            // Player data table
            const playerHeaders = [['Agent', 'Username', 'Rakeback ($)', 'Percentage (%)', 'Rake ($)']];
            const playerBody = week.data.playerResults.map(player => [
                player.agentDisplay,
                player.username,
                player.rakeback.toFixed(2),
                player.percentage,
                player.rake.toFixed(2)
            ]);

            // Generate player table
            autoTable(doc, {
                startY: currentY,
                head: playerHeaders,
                body: playerBody,
                headStyles: {
                    fillColor: [100, 181, 246],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [240, 248, 255]
                },
                foot: [['', 'Total', week.data.summary.totalPlayerRakeback.toFixed(2), '', week.data.summary.totalPlayerRake.toFixed(2)]],
                footStyles: {
                    fillColor: [220, 237, 255],
                    fontStyle: 'bold'
                },
                margin: { left: 14, right: 14 },
                didDrawPage: (data) => {
                    // Update the current Y position after table is drawn
                    currentY = data.cursor.y + 15;
                }
            });

            // Agents Section (if there are agents)
            if (week.data.agentResults && week.data.agentResults.length > 0) {
                // Check if we need a new page
                if (currentY > 220) {
                    doc.addPage();

                    // Add page header to new page
                    doc.setFontSize(12);
                    doc.setTextColor(64, 81, 137);
                    doc.text(`Rakeback Report - ${format(parseISO(week.startDate), 'MMM d')} to ${format(parseISO(week.endDate), 'MMM d, yyyy')}`, 105, 15, { align: 'center' });
                    doc.setDrawColor(200, 200, 200);
                    doc.line(14, 17, 196, 17);

                    currentY = 30;
                }

                // Add agent table data
                const agentHeaders = [['Agent', 'Rakeback ($)', 'Percentage (%)', 'Downline Rake ($)']];
                const agentBody = week.data.agentResults.map(agent => [
                    agent.username,
                    agent.rakeback.toFixed(2),
                    agent.percentage,
                    agent.totalDownlineRake.toFixed(2)
                ]);

                // Generate agent table
                autoTable(doc, {
                    startY: currentY,
                    head: agentHeaders,
                    body: agentBody,
                    headStyles: {
                        fillColor: [100, 181, 246],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold'
                    },
                    alternateRowStyles: {
                        fillColor: [240, 248, 255]
                    },
                    foot: [['Total', week.data.summary.totalAgentRakeback.toFixed(2), '', '']],
                    footStyles: {
                        fillColor: [220, 237, 255],
                        fontStyle: 'bold'
                    },
                    margin: { left: 14, right: 14 },
                    didDrawPage: (data) => {
                        // Update the current Y position after table is drawn
                        currentY = data.cursor.y + 15;
                    }
                });
            }

            // Add footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Round Table Rakeback Report - Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
            }
        } catch (err) {
            console.error("Error generating PDF:", err);
            alert("There was a problem generating the PDF. Please try again.");
            return;
        }

        // Save PDF with filename based on date range
        try {
            const startDateStr = format(parseISO(week.startDate), 'yyyy-MM-dd');
            const endDateStr = format(parseISO(week.endDate), 'yyyy-MM-dd');
            doc.save(`Rakeback_Report_${startDateStr}_to_${endDateStr}.pdf`);
        } catch (err) {
            console.error("Error saving PDF:", err);
            alert("The PDF was generated but could not be downloaded. Please try again.");
        }
    };

    return (
        <div className="page-container">
            <PageHeader
                title="Rakeback Data"
                description="Upload and process rakeback data by week"
            />

            <ContentCard className="rakeback-data-card">
                {isLoading ? (
                    <LoadingState message="Loading rakeback data..." />
                ) : error ? (
                    <ErrorState message={error} />
                ) : (
                    <>
                        <div className="weeks-list">
                            {weeks.length > 0 ? (
                                weeks.map(week => (
                                    <WeekItem
                                        key={week._id}
                                        week={week}
                                        expandedWeekId={expandedWeekId}
                                        toggleWeekExpansion={toggleWeekExpansion}
                                        deleteWeek={deleteWeek}
                                        fileInputRefs={fileInputRefs}
                                        handleFileUpload={handleFileUpload}
                                        processRakeback={processRakeback}
                                        processingWeekId={processingWeekId}
                                        generatePDF={generatePDF}
                                        expandedPlayersTab={expandedPlayersTab}
                                        expandedAgentsTab={expandedAgentsTab}
                                        expandedSuperAgentsTab={expandedSuperAgentsTab}
                                        togglePlayersTab={togglePlayersTab}
                                        toggleAgentsTab={toggleAgentsTab}
                                        toggleSuperAgentsTab={toggleSuperAgentsTab}
                                        expandedAgentId={expandedAgentId}
                                        toggleAgentDetails={toggleAgentDetails}
                                    />
                                ))
                            ) : (
                                <EmptyState
                                    icon="📅"
                                    title="No Weeks Added"
                                    message="Add a week to get started with rakeback processing"
                                />
                            )}
                        </div>

                        {isAddingWeek ? (
                            <AddWeekForm
                                startDate={startDate}
                                endDate={endDate}
                                weekError={weekError}
                                setStartDate={setStartDate}
                                setEndDate={setEndDate}
                                cancelAddWeek={cancelAddWeek}
                                addWeek={addWeek}
                            />
                        ) : (
                            <AddButton
                                onClick={() => setIsAddingWeek(true)}
                                label="Add Week"
                            />
                        )}
                    </>
                )}
            </ContentCard>
        </div>
    );
};

export default RakebackData;