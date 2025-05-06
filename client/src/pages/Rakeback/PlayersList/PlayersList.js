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
import { fetchPlayers, addPlayer, deletePlayer } from '../../../services/apis';
import './PlayersList.css';

const PlayersList = () => {
    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isAdding, setIsAdding] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPercentage, setNewPercentage] = useState('');
    const [inputError, setInputError] = useState('');

    // Fetch data on component mount
    useEffect(() => {
        const loadPlayers = async () => {
            try {
                const data = await fetchPlayers();
                setPlayers(data);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        loadPlayers();
    }, []);

    // Add player with API
    const handleAddPlayer = async () => {
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

        const newPlayer = {
            username: newUsername,
            percentage: percentageNum
        };

        try {
            const savedPlayer = await addPlayer(newPlayer);
            setPlayers([...players, savedPlayer]);

            // Reset form
            setNewUsername('');
            setNewPercentage('');
            setIsAdding(false);
            setInputError('');
        } catch (err) {
            setInputError('Error saving player: ' + err.message);
        }
    };

    // Cancel adding
    const cancelAdding = () => {
        setIsAdding(false);
        setNewUsername('');
        setNewPercentage('');
        setInputError('');
    };

    // Delete player with API
    const handleDeletePlayer = async (id) => {
        try {
            await deletePlayer(id);
            setPlayers(players.filter(player => player.id !== id));
        } catch (err) {
            console.error('Error deleting player:', err);
        }
    };

    // Table columns configuration
    const columns = [
        { header: 'Username', accessor: 'username' },
        {
            header: 'Percentage (%)',
            accessor: 'percentage',
            render: (player) => `${player.percentage}%`
        },
        {
            header: 'Actions',
            render: (player) => (
                <DeleteButton
                    onDelete={() => handleDeletePlayer(player.id)}
                    itemName={player.username}
                />
            )
        }
    ];

    const renderContent = () => {
        if (isLoading) {
            return <LoadingState message="Loading players..." />;
        }

        if (error) {
            return <ErrorState message={error} />;
        }

        if (players.length > 0) {
            return <RakebackTable data={players} columns={columns} />;
        }

        return (
            <EmptyState
                title="No Players Yet"
                message="Add your first player to the rakeback list"
            />
        );
    };

    return (
        <div className="page-container">
            <PageHeader
                title="Players RB List"
                description="Manage rakeback percentages for players"
            />

            <ContentCard className="rakeback-card">
                {renderContent()}

                {isAdding ? (
                    <AddItemForm
                        error={inputError}
                        onCancel={cancelAdding}
                        onSubmit={handleAddPlayer}
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
                        label="Add Player"
                    />
                )}
            </ContentCard>
        </div>
    );
};

export default PlayersList;