import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../../components/PageHeader/PageHeader';
import ContentCard from '../../../components/ContentCard/ContentCard';
import LoadingState from '../../../components/LoadingState/LoadingState';
import ErrorState from '../../../components/ErrorState/ErrorState';
import EmptyState from '../../../components/EmptyState/EmptyState';
import RakebackTable from '../../../components/RakebackTable/RakebackTable';
import AddButton from '../../../components/AddButton/AddButton';
import AddItemForm from '../../../components/AddItemForm/AddItemForm';
import InputGroup from '../../../components/InputGroup/InputGroup';
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
    const [inputError, setInputError] = useState('');

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

        if (!newPercentage.trim()) {
            setInputError('Percentage cannot be empty');
            return;
        }

        const percentageNum = parseFloat(newPercentage);
        if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
            setInputError('Percentage must be a number between 0 and 100');
            return;
        }

        const newAgent = {
            nickname: newUsername,
            rakeback: percentageNum
        };

        try {
            const savedAgent = await addAgent(currentClub.name, newAgent);
            setAgents([...agents, savedAgent]);

            // Reset form
            setNewUsername('');
            setNewPercentage('');
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

    // Table columns configuration
    const columns = [
        { header: 'Username', accessor: 'nickname' },
        {
            header: 'Percentage (%)',
            accessor: 'rakeback'
        },
        {
            header: 'Actions',
            render: (agent, isEditing, startEdit, cancelEdit, saveEdit) => (
                <div className="inline-edit-actions">
                    {isEditing ? (
                        <>
                            <button className="inline-edit-btn save" onClick={saveEdit}>
                                Save
                            </button>
                            <button className="inline-edit-btn cancel" onClick={cancelEdit}>
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="inline-edit-btn edit" onClick={() => startEdit(agent)}>
                                Edit
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

    const renderContent = () => {
        if (!currentClub || isLoading) {
            return <LoadingState message="Loading agents..." />;
        }

        if (error) {
            return <ErrorState message={error} />;
        }

        if (agents.length > 0) {
            return (
                <RakebackTable
                    data={agents}
                    columns={columns}
                    onUpdate={handleUpdateAgent}
                    editableFields={['nickname', 'rakeback']}
                />
            );
        }

        return (
            <EmptyState
                title="No Agents Yet"
                message="Add your first agent to the rakeback list"
            />
        );
    };

    return (
        <div className="page-container">
            <PageHeader
                title="Agents RB List"
                description="Manage rakeback percentages for agents"
            />

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
                    </AddItemForm>
                ) : (
                    <AddButton
                        onClick={() => setIsAdding(true)}
                        label="Add Agent"
                    />
                )}
            </ContentCard>
        </div>
    );
};

export default AgentsList;