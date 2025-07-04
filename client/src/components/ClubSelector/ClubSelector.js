import React, { useState } from 'react';
import './ClubSelector.css';
import { useClub } from '../../contexts/ClubContext';
import { addClub } from '../../services/apis';

const ClubSelector = () => {
    const { currentClub, clubs, switchClub, loadClubs } = useClub();
    const [isAddingClub, setIsAddingClub] = useState(false);
    const [newClubName, setNewClubName] = useState('');

    const handleAddClub = async (e) => {
        e.preventDefault();
        if (newClubName.trim()) {
            try {
                await addClub({
                    name: newClubName,
                    displayName: newClubName
                });
                setNewClubName('');
                setIsAddingClub(false);
                loadClubs();
            } catch (error) {
                console.error('Error adding club:', error);
                alert('Failed to add club. Please try again.');
            }
        }
    };

    return (
        <div className="club-selector">
            <div className="club-selector-header">
                <h3>Select Club</h3>
                <button
                    className="add-club-btn"
                    onClick={() => setIsAddingClub(true)}
                >
                    + Add Club
                </button>
            </div>

            <div className="clubs-list">
                {clubs.map((club) => (
                    <div
                        key={club.name}
                        className={`club-item ${currentClub?.name === club.name ? 'active' : ''}`}
                        onClick={() => switchClub(club)}
                    >
                        <span className="club-name">{club.displayName}</span>
                        {currentClub?.name === club.name && (
                            <span className="active-indicator">✓</span>
                        )}
                    </div>
                ))}
            </div>

            {isAddingClub && (
                <form className="add-club-form" onSubmit={handleAddClub}>
                    <input
                        type="text"
                        value={newClubName}
                        onChange={(e) => setNewClubName(e.target.value)}
                        placeholder="Enter club name"
                        autoFocus
                    />
                    <div className="form-actions">
                        <button type="submit" className="save-btn">
                            Save
                        </button>
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => {
                                setIsAddingClub(false);
                                setNewClubName('');
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ClubSelector;
