import React, { useState, useEffect, useCallback } from 'react';
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
import DeleteButton from '../../../components/DeleteButton/DeleteButton';
import EditButton from '../../../components/EditButton/EditButton';
import { useClub } from '../../../contexts/ClubContext';
import { fetchPlayers, addPlayer, updatePlayer, deletePlayer } from '../../../services/apis';
import './PlayersList.css';

const PlayersList = () => {
    const { currentClub } = useClub();
    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isAdding, setIsAdding] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPercentage, setNewPercentage] = useState('');
    const [inputError, setInputError] = useState('');

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [editUsername, setEditUsername] = useState('');
    const [editPercentage, setEditPercentage] = useState('');
    const [editError, setEditError] = useState('');

    const loadPlayers = useCallback(async () => {
        if (!currentClub) return;
        try {
            const data = await fetchPlayers(currentClub.name);
            setPlayers(data);
            setIsLoading(false);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    }, [currentClub]);

    // Fetch data on component mount and when club changes
    useEffect(() => {
        if (currentClub) {
            loadPlayers();
        }
    }, [currentClub, loadPlayers]);

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
            nickname: newUsername,
            rakeback: percentageNum
        };

        try {
            const savedPlayer = await addPlayer(currentClub.name, newPlayer);
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
    const handleDeletePlayer = async (playerId) => {
        try {
            await deletePlayer(currentClub.name, playerId);
            loadPlayers();
        } catch (err) {
            console.error('Error deleting player:', err);
            alert('Error deleting player: ' + err.message);
        }
    };

    // Start editing a player
    const startEditPlayer = (player) => {
        setEditingPlayer(player);
        setEditUsername(player.nickname);
        setEditPercentage(player.rakeback.toString());
        setEditError('');
        setIsEditing(true);
    };

    // Cancel editing
    const cancelEditPlayer = () => {
        setIsEditing(false);
        setEditingPlayer(null);
        setEditUsername('');
        setEditPercentage('');
        setEditError('');
    };

    // Update player with API
    const handleUpdatePlayer = async () => {
        // Validation
        if (!editUsername.trim()) {
            setEditError('Username cannot be empty');
            return;
        }

        const percentage = parseFloat(editPercentage);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            setEditError('Percentage must be between 0 and 100');
            return;
        }

        try {
            const updatedPlayer = {
                nickname: editUsername.trim(),
                rakeback: percentage
            };

            await updatePlayer(currentClub.name, editingPlayer._id, updatedPlayer);
            loadPlayers();
            cancelEditPlayer();
        } catch (err) {
            console.error('Error updating player:', err);
            setEditError('Error updating player: ' + err.message);
        }
    };

    // Table columns configuration
    const columns = [
        { header: 'Username', accessor: 'nickname' },
        {
            header: 'Percentage (%)',
            accessor: 'rakeback',
            render: (player) => `${player.rakeback}%`
        },
        {
            header: 'Actions',
            render: (player) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <EditButton
                        onEdit={() => startEditPlayer(player)}
                        itemName={player.nickname}
                    />
                    <DeleteButton
                        onDelete={() => handleDeletePlayer(player._id)}
                        itemName={player.nickname}
                    />
                </div>
            )
        }
    ];

    const renderContent = () => {
        if (!currentClub || isLoading) {
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
                ) : isEditing ? (
                    <EditItemForm
                        error={editError}
                        onCancel={cancelEditPlayer}
                        onSubmit={handleUpdatePlayer}
                        submitLabel="Update"
                    >
                        <InputGroup
                            label="Username"
                            id="edit-username"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            placeholder="Enter username"
                        />
                        <InputGroup
                            label="Percentage (%)"
                            id="edit-percentage"
                            type="number"
                            value={editPercentage}
                            onChange={(e) => setEditPercentage(e.target.value)}
                            min="0"
                            max="100"
                            placeholder="Enter percentage"
                        />
                    </EditItemForm>
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