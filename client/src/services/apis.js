const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

// Club management
export const fetchClubs = async () => {
    const response = await fetch(`${API_URL}/clubs`);
    if (!response.ok) throw new Error('Failed to fetch clubs');
    return response.json();
};

export const addClub = async (club) => {
    const response = await fetch(`${API_URL}/clubs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(club),
    });
    if (!response.ok) throw new Error('Failed to add club');
    return response.json();
};

export const deleteClub = async (clubId) => {
    const response = await fetch(`${API_URL}/clubs/${clubId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete club');
    return true;
};

// Player management
export const fetchPlayers = async (clubId) => {
    const response = await fetch(`${API_URL}/${clubId}/players`);
    if (!response.ok) throw new Error('Failed to fetch players');
    return response.json();
};

export const addPlayer = async (clubId, player) => {
    const response = await fetch(`${API_URL}/${clubId}/players`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(player),
    });
    if (!response.ok) throw new Error('Failed to add player');
    return response.json();
};

export const updatePlayer = async (clubId, id, player) => {
    const response = await fetch(`${API_URL}/${clubId}/players/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(player),
    });
    if (!response.ok) throw new Error('Failed to update player');
    return response.json();
};

export const deletePlayer = async (clubId, id) => {
    const response = await fetch(`${API_URL}/${clubId}/players/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete player');
    return true;
};

export const fetchAgents = async (clubId) => {
    const response = await fetch(`${API_URL}/${clubId}/agents`);
    if (!response.ok) throw new Error('Failed to fetch agents');
    return response.json();
};

export const addAgent = async (clubId, agent) => {
    const response = await fetch(`${API_URL}/${clubId}/agents`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(agent),
    });
    if (!response.ok) throw new Error('Failed to add agent');
    return response.json();
};

export const updateAgent = async (clubId, id, agent) => {
    const response = await fetch(`${API_URL}/${clubId}/agents/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(agent),
    });
    if (!response.ok) throw new Error('Failed to update agent');
    return response.json();
};

export const deleteAgent = async (clubId, id) => {
    const response = await fetch(`${API_URL}/${clubId}/agents/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete agent');
    return true;
};

// Super Agent management
export const fetchSuperAgents = async (clubId) => {
    const response = await fetch(`${API_URL}/${clubId}/super-agents`);
    if (!response.ok) throw new Error('Failed to fetch super agents');
    return response.json();
};

export const addSuperAgent = async (clubId, superAgent) => {
    const response = await fetch(`${API_URL}/${clubId}/super-agents`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(superAgent),
    });
    if (!response.ok) throw new Error('Failed to add super agent');
    return response.json();
};

export const updateSuperAgent = async (clubId, id, superAgent) => {
    const response = await fetch(`${API_URL}/${clubId}/super-agents/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(superAgent),
    });
    if (!response.ok) throw new Error('Failed to update super agent');
    return response.json();
};

export const deleteSuperAgent = async (clubId, id) => {
    const response = await fetch(`${API_URL}/${clubId}/super-agents/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete super agent');
    return true;
};

export const fetchWeeks = async (clubId) => {
    const response = await fetch(`${API_URL}/${clubId}/weeks`);
    if (!response.ok) throw new Error('Failed to fetch weeks');
    return response.json();
};

export const fetchWeekData = async (clubId) => {
    const response = await fetch(`${API_URL}/${clubId}/weekData`);
    if (!response.ok) throw new Error('Failed to fetch week data');
    return response.json();
};

export const addWeek = async (clubId, week) => {
    const response = await fetch(`${API_URL}/${clubId}/weeks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(week),
    });
    if (!response.ok) throw new Error('Failed to add week');
    return response.json();
};

export const updateWeek = async (clubId, id, data) => {
    const response = await fetch(`${API_URL}/${clubId}/weeks/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update week');
    return response.json();
};

export const deleteWeek = async (clubId, id) => {
    const response = await fetch(`${API_URL}/${clubId}/weeks/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete week');
    return true;
};

export const deleteWeekData = async (clubId, id) => {
    const response = await fetch(`${API_URL}/${clubId}/weekData/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete week data');
    return true;
};

export const addWeekData = async (clubId, data) => {
    const response = await fetch(`${API_URL}/${clubId}/weekData`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add week data');
    return response.json();
};