import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchClubs } from '../services/apis';

const ClubContext = createContext();

export const useClub = () => {
    const context = useContext(ClubContext);
    if (!context) {
        throw new Error('useClub must be used within a ClubProvider');
    }
    return context;
};

export const ClubProvider = ({ children }) => {
    const [currentClub, setCurrentClub] = useState(null);
    const [clubs, setClubs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadClubs = useCallback(async () => {
        try {
            const clubsData = await fetchClubs();
            setClubs(clubsData);

            // Set Round Table as default club if none selected
            if (!currentClub && clubsData.length > 0) {
                const roundTableClub = clubsData.find(club => club.name === 'round-table');
                if (roundTableClub) {
                    setCurrentClub(roundTableClub);
                } else {
                    // Fallback to first club if Round Table doesn't exist
                    setCurrentClub(clubsData[0]);
                }
            }
        } catch (error) {
            console.error('Error loading clubs:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentClub]);

    useEffect(() => {
        loadClubs();
    }, [loadClubs]);

    const switchClub = (club) => {
        setCurrentClub(club);
    };

    const value = {
        currentClub,
        clubs,
        isLoading,
        switchClub,
        loadClubs
    };

    return (
        <ClubContext.Provider value={value}>
            {children}
        </ClubContext.Provider>
    );
};
