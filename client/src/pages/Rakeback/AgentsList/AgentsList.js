import React, { useState, useEffect } from 'react';
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
import { fetchAgents, addAgent, deleteAgent } from '../../../services/apis';
import './AgentsList.css';

const AgentsList = () => {
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isAdding, setIsAdding] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPercentage, setNewPercentage] = useState('');
    const [inputError, setInputError] = useState('');

    // Fetch data on component mount
    useEffect(() => {
        const loadAgents = async () => {
            try {
                const data = await fetchAgents();
                setAgents(data);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        loadAgents();
    }, []);

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
            username: newUsername,
            percentage: percentageNum
        };

        try {
            const savedAgent = await addAgent(newAgent);
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
    const handleDeleteAgent = async (id) => {
        try {
            await deleteAgent(id);
            setAgents(agents.filter(agent => agent.id !== id));
        } catch (err) {
            console.error('Error deleting agent:', err);
        }
    };

    // Table columns configuration
    const columns = [
        { header: 'Username', accessor: 'username' },
        {
            header: 'Percentage (%)',
            accessor: 'percentage',
            render: (agent) => `${agent.percentage}%`
        },
        {
            header: 'Actions',
            render: (agent) => (
                <DeleteButton
                    onDelete={() => handleDeleteAgent(agent.id)}
                    itemName={agent.username}
                />
            )
        }
    ];

    const renderContent = () => {
        if (isLoading) {
            return <LoadingState message="Loading agents..." />;
        }

        if (error) {
            return <ErrorState message={error} />;
        }

        if (agents.length > 0) {
            return <RakebackTable data={agents} columns={columns} />;
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