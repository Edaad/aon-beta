import React, { useState, useEffect, useRef } from 'react';
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

import {
    fetchWeeks,
    fetchWeekData,
    fetchPlayers,
    fetchAgents,
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
    togglePlayersTab,
    toggleAgentsTab,
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
                <div className="week-title" onClick={() => toggleWeekExpansion(week.id)}>
                    <span className={`week-expand-icon ${expandedWeekId === week.id ? 'expanded' : ''}`}>
                        {expandedWeekId === week.id ? '▼' : '►'}
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
                        onDelete={(e) => deleteWeek(week.id, e)}
                        itemName="week"
                    />
                </div>
            </div>

            <div className={`week-content ${expandedWeekId === week.id ? 'expanded' : ''}`}>
                {week.processed && week.data ? (
                    <ProcessedWeekContent
                        week={week}
                        expandedPlayersTab={expandedPlayersTab}
                        expandedAgentsTab={expandedAgentsTab}
                        togglePlayersTab={togglePlayersTab}
                        toggleAgentsTab={toggleAgentsTab}
                        expandedAgentId={expandedAgentId}
                        toggleAgentDetails={toggleAgentDetails}
                    />
                ) : week.hasData ? (
                    <div className="week-actions">
                        <button
                            className="process-btn"
                            onClick={() => processRakeback(week.id)}
                            disabled={processingWeekId === week.id}
                        >
                            {processingWeekId === week.id ? 'Processing...' : 'Process Rakeback'}
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
                                onChange={(e) => handleFileUpload(week.id, e)}
                                ref={el => fileInputRefs.current[week.id] = el}
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
    togglePlayersTab,
    toggleAgentsTab,
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
    // State management
    const [weeks, setWeeks] = useState([]);
    const [players, setPlayers] = useState([]);
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // View control
    const [expandedPlayersTab, setExpandedPlayersTab] = useState(true);
    const [expandedAgentsTab, setExpandedAgentsTab] = useState(false);
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

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch all necessary data
                const [weeksData, weekDataList, playersData, agentsData] = await Promise.all([
                    fetchWeeks(),
                    fetchWeekData(),
                    fetchPlayers(),
                    fetchAgents()
                ]);

                // Merge week data into weeks
                const mergedWeeks = weeksData.map(week => {
                    const data = weekDataList.find(wd => wd.weekId === week.id);
                    return {
                        ...week,
                        data: data || null
                    };
                });

                setWeeks(mergedWeeks);
                setPlayers(playersData);
                setAgents(agentsData);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

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
                startDate,
                endDate,
                hasData: false,
                processed: false
            };

            const savedWeek = await addWeekAPI(newWeek);
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
                    totalFee: overviewSheet['I6']?.v || 0,
                    profitLoss: overviewSheet['Q6']?.v || 0,
                    activePlayers: overviewSheet['G6']?.v || 0,
                    totalHands: overviewSheet['H6']?.v || 0
                };

                // Save extracted data to the week
                const updatedWeek = weeks.find(w => w.id === weekId);
                if (!updatedWeek) return;

                const updatedWeeks = weeks.map(w => {
                    if (w.id === weekId) {
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
                await updateWeek(weekId, { hasData: true });

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
            const week = weeks.find(w => w.id === weekId);
            if (!week || !week.extractedData) {
                throw new Error('No data available to process');
            }

            // 1. Process player rakeback
            const playerResults = week.extractedData.map(player => {
                // Find matching player in rakeback list
                const matchedPlayer = players.find(p =>
                    p.username.toLowerCase() === player.nickname.toLowerCase()
                );

                if (matchedPlayer) {
                    const rakeback = (player.rake * matchedPlayer.percentage / 100).toFixed(2);

                    // Determine agent display
                    let agentDisplay = "-";
                    if (player.superAgent && player.superAgent !== '-') {
                        agentDisplay = `${player.superAgent} (SA)`;
                    } else if (player.agent && player.agent !== '-') {
                        agentDisplay = `${player.agent} (A)`;
                    }

                    return {
                        username: matchedPlayer.username,
                        nickname: player.nickname,
                        rake: player.rake,
                        percentage: matchedPlayer.percentage,
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
                            players: []
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
                    a.username.toLowerCase() === agentName.toLowerCase()
                );

                if (matchedAgent) {
                    const totalDownlineRake = data.totalRake;
                    const rakeback = (totalDownlineRake * matchedAgent.percentage / 100).toFixed(2);

                    // Check if this agent has a super agent (similar to player logic)
                    // Use the first player's agent/superAgent info as reference
                    let agentDisplay = "-";
                    const referencePlayer = week.extractedData.find(p =>
                        p.agent?.toLowerCase() === agentName.toLowerCase()
                    );

                    if (referencePlayer) {
                        if (referencePlayer.superAgent && referencePlayer.superAgent !== '-') {
                            agentDisplay = `${referencePlayer.superAgent} (SA)`;
                        }
                    }

                    return {
                        username: matchedAgent.username,
                        percentage: matchedAgent.percentage,
                        totalDownlineRake,
                        rakeback: parseFloat(rakeback),
                        agentDisplay: agentDisplay,
                        downlinePlayers: data.players.map(player => ({
                            ...player,
                            contribution: ((player.rake / totalDownlineRake) * 100).toFixed(2)
                        }))
                    };
                }

                return null;
            }).filter(Boolean); // Remove null entries (unmatched agents)

            // Calculate totals
            const totalPlayerRake = playerResults.reduce((sum, item) => sum + item.rake, 0);
            const totalPlayerRakeback = playerResults.reduce((sum, item) => sum + item.rakeback, 0);
            const totalAgentRakeback = agentResults.reduce((sum, item) => sum + parseFloat(item.rakeback), 0);

            // Create week data object
            const weekData = {
                weekId,
                playerResults,
                agentResults,
                clubOverview: week.clubOverview || null,
                summary: {
                    totalPlayerRake,
                    totalPlayerRakeback: parseFloat(totalPlayerRakeback.toFixed(2)),
                    totalAgentRakeback: parseFloat(totalAgentRakeback.toFixed(2)),
                    grandTotal: parseFloat((totalPlayerRakeback + totalAgentRakeback).toFixed(2))
                }
            };

            // Save to server
            const savedData = await addWeekDataAPI(weekData);

            // Update week processed status
            await updateWeek(weekId, { processed: true });

            // Update local state
            setWeeks(weeks.map(w => {
                if (w.id === weekId) {
                    return {
                        ...w,
                        processed: true,
                        data: savedData
                    };
                }
                return w;
            }));

            // Auto expand the processed week
            setExpandedWeekId(weekId);
        } catch (err) {
            alert('Error processing rakeback: ' + err.message);
            console.error('Error processing rakeback:', err);
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
        event.stopPropagation();

        // Confirm deletion
        const confirmed = window.confirm('Are you sure you want to delete this week and all associated data?');
        if (!confirmed) return;

        try {
            // First check if there is week data and delete it
            const weekDataToDelete = weeks.find(w => w.id === weekId)?.data;
            if (weekDataToDelete) {
                await deleteWeekDataAPI(weekDataToDelete.id);
            }

            // Then delete the week
            await deleteWeekAPI(weekId);

            // Update state
            setWeeks(weeks.filter(week => week.id !== weekId));

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
                                        key={week.id}
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
                                        togglePlayersTab={togglePlayersTab}
                                        toggleAgentsTab={toggleAgentsTab}
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