import React, { useState, useRef, useEffect } from 'react';
import './ClubSelector.css';
import { useClub } from '../../contexts/ClubContext';
import { addClub } from '../../services/apis';

const ClubSelector = () => {
    const { currentClub, clubs, switchClub, loadClubs } = useClub();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAddingClub, setIsAddingClub] = useState(false);
    const [newClubName, setNewClubName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddClub = async (e) => {
        e.preventDefault();
        if (newClubName.trim()) {
            try {
                setIsLoading(true);
                setError('');
                await addClub({
                    name: newClubName,
                    displayName: newClubName
                });
                setNewClubName('');
                setIsAddingClub(false);
                loadClubs();
            } catch (error) {
                console.error('Error adding club:', error);
                setError('Failed to add club. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleClubSwitch = (club) => {
        if (currentClub?.name !== club.name) {
            switchClub(club);
        }
        setIsDropdownOpen(false);
    };

    const handleCancelAdd = () => {
        setIsAddingClub(false);
        setNewClubName('');
        setError('');
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="club-selector" ref={dropdownRef}>
            <div className="club-selector-trigger" onClick={toggleDropdown}>
                <div className="current-club">
                    <span className="club-label">Club:</span>
                    <span className="club-name">{currentClub?.displayName || 'Select Club'}</span>
                </div>
                <div className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
                    ▲
                </div>
            </div>

            {isDropdownOpen && (
                <div className="club-dropdown">
                    <div className="club-dropdown-header">
                        <span>Select Club</span>
                    </div>
                    <div className="clubs-list">
                        {clubs.map((club) => (
                            <div
                                key={club.name}
                                className={`club-item ${currentClub?.name === club.name ? 'active' : ''}`}
                                onClick={() => handleClubSwitch(club)}
                            >
                                <span className="club-name">{club.displayName}</span>
                                {currentClub?.name === club.name && (
                                    <span className="check-icon">✓</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="club-dropdown-footer">
                        <button
                            className="add-club-btn"
                            onClick={() => {
                                setIsAddingClub(true);
                                setIsDropdownOpen(false);
                            }}
                        >
                            Add Club
                        </button>
                    </div>
                </div>
            )}

            {isAddingClub && (
                <div className="add-club-overlay">
                    <div className="add-club-modal">
                        <form className="add-club-form" onSubmit={handleAddClub}>
                            <div className="form-header">
                                <h4>Add New Club</h4>
                            </div>

                            {error && (
                                <div className="error-message">
                                    <span className="error-icon">!</span>
                                    {error}
                                </div>
                            )}

                            <div className="input-group">
                                <input
                                    type="text"
                                    value={newClubName}
                                    onChange={(e) => setNewClubName(e.target.value)}
                                    placeholder="Enter club name"
                                    autoFocus
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={isLoading || !newClubName.trim()}
                                >
                                    {isLoading ? 'Adding...' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleCancelAdd}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClubSelector;
