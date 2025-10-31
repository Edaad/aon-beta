import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import PageHeader from '../../../components/PageHeader/PageHeader';
import ContentCard from '../../../components/ContentCard/ContentCard';
import LoadingState from '../../../components/LoadingState/LoadingState';
import ErrorState from '../../../components/ErrorState/ErrorState';
import EmptyState from '../../../components/EmptyState/EmptyState';
import RakebackTable from '../../../components/RakebackTable/RakebackTable';
import AddButton from '../../../components/AddButton/AddButton';
import AddItemForm from '../../../components/AddItemForm/AddItemForm';
import EditItemForm from '../../../components/EditItemForm/EditItemForm';
import InputGroup from '../../../components/InputGroup/InputGroup';
import ThresholdManager from '../../../components/ThresholdManager/ThresholdManager';
import RoutingManager from '../../../components/RoutingManager/RoutingManager';
import DeleteButton from '../../../components/DeleteButton/DeleteButton';
import { useClub } from '../../../contexts/ClubContext';
import { fetchAgents, addAgent, updateAgent, deleteAgent } from '../../../services/apis';
import './AgentsList.css';

const AgentsList = () => {
    const { currentClub } = useClub();
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isAdding, setIsAdding] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPercentage, setNewPercentage] = useState('');
    const [useThresholds, setUseThresholds] = useState(false);
    const [useTaxRebate, setUseTaxRebate] = useState(false);
    const [useRouting, setUseRouting] = useState(false);
    const [newThresholds, setNewThresholds] = useState([{ start: '', end: '', percentage: '' }]);
    const [newRouting, setNewRouting] = useState([{ username: '', type: 'player', percentage: '' }]);
    const [inputError, setInputError] = useState('');

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    // Edit states for modal editing
    const [editingAgent, setEditingAgent] = useState(null);
    const [editUsername, setEditUsername] = useState('');
    const [editPercentage, setEditPercentage] = useState('');
    const [editUseThresholds, setEditUseThresholds] = useState(false);
    const [editUseTaxRebate, setEditUseTaxRebate] = useState(false);
    const [editUseRouting, setEditUseRouting] = useState(false);
    const [editThresholds, setEditThresholds] = useState([{ start: '', end: '', percentage: '' }]);
    const [editRouting, setEditRouting] = useState([{ username: '', type: 'player', percentage: '' }]);

    const loadAgents = useCallback(async () => {
        if (!currentClub) return;
        try {
            const data = await fetchAgents(currentClub.name);
            setAgents(data);
            setIsLoading(false);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    }, [currentClub]);

    // Fetch data on component mount and when club changes
    useEffect(() => {
        if (currentClub) {
            loadAgents();
        }
    }, [currentClub, loadAgents]);

    // Add agent with API
    const handleAddAgent = async () => {
        // Validation
        if (!newUsername.trim()) {
            setInputError('Username cannot be empty');
            return;
        }

        if (useThresholds) {
            // Validate thresholds
            if (newThresholds.length === 0) {
                setInputError('At least one threshold is required');
                return;
            }

            for (let i = 0; i < newThresholds.length; i++) {
                const threshold = newThresholds[i];
                if (!threshold.start || !threshold.end || !threshold.percentage) {
                    setInputError(`All threshold fields are required for threshold ${i + 1}`);
                    return;
                }

                const start = parseFloat(threshold.start);
                const end = parseFloat(threshold.end);
                const percentage = parseFloat(threshold.percentage);

                if (isNaN(start) || isNaN(end) || isNaN(percentage)) {
                    setInputError(`All threshold values must be numbers for threshold ${i + 1}`);
                    return;
                }

                if (start >= end) {
                    setInputError(`Start value must be less than end value for threshold ${i + 1}`);
                    return;
                }

                if (percentage < 0 || percentage > 100) {
                    setInputError(`Percentage must be between 0 and 100 for threshold ${i + 1}`);
                    return;
                }
            }
        } else {
            if (!newPercentage.trim()) {
                setInputError('Percentage cannot be empty');
                return;
            }

            const percentageNum = parseFloat(newPercentage);
            if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
                setInputError('Percentage must be a number between 0 and 100');
                return;
            }
        }

        // Validate routing if enabled
        if (useRouting) {
            if (newRouting.length === 0) {
                setInputError('At least one routing entry is required');
                return;
            }

            for (let i = 0; i < newRouting.length; i++) {
                const route = newRouting[i];
                if (!route.username || !route.percentage) {
                    setInputError(`Username and percentage are required for routing entry ${i + 1}`);
                    return;
                }

                const percentage = parseFloat(route.percentage);
                if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                    setInputError(`Percentage must be between 0 and 100 for routing entry ${i + 1}`);
                    return;
                }
            }
        }

        const newAgent = {
            nickname: newUsername,
            rakebackType: useThresholds ? 'threshold' : 'flat',
            rakeback: useThresholds ? 0 : parseFloat(newPercentage),
            taxRebate: useTaxRebate,
            thresholds: useThresholds ? newThresholds.map(t => ({
                start: parseFloat(t.start),
                end: parseFloat(t.end),
                percentage: parseFloat(t.percentage)
            })) : [],
            routing: useRouting ? newRouting.map(r => ({
                username: r.username,
                type: r.type,
                percentage: parseFloat(r.percentage)
            })) : []
        };

        try {
            const savedAgent = await addAgent(currentClub.name, newAgent);
            setAgents([...agents, savedAgent]);

            // Reset form
            setNewUsername('');
            setNewPercentage('');
            setUseThresholds(false);
            setUseTaxRebate(false);
            setUseRouting(false);
            setNewThresholds([{ start: '', end: '', percentage: '' }]);
            setNewRouting([{ username: '', type: 'player', percentage: '' }]);
            setIsAdding(false);
            setInputError('');
        } catch (err) {
            setInputError('Error saving agent: ' + err.message);
        }
    };

    // Cancel adding
    const cancelAdding = () => {
        setIsAdding(false);
        setNewUsername('');
        setNewPercentage('');
        setUseThresholds(false);
        setUseTaxRebate(false);
        setUseRouting(false);
        setNewThresholds([{ start: '', end: '', percentage: '' }]);
        setNewRouting([{ username: '', type: 'player', percentage: '' }]);
        setInputError('');
    };

    // Delete agent with API
    const handleDeleteAgent = async (agentId) => {
        try {
            await deleteAgent(currentClub.name, agentId);
            loadAgents();
        } catch (err) {
            console.error('Error deleting agent:', err);
            alert('Error deleting agent: ' + err.message);
        }
    };

    // Update agent with inline editing
    const handleInlineUpdateAgent = async (agentId, updatedData) => {
        try {
            const updatedAgent = {
                nickname: updatedData.nickname.trim(),
                rakeback: parseFloat(updatedData.rakeback)
            };

            await updateAgent(currentClub.name, agentId, updatedAgent);
            loadAgents();
        } catch (err) {
            console.error('Error updating agent:', err);
            throw err;
        }
    };

    // Edit functions for modal editing of threshold agents
    const startEditAgent = (agent) => {
        setEditingAgent(agent);
        setEditUsername(agent.nickname);
        setEditUseThresholds(agent.rakebackType === 'threshold');
        setEditUseTaxRebate(agent.taxRebate || false);
        setEditUseRouting(agent.routing && agent.routing.length > 0);

        if (agent.rakebackType === 'threshold') {
            setEditThresholds(agent.thresholds && agent.thresholds.length > 0
                ? agent.thresholds
                : [{ start: '', end: '', percentage: '' }]);
            setEditPercentage('');
        } else {
            setEditPercentage(agent.rakeback?.toString() || '');
            setEditThresholds([{ start: '', end: '', percentage: '' }]);
        }

        // Set routing data
        setEditRouting(agent.routing && agent.routing.length > 0
            ? agent.routing
            : [{ username: '', type: 'player', percentage: '' }]);
    };

    const cancelEdit = () => {
        setEditingAgent(null);
        setEditUsername('');
        setEditPercentage('');
        setEditUseThresholds(false);
        setEditUseTaxRebate(false);
        setEditUseRouting(false);
        setEditThresholds([{ start: '', end: '', percentage: '' }]);
        setEditRouting([{ username: '', type: 'player', percentage: '' }]);
    };

    const saveEditedAgent = async () => {
        if (!editingAgent) return;

        // Validation
        if (!editUsername.trim()) {
            setInputError('Username cannot be empty');
            return;
        }

        if (editUseThresholds) {
            // Validate thresholds
            if (editThresholds.length === 0) {
                setInputError('At least one threshold is required');
                return;
            }

            for (let i = 0; i < editThresholds.length; i++) {
                const threshold = editThresholds[i];
                if (!threshold.start || !threshold.end || !threshold.percentage) {
                    setInputError(`All threshold fields are required for threshold ${i + 1}`);
                    return;
                }

                const start = parseFloat(threshold.start);
                const end = parseFloat(threshold.end);
                const percentage = parseFloat(threshold.percentage);

                if (isNaN(start) || isNaN(end) || isNaN(percentage)) {
                    setInputError(`All threshold values must be numbers for threshold ${i + 1}`);
                    return;
                }

                if (start >= end) {
                    setInputError(`Start value must be less than end value for threshold ${i + 1}`);
                    return;
                }

                if (percentage < 0 || percentage > 100) {
                    setInputError(`Percentage must be between 0 and 100 for threshold ${i + 1}`);
                    return;
                }
            }
        } else {
            if (!editPercentage.trim()) {
                setInputError('Percentage cannot be empty');
                return;
            }

            const percentageNum = parseFloat(editPercentage);
            if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
                setInputError('Percentage must be a number between 0 and 100');
                return;
            }
        }

        // Validate routing if enabled
        if (editUseRouting) {
            if (editRouting.length === 0) {
                setInputError('At least one routing entry is required');
                return;
            }

            for (let i = 0; i < editRouting.length; i++) {
                const route = editRouting[i];
                if (!route.username || !route.percentage) {
                    setInputError(`Username and percentage are required for routing entry ${i + 1}`);
                    return;
                }

                const percentage = parseFloat(route.percentage);
                if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                    setInputError(`Percentage must be between 0 and 100 for routing entry ${i + 1}`);
                    return;
                }
            }
        }

        const updatedAgent = {
            nickname: editUsername.trim(),
            rakebackType: editUseThresholds ? 'threshold' : 'flat',
            rakeback: editUseThresholds ? 0 : parseFloat(editPercentage),
            taxRebate: editUseTaxRebate,
            thresholds: editUseThresholds ? editThresholds.map(t => ({
                start: parseFloat(t.start),
                end: parseFloat(t.end),
                percentage: parseFloat(t.percentage)
            })) : [],
            routing: editUseRouting ? editRouting.map(r => ({
                username: r.username,
                type: r.type,
                percentage: parseFloat(r.percentage)
            })) : []
        };

        try {
            await updateAgent(currentClub.name, editingAgent._id, updatedAgent);
            loadAgents();
            cancelEdit();
            setInputError('');
        } catch (error) {
            setInputError('Error saving agent: ' + error.message);
        }
    };

    // Table columns configuration
    const columns = [
        { header: 'Username', accessor: 'nickname' },
        {
            header: 'Percentage (%)',
            accessor: 'rakeback',
            render: (agent) => {
                const hasRouting = agent.routing && agent.routing.length > 0;
                let displayText = '';

                if (agent.rakebackType === 'threshold') {
                    displayText = 'Thresholds';
                } else {
                    displayText = `${agent.rakeback}%`;
                }

                // Add indicators
                const indicators = [];
                if (agent.taxRebate) indicators.push('T/R');
                if (hasRouting) indicators.push('Routing');

                if (indicators.length > 0) {
                    displayText += ` + ${indicators.join(' + ')}`;
                }

                return agent.rakebackType === 'threshold' ? (
                    <span className="threshold-indicator">{displayText}</span>
                ) : displayText;
            }
        },
        {
            header: 'Actions',
            render: (agent, isEditing, startEdit, cancelEdit, saveEdit) => (
                <div className="inline-edit-actions">
                    {isEditing ? (
                        <>
                            <button className="inline-edit-btn save" onClick={saveEdit}>
                                <FaSave />
                            </button>
                            <button className="inline-edit-btn cancel" onClick={cancelEdit}>
                                <FaTimes />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="inline-edit-btn edit"
                                onClick={() => startEditAgent(agent)}
                            >
                                <FaEdit />
                            </button>
                            <DeleteButton
                                onDelete={() => handleDeleteAgent(agent._id)}
                                itemName={agent.nickname}
                            />
                        </>
                    )}
                </div>
            )
        }
    ];

    // Filter agents based on search term
    const filteredAgents = agents.filter(agent =>
        agent.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderContent = () => {
        if (!currentClub || isLoading) {
            return <LoadingState message="Loading agents..." />;
        }

        if (error) {
            return <ErrorState message={error} />;
        }

        if (filteredAgents.length > 0) {
            return (
                <RakebackTable
                    data={filteredAgents}
                    columns={columns}
                    onUpdate={handleInlineUpdateAgent}
                    editableFields={['nickname', 'rakeback']}
                />
            );
        }

        return (
            <EmptyState
                title={searchTerm ? "No Agents Found" : "No Agents Yet"}
                message={searchTerm ? "No agents match your search" : "Add your first agent to the rakeback list"}
            />
        );
    };

    return (
        <div className="page-container">
            <PageHeader
                title="Agents RB List"
                description="Manage rakeback percentages for agents"
            />

            {/* Search Bar */}
            <div className="search-container">
                <InputGroup
                    label="Search Agents"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by username..."
                />
            </div>

            <ContentCard className="rakeback-card">
                {renderContent()}

                {isAdding ? (
                    <AddItemForm
                        error={inputError}
                        onCancel={cancelAdding}
                        onSubmit={handleAddAgent}
                        submitLabel="Save"
                    >
                        <InputGroup
                            label="Username"
                            id="username"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter username"
                        />

                        {useThresholds ? (
                            <div className="threshold-section">
                                <label className="threshold-label">Rakeback Thresholds</label>
                                <ThresholdManager
                                    thresholds={newThresholds}
                                    onChange={setNewThresholds}
                                />
                            </div>
                        ) : (
                            <InputGroup
                                label="Percentage (%)"
                                id="percentage"
                                type="number"
                                value={newPercentage}
                                onChange={(e) => setNewPercentage(e.target.value)}
                                min="0"
                                max="100"
                                placeholder="Enter percentage"
                            />
                        )}

                        <div className="threshold-checkbox-container">
                            <label className="threshold-checkbox">
                                <input
                                    type="checkbox"
                                    checked={useThresholds}
                                    onChange={(e) => setUseThresholds(e.target.checked)}
                                />
                                Use Thresholds
                            </label>
                            <label className="threshold-checkbox">
                                <input
                                    type="checkbox"
                                    checked={useTaxRebate}
                                    onChange={(e) => setUseTaxRebate(e.target.checked)}
                                />
                                Use Tax/Rebate
                            </label>
                            <label className="threshold-checkbox">
                                <input
                                    type="checkbox"
                                    checked={useRouting}
                                    onChange={(e) => setUseRouting(e.target.checked)}
                                />
                                Use Routing
                            </label>
                        </div>

                        {useRouting && (
                            <div className="threshold-section">
                                <label className="threshold-label">Routing Configuration</label>
                                <RoutingManager
                                    routing={newRouting}
                                    onChange={setNewRouting}
                                />
                            </div>
                        )}
                    </AddItemForm>
                ) : (
                    <AddButton
                        onClick={() => setIsAdding(true)}
                        label="Add Agent"
                    />
                )}
            </ContentCard>

            {/* Edit Agent Modal for Threshold Agents */}
            {editingAgent && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <EditItemForm
                            error={inputError}
                            onSubmit={saveEditedAgent}
                            onCancel={cancelEdit}
                            submitLabel="Update Agent"
                        >
                            <InputGroup
                                label="Username"
                                id="username"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                                placeholder="Enter username"
                            />

                            {editUseThresholds ? (
                                <div className="threshold-section">
                                    <label className="threshold-label">Rakeback Thresholds</label>
                                    <ThresholdManager
                                        thresholds={editThresholds}
                                        onChange={setEditThresholds}
                                    />
                                </div>
                            ) : (
                                <InputGroup
                                    label="Percentage (%)"
                                    id="percentage"
                                    type="number"
                                    value={editPercentage}
                                    onChange={(e) => setEditPercentage(e.target.value)}
                                    min="0"
                                    max="100"
                                    placeholder="Enter percentage"
                                />
                            )}

                            <div className="threshold-checkbox-container">
                                <label className="threshold-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={editUseThresholds}
                                        onChange={(e) => setEditUseThresholds(e.target.checked)}
                                    />
                                    Use Thresholds
                                </label>
                                <label className="threshold-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={editUseTaxRebate}
                                        onChange={(e) => setEditUseTaxRebate(e.target.checked)}
                                    />
                                    Use Tax/Rebate
                                </label>
                                <label className="threshold-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={editUseRouting}
                                        onChange={(e) => setEditUseRouting(e.target.checked)}
                                    />
                                    Use Routing
                                </label>
                            </div>

                            {editUseRouting && (
                                <div className="threshold-section">
                                    <label className="threshold-label">Routing Configuration</label>
                                    <RoutingManager
                                        routing={editRouting}
                                        onChange={setEditRouting}
                                    />
                                </div>
                            )}
                        </EditItemForm>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentsList;