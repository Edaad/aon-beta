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
import { fetchSuperAgents, addSuperAgent, updateSuperAgent, deleteSuperAgent } from '../../../services/apis';
import './SuperAgentsList.css';

const SuperAgentsList = () => {
    const { currentClub } = useClub();
    const [superAgents, setSuperAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [isAdding, setIsAdding] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPercentage, setNewPercentage] = useState('');
    const [useThresholds, setUseThresholds] = useState(false);
    const [newThresholds, setNewThresholds] = useState([{ start: '', end: '', percentage: '' }]);
    const [inputError, setInputError] = useState('');

    // Edit states for modal editing
    const [editingSuperAgent, setEditingSuperAgent] = useState(null);
    const [editUsername, setEditUsername] = useState('');
    const [editPercentage, setEditPercentage] = useState('');
    const [editThresholds, setEditThresholds] = useState([{ start: '', end: '', percentage: '' }]);

    const loadSuperAgents = useCallback(async () => {
        if (!currentClub) return;
        try {
            const data = await fetchSuperAgents(currentClub.name);
            setSuperAgents(data);
            setIsLoading(false);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    }, [currentClub]);

    // Fetch data on component mount and when club changes
    useEffect(() => {
        if (currentClub) {
            loadSuperAgents();
        }
    }, [currentClub, loadSuperAgents]);

    // Add super agent with API
    const handleAddSuperAgent = async () => {
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

        // Check if username already exists
        const existingAgent = superAgents.find(agent =>
            agent.nickname.toLowerCase() === newUsername.toLowerCase()
        );
        if (existingAgent) {
            setInputError('Username already exists');
            return;
        }

        const newSuperAgent = {
            nickname: newUsername,
            rakebackType: useThresholds ? 'threshold' : 'flat',
            rakeback: useThresholds ? 0 : parseFloat(newPercentage),
            thresholds: useThresholds ? newThresholds.map(t => ({
                start: parseFloat(t.start),
                end: parseFloat(t.end),
                percentage: parseFloat(t.percentage)
            })) : []
        };

        try {
            const savedSuperAgent = await addSuperAgent(currentClub.name, newSuperAgent);
            setSuperAgents([...superAgents, savedSuperAgent]);

            // Reset form
            setNewUsername('');
            setNewPercentage('');
            setUseThresholds(false);
            setNewThresholds([{ start: '', end: '', percentage: '' }]);
            setIsAdding(false);
            setInputError('');
        } catch (err) {
            setInputError('Error saving super agent: ' + err.message);
        }
    };

    // Cancel adding
    const cancelAdding = () => {
        setIsAdding(false);
        setNewUsername('');
        setNewPercentage('');
        setUseThresholds(false);
        setNewThresholds([{ start: '', end: '', percentage: '' }]);
        setInputError('');
    };

    // Delete super agent with API
    const handleDeleteSuperAgent = async (superAgentId) => {
        try {
            await deleteSuperAgent(currentClub.name, superAgentId);
            loadSuperAgents();
        } catch (err) {
            console.error('Error deleting super agent:', err);
            alert('Error deleting super agent: ' + err.message);
        }
    };

    // Update super agent with inline editing
    const handleUpdateSuperAgent = async (superAgentId, updatedData) => {
        try {
            const updatedSuperAgent = {
                nickname: updatedData.nickname.trim(),
                rakeback: parseFloat(updatedData.rakeback)
            };

            await updateSuperAgent(currentClub.name, superAgentId, updatedSuperAgent);
            loadSuperAgents();
        } catch (err) {
            console.error('Error updating super agent:', err);
            throw err;
        }
    };

    // Edit functions for modal editing of threshold super agents
    const startEditSuperAgent = (superAgent) => {
        setEditingSuperAgent(superAgent);
        setEditUsername(superAgent.nickname);

        if (superAgent.rakebackType === 'threshold') {
            setEditThresholds(superAgent.thresholds || [{ start: '', end: '', percentage: '' }]);
        } else {
            setEditPercentage(superAgent.rakeback?.toString() || '');
        }
    };

    const cancelEdit = () => {
        setEditingSuperAgent(null);
        setEditUsername('');
        setEditPercentage('');
        setEditThresholds([{ start: '', end: '', percentage: '' }]);
    };

    const saveEditedSuperAgent = async () => {
        if (!editingSuperAgent) return;

        try {
            let updateData = { nickname: editUsername };

            if (editingSuperAgent.rakebackType === 'threshold') {
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

            await handleUpdateSuperAgent(editingSuperAgent._id, updateData);
            cancelEdit();
            setInputError('');
        } catch (error) {
            setInputError('Error saving super agent');
            console.error('Error saving super agent:', error);
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
                    return <span className="threshold-indicator">Thresholds</span>;
                }
                return `${agent.rakeback}%`;
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
                                        startEditSuperAgent(agent);
                                    } else {
                                        startEdit(agent);
                                    }
                                }}
                            >
                                <FaEdit />
                            </button>
                            <DeleteButton
                                onDelete={() => handleDeleteSuperAgent(agent._id)}
                                itemName={agent.nickname}
                            />
                        </>
                    )}
                </div>
            )
        }
    ];

    const renderContent = () => {
        if (!currentClub || isLoading) {
            return <LoadingState message="Loading super agents..." />;
        }

        if (error) {
            return <ErrorState message={error} />;
        }

        if (superAgents.length > 0) {
            return (
                <RakebackTable
                    data={superAgents}
                    columns={columns}
                    onUpdate={handleUpdateSuperAgent}
                    editableFields={['nickname', 'rakeback']}
                />
            );
        }

        return (
            <EmptyState
                icon="👑"
                title="No Super Agents Yet"
                message="Add your first super agent to the rakeback list"
            />
        );
    };

    return (
        <div className="page-container">
            <PageHeader
                title="Super Agents RB List"
                description="Manage rakeback percentages for super agents"
            />

            <ContentCard className="rakeback-card">
                {renderContent()}

                {isAdding ? (
                    <AddItemForm
                        error={inputError}
                        onCancel={cancelAdding}
                        onSubmit={handleAddSuperAgent}
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
                        </div>
                    </AddItemForm>
                ) : (
                    <AddButton
                        onClick={() => setIsAdding(true)}
                        label="Add Super Agent"
                    />
                )}
            </ContentCard>

            {/* Edit Super Agent Modal for Threshold Super Agents */}
            {editingSuperAgent && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <EditItemForm
                            error={inputError}
                            onSubmit={saveEditedSuperAgent}
                            onCancel={cancelEdit}
                            submitLabel="Update Super Agent"
                        >
                            <InputGroup
                                label="Username"
                                id="username"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                                placeholder="Enter username"
                            />

                            {editingSuperAgent.rakebackType === 'threshold' ? (
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
                        </EditItemForm>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAgentsList;
