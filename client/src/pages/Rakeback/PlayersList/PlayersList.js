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
    const [useTaxRebate, setUseTaxRebate] = useState(false);
    const [useRouting, setUseRouting] = useState(false);
    const [newThresholds, setNewThresholds] = useState([{ start: '', end: '', percentage: '' }]);
    const [newRouting, setNewRouting] = useState([{ username: '', type: 'player', percentage: '' }]);
    const [inputError, setInputError] = useState('');

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    // Edit state
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [editUsername, setEditUsername] = useState('');
    const [editPercentage, setEditPercentage] = useState('');
    const [editUseThresholds, setEditUseThresholds] = useState(false);
    const [editUseTaxRebate, setEditUseTaxRebate] = useState(false);
    const [editUseRouting, setEditUseRouting] = useState(false);
    const [editThresholds, setEditThresholds] = useState([{ start: '', end: '', percentage: '' }]);
    const [editRouting, setEditRouting] = useState([{ username: '', type: 'player', percentage: '' }]);

    const loadPlayers = useCallback(async () => {
        if (!currentClub) return;
        try {
            const data = await fetchPlayers(currentClub.name);
            console.log('🔍 Loaded players data:', data);
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

        const newPlayer = {
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

        console.log('🔍 Creating new player with routing:', {
            useRouting,
            newRouting,
            finalRouting: newPlayer.routing
        });

        try {
            const savedPlayer = await addPlayer(currentClub.name, newPlayer);
            setPlayers([...players, savedPlayer]);

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
            setInputError('Error saving player: ' + err.message);
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
        setEditUseTaxRebate(player.taxRebate || false);
        setEditUseRouting(player.routing && player.routing.length > 0);

        if (player.rakebackType === 'threshold') {
            setEditThresholds(player.thresholds && player.thresholds.length > 0
                ? player.thresholds
                : [{ start: '', end: '', percentage: '' }]);
            setEditPercentage('');
        } else {
            setEditPercentage(player.rakeback.toString());
            setEditThresholds([{ start: '', end: '', percentage: '' }]);
        }

        // Set routing data
        setEditRouting(player.routing && player.routing.length > 0
            ? player.routing
            : [{ username: '', type: 'player', percentage: '' }]);

        setInputError('');
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingPlayer(null);
        setEditUsername('');
        setEditPercentage('');
        setEditUseThresholds(false);
        setEditUseTaxRebate(false);
        setEditUseRouting(false);
        setEditThresholds([{ start: '', end: '', percentage: '' }]);
        setEditRouting([{ username: '', type: 'player', percentage: '' }]);
        setInputError('');
    };

    // Save edited player
    const saveEditedPlayer = async () => {
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

        const updatedPlayer = {
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
            await updatePlayer(currentClub.name, editingPlayer._id, updatedPlayer);
            loadPlayers();
            cancelEdit();
        } catch (err) {
            setInputError('Error updating player: ' + err.message);
        }
    };

    // Table columns configuration
    const columns = [
        { header: 'Username', accessor: 'nickname' },
        {
            header: 'Percentage (%)',
            accessor: 'rakeback',
            render: (player) => {
                const hasRouting = player.routing && player.routing.length > 0;
                let displayText = '';

                if (player.rakebackType === 'threshold') {
                    displayText = 'Thresholds';
                } else {
                    displayText = `${player.rakeback}%`;
                }

                // Add indicators
                const indicators = [];
                if (player.taxRebate) indicators.push('T/R');
                if (hasRouting) indicators.push('Routing');

                if (indicators.length > 0) {
                    displayText += ` + ${indicators.join(' + ')}`;
                }

                return player.rakebackType === 'threshold' ? (
                    <span className="threshold-indicator">{displayText}</span>
                ) : displayText;
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
                                onClick={() => startEditPlayer(player)}
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

    // Filter players based on search term
    const filteredPlayers = players.filter(player =>
        player.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderContent = () => {
        if (!currentClub || isLoading) {
            return <LoadingState message="Loading players..." />;
        }

        if (error) {
            return <ErrorState message={error} />;
        }

        if (filteredPlayers.length > 0) {
            return (
                <RakebackTable
                    data={filteredPlayers}
                    columns={columns}
                    onUpdate={handleUpdatePlayer}
                    editableFields={['nickname', 'rakeback']}
                />
            );
        }

        return (
            <EmptyState
                title={searchTerm ? "No Players Found" : "No Players Yet"}
                message={searchTerm ? "No players match your search" : "Add your first player to the rakeback list"}
            />
        );
    };

    return (
        <div className="page-container">
            <PageHeader
                title="Players RB List"
                description="Manage rakeback percentages for players"
            />

            {/* Search Bar */}
            <div className="search-container">
                <InputGroup
                    label="Search Players"
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

export default PlayersList;