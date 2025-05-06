import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Updated trend data preparation function to handle unlimited weeks
const prepareTrendData = (processedWeeks, weekDataList, fieldToExtract) => {
    if (!processedWeeks || !weekDataList || processedWeeks.length === 0) {
        return { labels: [], values: [] };
    }

    // Sort weeks chronologically (oldest to newest)
    const sortedWeeks = [...processedWeeks].sort((a, b) =>
        new Date(a.startDate) - new Date(b.startDate)
    );

    // Extract data for each week
    const chartData = sortedWeeks.map(week => {
        const weekData = weekDataList.find(wd => wd.weekId === week.id);
        if (!weekData || !weekData.clubOverview) {
            return null;
        }

        return {
            label: format(parseISO(week.startDate), 'MMM d'),
            value: weekData.clubOverview[fieldToExtract] || 0
        };
    }).filter(Boolean);

    return {
        labels: chartData.map(item => item.label),
        values: chartData.map(item => item.value)
    };
};

const Dashboard = () => {
    const [weekData, setWeekData] = useState(null);
    const [previousWeekData, setPreviousWeekData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
    const [processedWeeks, setProcessedWeeks] = useState([]);
    const [allWeekData, setAllWeekData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch weeks
                const weeksResponse = await fetch('http://localhost:3001/weeks');
                if (!weeksResponse.ok) throw new Error('Failed to fetch weeks');
                const weeks = await weeksResponse.json();

                // Find processed weeks and sort by date (newest first)
                const allProcessedWeeks = weeks
                    .filter(week => week.processed)
                    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

                setProcessedWeeks(allProcessedWeeks);

                if (allProcessedWeeks.length === 0) {
                    setIsLoading(false);
                    return;
                }

                // Fetch the week data
                const weekDataResponse = await fetch('http://localhost:3001/weekData');
                if (!weekDataResponse.ok) throw new Error('Failed to fetch week data');
                const allWeekDataList = await weekDataResponse.json();

                // Store all week data for trends
                setAllWeekData(allWeekDataList);

                // Get selected week (initially the most recent)
                const selectedWeek = allProcessedWeeks[selectedWeekIndex];
                const previousWeek = allProcessedWeeks[selectedWeekIndex + 1] || null;

                // Find the data for the selected and previous weeks
                const selectedWeekData = allWeekDataList.find(wd => wd.weekId === selectedWeek.id);
                const previousWeekData = previousWeek
                    ? allWeekDataList.find(wd => wd.weekId === previousWeek.id)
                    : null;

                if (!selectedWeekData) throw new Error('Selected week data not found');

                // Set state with the found data
                setWeekData({
                    ...selectedWeekData,
                    startDate: selectedWeek.startDate,
                    endDate: selectedWeek.endDate
                });

                if (previousWeekData) {
                    setPreviousWeekData({
                        ...previousWeekData,
                        startDate: previousWeek.startDate,
                        endDate: previousWeek.endDate
                    });
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedWeekIndex]);

    const calculateChange = (current, previous) => {
        if (!previous) return null;

        const change = ((current - previous) / previous) * 100;
        return {
            value: Math.abs(change).toFixed(1),
            isPositive: change >= 0,
            indicator: change >= 0 ? '↑' : '↓'
        };
    };

    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getWeekDateRange = () => {
        if (!weekData) return '';
        return `${format(parseISO(weekData.startDate), 'MMM d')} - ${format(parseISO(weekData.endDate), 'MMM d, yyyy')}`;
    };

    const navigateToPreviousWeek = () => {
        if (selectedWeekIndex < processedWeeks.length - 1) {
            setSelectedWeekIndex(selectedWeekIndex + 1);
        }
    };

    const navigateToNextWeek = () => {
        if (selectedWeekIndex > 0) {
            setSelectedWeekIndex(selectedWeekIndex - 1);
        }
    };

    const feeTrend = prepareTrendData(processedWeeks, allWeekData, 'totalFee');

    // Chart.js options and data
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return formatCurrency(context.parsed.y);
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                }
            },
            y: {
                beginAtZero: false,
                ticks: {
                    callback: function (value) {
                        return formatCurrency(value);
                    }
                }
            }
        }
    };

    const chartData = {
        labels: feeTrend.labels,
        datasets: [
            {
                data: feeTrend.values,
                borderColor: '#64b5f6',
                backgroundColor: 'rgba(100, 181, 246, 0.2)',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#64b5f6',
                tension: 0.3,
                fill: true
            }
        ]
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>Dashboard</h1>
                <p className="page-description">Weekly performance overview</p>
            </header>

            {isLoading ? (
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard data...</p>
                </div>
            ) : error ? (
                <div className="dashboard-error">
                    <h2>Error Loading Dashboard</h2>
                    <p>{error}</p>
                    <p>Please check your connection and try again.</p>
                </div>
            ) : !weekData ? (
                <div className="dashboard-empty">
                    <div className="placeholder-icon">📊</div>
                    <h2>No Data Available</h2>
                    <p>Process your first week's data to view the dashboard statistics.</p>
                </div>
            ) : (
                <>
                    <div className="dashboard-header">
                        <div className="current-week">
                            <div className="week-navigation">
                                <button
                                    className="week-nav-btn"
                                    onClick={navigateToPreviousWeek}
                                    disabled={selectedWeekIndex >= processedWeeks.length - 1}
                                    title="View previous week"
                                >
                                    &lt;
                                </button>
                                <div className="week-info">
                                    <span className="week-label">Current Week:</span>
                                    <span className="week-value">{getWeekDateRange()}</span>
                                </div>
                                <button
                                    className="week-nav-btn"
                                    onClick={navigateToNextWeek}
                                    disabled={selectedWeekIndex <= 0}
                                    title="View more recent week"
                                >
                                    &gt;
                                </button>
                            </div>
                        </div>
                        {weekData.clubOverview && (
                            <div className="club-name">
                                <span>{weekData.clubOverview.clubName}</span>
                            </div>
                        )}
                    </div>

                    <div className="dashboard-grid">
                        {/* Total Fee Card - Expanded with larger font and chart */}
                        <div className="metric-card total-fee">
                            <h2>Total Fee</h2>
                            <div className="metric-value-container">
                                <div className="metric-value primary">
                                    {weekData.clubOverview ? formatCurrency(weekData.clubOverview.totalFee) : 'N/A'}
                                </div>
                                {previousWeekData && previousWeekData.clubOverview && (
                                    <div className="change-indicator">
                                        {(() => {
                                            const change = calculateChange(
                                                weekData.clubOverview.totalFee,
                                                previousWeekData.clubOverview.totalFee
                                            );
                                            return (
                                                <span className={`change ${change.isPositive ? 'positive' : 'negative'}`}>
                                                    {change.indicator} {change.value}%
                                                </span>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                            {/* <span className="previous-label">vs previous week</span> */}

                            <div className="trend-chart-container">
                                <Line options={chartOptions} data={chartData} />
                                {/* <div className="trend-label">Weekly Trend</div> */}
                            </div>
                        </div>

                        {/* P&L Card */}
                        <div className="metric-card pl">
                            <h2>Profit & Loss</h2>
                            <div className="metric-value-container">
                                {weekData.clubOverview && (
                                    <div className={`metric-value ${weekData.clubOverview.profitLoss >= 0 ? 'positive' : 'negative'}`}>
                                        {formatCurrency(weekData.clubOverview.profitLoss)}
                                    </div>
                                )}
                                {previousWeekData && previousWeekData.clubOverview && (
                                    <div className="change-indicator">
                                        {(() => {
                                            const currentPL = weekData.clubOverview.profitLoss;
                                            const previousPL = previousWeekData.clubOverview.profitLoss;

                                            if (currentPL >= 0 && previousPL >= 0) {
                                                const change = calculateChange(currentPL, previousPL);
                                                return (
                                                    <span className={`change ${change.isPositive ? 'positive' : 'negative'}`}>
                                                        {change.indicator} {change.value}%
                                                    </span>
                                                );
                                            } else if (currentPL < 0 && previousPL < 0) {
                                                const change = calculateChange(Math.abs(currentPL), Math.abs(previousPL));
                                                return (
                                                    <span className={`change ${!change.isPositive ? 'positive' : 'negative'}`}>
                                                        {!change.isPositive ? '↑' : '↓'} {change.value}%
                                                    </span>
                                                );
                                            } else {
                                                return (
                                                    <span className={`change ${currentPL >= 0 ? 'positive' : 'negative'}`}>
                                                        {currentPL >= 0 ? '↑' : '↓'}
                                                    </span>
                                                );
                                            }
                                        })()}
                                    </div>
                                )}
                            </div>
                            {/* <span className="previous-label">vs previous week</span> */}
                        </div>

                        {/* Active Players Card */}
                        <div className="metric-card active-players">
                            <h2>Active Players</h2>
                            <div className="metric-value-container">
                                <div className="metric-value">
                                    {weekData.clubOverview ? formatNumber(weekData.clubOverview.activePlayers) : 'N/A'}
                                </div>
                                {previousWeekData && previousWeekData.clubOverview && (
                                    <div className="change-indicator">
                                        {(() => {
                                            const change = calculateChange(
                                                weekData.clubOverview.activePlayers,
                                                previousWeekData.clubOverview.activePlayers
                                            );
                                            return (
                                                <span className={`change ${change.isPositive ? 'positive' : 'negative'}`}>
                                                    {change.indicator} {change.value}%
                                                </span>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                            {/* <span className="previous-label">vs previous week</span> */}
                        </div>

                        {/* Total Hands Card */}
                        <div className="metric-card total-hands">
                            <h2>Total Hands</h2>
                            <div className="metric-value-container">
                                <div className="metric-value">
                                    {weekData.clubOverview ? formatNumber(weekData.clubOverview.totalHands) : 'N/A'}
                                </div>
                                {previousWeekData && previousWeekData.clubOverview && (
                                    <div className="change-indicator">
                                        {(() => {
                                            const change = calculateChange(
                                                weekData.clubOverview.totalHands,
                                                previousWeekData.clubOverview.totalHands
                                            );
                                            return (
                                                <span className={`change ${change.isPositive ? 'positive' : 'negative'}`}>
                                                    {change.indicator} {change.value}%
                                                </span>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                            {/* <span className="previous-label">vs previous week</span> */}
                        </div>
                    </div>

                    <div className="dashboard-section">
                        <h2 className="section-title">Rakeback Summary</h2>
                        <div className="summary-stats">
                            <div className="summary-stat">
                                <span className="stat-label">Player Rakeback</span>
                                <span className="stat-value">
                                    {formatCurrency(weekData.summary.totalPlayerRakeback)}
                                </span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">Agent Rakeback</span>
                                <span className="stat-value">
                                    {formatCurrency(weekData.summary.totalAgentRakeback)}
                                </span>
                            </div>
                            <div className="summary-stat total">
                                <span className="stat-label">Total Rakeback</span>
                                <span className="stat-value">
                                    {formatCurrency(weekData.summary.grandTotal)}
                                </span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">Fee to RB Ratio</span>
                                <span className="stat-value">
                                    {weekData.clubOverview && (
                                        `${((weekData.summary.grandTotal / weekData.clubOverview.totalFee) * 100).toFixed(1)}%`
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;