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
    const [newThresholds, setNewThresholds] = useState([{ start: '', end: '', percentage: '' }]);
    const [inputError, setInputError] = useState('');

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    // Edit states for modal editing
    const [editingAgent, setEditingAgent] = useState(null);
    const [editUsername, setEditUsername] = useState('');
    const [editPercentage, setEditPercentage] = useState('');
    const [editUseTaxRebate, setEditUseTaxRebate] = useState(false);
    const [editThresholds, setEditThresholds] = useState([{ start: '', end: '', percentage: '' }]);

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

        const newAgent = {
            nickname: newUsername,
            rakebackType: useThresholds ? 'threshold' : 'flat',
            rakeback: useThresholds ? 0 : parseFloat(newPercentage),
            taxRebate: useTaxRebate,
            thresholds: useThresholds ? newThresholds.map(t => ({
                start: parseFloat(t.start),
                end: parseFloat(t.end),
                percentage: parseFloat(t.percentage)
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
            setNewThresholds([{ start: '', end: '', percentage: '' }]);
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
        setNewThresholds([{ start: '', end: '', percentage: '' }]);
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
    const handleUpdateAgent = async (agentId, updatedData) => {
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
        setEditUseTaxRebate(agent.taxRebate || false);

        if (agent.rakebackType === 'threshold') {
            setEditThresholds(agent.thresholds || [{ start: '', end: '', percentage: '' }]);
        } else {
            setEditPercentage(agent.rakeback?.toString() || '');
        }
    };

    const cancelEdit = () => {
        setEditingAgent(null);
        setEditUsername('');
        setEditPercentage('');
        setEditUseTaxRebate(false);
        setEditThresholds([{ start: '', end: '', percentage: '' }]);
    };

    const saveEditedAgent = async () => {
        if (!editingAgent) return;

        try {
            let updateData = { 
                nickname: editUsername,
                taxRebate: editUseTaxRebate
            };

            if (editingAgent.rakebackType === 'threshold') {
                // Validate thresholds
                const validThresholds = editThresholds.filter(t =>
                    t.start !== '' && t.end !== '' && t.percentage !== ''
                );

                if (validThresholds.length === 0) {
                    setInputError('At least one complete threshold is required');
                    return;
                }

                updateData.thresholds = validThresholds.map(t => ({
                    start: parseFloat(t.start),
                    end: parseFloat(t.end),
                    percentage: parseFloat(t.percentage)
                }));

                updateData.rakebackType = 'threshold';
            } else {
                // Validate flat percentage
                const percentage = parseFloat(editPercentage);
                if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                    setInputError('Please enter a valid percentage between 0 and 100');
                    return;
                }

                updateData.rakeback = percentage;
                updateData.rakebackType = 'flat';
            }

            await handleUpdateAgent(editingAgent._id, updateData);
            cancelEdit();
            setInputError('');
        } catch (error) {
            setInputError('Error saving agent');
            console.error('Error saving agent:', error);
        }
    };

    // Table columns configuration
    const columns = [
        { header: 'Username', accessor: 'nickname' },
        {
            header: 'Percentage (%)',
            accessor: 'rakeback',
            render: (agent) => {
                if (agent.rakebackType === 'threshold') {
                    return (
                        <span className="threshold-indicator">
                            Thresholds{agent.taxRebate ? ' + T/R' : ''}
                        </span>
                    );
                }
                return `${agent.rakeback}%${agent.taxRebate ? ' + T/R' : ''}`;
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
                                onClick={() => {
                                    if (agent.rakebackType === 'threshold') {
                                        startEditAgent(agent);
                                    } else {
                                        startEdit(agent);
                                    }
                                }}
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
                    onUpdate={handleUpdateAgent}
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
                        </div>
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

                            {editingAgent.rakebackType === 'threshold' ? (
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
                                        checked={editUseTaxRebate}
                                        onChange={(e) => setEditUseTaxRebate(e.target.checked)}
                                    />
                                    Use Tax/Rebate
                                </label>
                            </div>
                        </EditItemForm>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentsList;