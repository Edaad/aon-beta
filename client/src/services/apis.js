const API_URL = 'http://localhost:3001';

export const fetchPlayers = async () => {
    const response = await fetch(`${API_URL}/players`);
    if (!response.ok) throw new Error('Failed to fetch players');
    return response.json();
};

export const addPlayer = async (player) => {
    const response = await fetch(`${API_URL}/players`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(player),
    });
    if (!response.ok) throw new Error('Failed to add player');
    return response.json();
};

export const deletePlayer = async (id) => {
    const response = await fetch(`${API_URL}/players/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete player');
    return true;
};

export const fetchAgents = async () => {
    const response = await fetch(`${API_URL}/agents`);
    if (!response.ok) throw new Error('Failed to fetch agents');
    return response.json();
};

export const addAgent = async (agent) => {
    const response = await fetch(`${API_URL}/agents`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(agent),
    });
    if (!response.ok) throw new Error('Failed to add agent');
    return response.json();
};

export const deleteAgent = async (id) => {
    const response = await fetch(`${API_URL}/agents/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete agent');
    return true;
};

export const fetchWeeks = async () => {
    const response = await fetch(`${API_URL}/weeks`);
    if (!response.ok) throw new Error('Failed to fetch weeks');
    return response.json();
};

export const fetchWeekData = async () => {
    const response = await fetch(`${API_URL}/weekData`);
    if (!response.ok) throw new Error('Failed to fetch week data');
    return response.json();
};

export const addWeek = async (week) => {
    const response = await fetch(`${API_URL}/weeks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(week),
    });
    if (!response.ok) throw new Error('Failed to add week');
    return response.json();
};

export const updateWeek = async (id, data) => {
    const response = await fetch(`${API_URL}/weeks/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update week');
    return response.json();
};

export const deleteWeek = async (id) => {
    const response = await fetch(`${API_URL}/weeks/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete week');
    return true;
};

export const deleteWeekData = async (id) => {
    const response = await fetch(`${API_URL}/weekData/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete week data');
    return true;
};

export const addWeekData = async (data) => {
    const response = await fetch(`${API_URL}/weekData`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add week data');
    return response.json();
};