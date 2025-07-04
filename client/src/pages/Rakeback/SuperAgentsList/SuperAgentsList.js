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
import { fetchSuperAgents, addSuperAgent, deleteSuperAgent } from '../../../services/apis';
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
    const [inputError, setInputError] = useState('');

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

        if (!newPercentage.trim()) {
            setInputError('Percentage cannot be empty');
            return;
        }

        const percentageNum = parseFloat(newPercentage);
        if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
            setInputError('Percentage must be a number between 0 and 100');
            return;
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
            rakeback: percentageNum,
            // Mark as super agent - this is conceptual since we're using the same model
            // You could add a 'type' field or use a different approach
        };

        try {
            const savedSuperAgent = await addSuperAgent(currentClub.name, newSuperAgent);
            setSuperAgents([...superAgents, savedSuperAgent]);

            // Reset form
            setNewUsername('');
            setNewPercentage('');
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
        setInputError('');
    };

    // Delete super agent with API
    const handleDeleteSuperAgent = async (id) => {
        try {
            await deleteSuperAgent(currentClub.name, id);
            setSuperAgents(superAgents.filter(agent => agent._id !== id));
        } catch (err) {
            console.error('Error deleting super agent:', err);
        }
    };

    // Table columns configuration
    const columns = [
        { header: 'Username', accessor: 'nickname' },
        {
            header: 'Percentage (%)',
            accessor: 'rakeback',
            render: (agent) => `${agent.rakeback}%`
        },
        {
            header: 'Actions',
            render: (agent) => (
                <DeleteButton
                    onDelete={() => handleDeleteSuperAgent(agent._id)}
                    itemName={agent.nickname}
                />
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
            return <RakebackTable data={superAgents} columns={columns} />;
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
                        label="Add Super Agent"
                    />
                )}
            </ContentCard>
        </div>
    );
};

export default SuperAgentsList;
