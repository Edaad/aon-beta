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
    const [useThresholds, setUseThresholds] = useState(false);
    const [newThresholds, setNewThresholds] = useState([{ start: '', end: '', percentage: '' }]);
    const [inputError, setInputError] = useState('');

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [editUsername, setEditUsername] = useState('');
    const [editPercentage, setEditPercentage] = useState('');
    const [editUseThresholds, setEditUseThresholds] = useState(false);
    const [editThresholds, setEditThresholds] = useState([{ start: '', end: '', percentage: '' }]);
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

        const newPlayer = {
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
            const savedPlayer = await addPlayer(currentClub.name, newPlayer);
            setPlayers([...players, savedPlayer]);

            // Reset form
            setNewUsername('');
            setNewPercentage('');
            setUseThresholds(false);
            setNewThresholds([{ start: '', end: '', percentage: '' }]);
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
        setUseThresholds(false);
        setNewThresholds([{ start: '', end: '', percentage: '' }]);
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

    // Update player with inline editing
    const handleUpdatePlayer = async (playerId, updatedData) => {
        try {
            const updatedPlayer = {
                nickname: updatedData.nickname.trim(),
                rakeback: parseFloat(updatedData.rakeback)
            };

            await updatePlayer(currentClub.name, playerId, updatedPlayer);
            loadPlayers();
        } catch (err) {
            console.error('Error updating player:', err);
            throw err;
        }
    };

    // Start editing a player
    const startEditPlayer = (player) => {
        setEditingPlayer(player);
        setEditUsername(player.nickname);
        setEditUseThresholds(player.rakebackType === 'threshold');

        if (player.rakebackType === 'threshold') {
            setEditThresholds(player.thresholds && player.thresholds.length > 0
                ? player.thresholds
                : [{ start: '', end: '', percentage: '' }]);
            setEditPercentage('');
        } else {
            setEditPercentage(player.rakeback.toString());
            setEditThresholds([{ start: '', end: '', percentage: '' }]);
        }

        setIsEditing(true);
        setEditError('');
    };

    // Cancel editing
    const cancelEdit = () => {
        setIsEditing(false);
        setEditingPlayer(null);
        setEditUsername('');
        setEditPercentage('');
        setEditUseThresholds(false);
        setEditThresholds([{ start: '', end: '', percentage: '' }]);
        setEditError('');
    };

    // Save edited player
    const saveEditedPlayer = async () => {
        // Validation
        if (!editUsername.trim()) {
            setEditError('Username cannot be empty');
            return;
        }

        if (editUseThresholds) {
            // Validate thresholds
            if (editThresholds.length === 0) {
                setEditError('At least one threshold is required');
                return;
            }

            for (let i = 0; i < editThresholds.length; i++) {
                const threshold = editThresholds[i];
                if (!threshold.start || !threshold.end || !threshold.percentage) {
                    setEditError(`All threshold fields are required for threshold ${i + 1}`);
                    return;
                }

                const start = parseFloat(threshold.start);
                const end = parseFloat(threshold.end);
                const percentage = parseFloat(threshold.percentage);

                if (isNaN(start) || isNaN(end) || isNaN(percentage)) {
                    setEditError(`All threshold values must be numbers for threshold ${i + 1}`);
                    return;
                }

                if (start >= end) {
                    setEditError(`Start value must be less than end value for threshold ${i + 1}`);
                    return;
                }

                if (percentage < 0 || percentage > 100) {
                    setEditError(`Percentage must be between 0 and 100 for threshold ${i + 1}`);
                    return;
                }
            }
        } else {
            if (!editPercentage.trim()) {
                setEditError('Percentage cannot be empty');
                return;
            }

            const percentageNum = parseFloat(editPercentage);
            if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
                setEditError('Percentage must be a number between 0 and 100');
                return;
            }
        }

        const updatedPlayer = {
            nickname: editUsername.trim(),
            rakebackType: editUseThresholds ? 'threshold' : 'flat',
            rakeback: editUseThresholds ? 0 : parseFloat(editPercentage),
            thresholds: editUseThresholds ? editThresholds.map(t => ({
                start: parseFloat(t.start),
                end: parseFloat(t.end),
                percentage: parseFloat(t.percentage)
            })) : []
        };

        try {
            await updatePlayer(currentClub.name, editingPlayer._id, updatedPlayer);
            loadPlayers();
            cancelEdit();
        } catch (err) {
            setEditError('Error updating player: ' + err.message);
        }
    };

    // Table columns configuration
    const columns = [
        { header: 'Username', accessor: 'nickname' },
        {
            header: 'Percentage (%)',
            accessor: 'rakeback',
            render: (player) => {
                if (player.rakebackType === 'threshold') {
                    return <span className="threshold-indicator">Thresholds</span>;
                }
                return `${player.rakeback}%`;
            }
        },
        {
            header: 'Actions',
            render: (player, isEditing, startEdit, cancelEdit, saveEdit) => (
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
                                    if (player.rakebackType === 'threshold') {
                                        startEditPlayer(player);
                                    } else {
                                        startEdit(player);
                                    }
                                }}
                            >
                                <FaEdit />
                            </button>
                            <DeleteButton
                                onDelete={() => handleDeletePlayer(player._id)}
                                itemName={player.nickname}
                            />
                        </>
                    )}
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
            return (
                <RakebackTable
                    data={players}
                    columns={columns}
                    onUpdate={handleUpdatePlayer}
                    editableFields={['nickname', 'rakeback']}
                />
            );
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
                        label="Add Player"
                    />
                )}
            </ContentCard>

            {/* Edit Player Modal for Threshold Players */}
            {editingPlayer && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <EditItemForm
                            error={inputError}
                            onSubmit={saveEditedPlayer}
                            onCancel={cancelEdit}
                            submitLabel="Update Player"
                        >
                            <InputGroup
                                label="Username"
                                id="username"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                                placeholder="Enter username"
                            />

                            {editingPlayer.rakebackType === 'threshold' ? (
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

export default PlayersList;