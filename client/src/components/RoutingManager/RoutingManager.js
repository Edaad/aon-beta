import React from 'react';
import './RoutingManager.css';

const RoutingManager = ({ routing, onChange }) => {
    const addRouting = () => {
        const newRouting = [...routing, { username: '', type: 'player', percentage: '' }];
        onChange(newRouting);
    };

    const removeRouting = (index) => {
        const newRouting = routing.filter((_, i) => i !== index);
        onChange(newRouting);
    };

    const updateRouting = (index, field, value) => {
        const newRouting = [...routing];
        newRouting[index] = { ...newRouting[index], [field]: value };
        onChange(newRouting);
    };

    return (
        <div className="routing-manager">
            <div className="routing-list">
                {routing.map((route, index) => (
                    <div key={index} className="routing-item">
                        <div className="routing-fields">
                            <div className="routing-field">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={route.username}
                                    onChange={(e) => updateRouting(index, 'username', e.target.value)}
                                    placeholder="Enter username"
                                />
                            </div>
                            <div className="routing-field">
                                <label>Type</label>
                                <select
                                    value={route.type}
                                    onChange={(e) => updateRouting(index, 'type', e.target.value)}
                                >
                                    <option value="player">Player</option>
                                    <option value="agent">Agent</option>
                                    <option value="superAgent">Super Agent</option>
                                </select>
                            </div>
                            <div className="routing-field">
                                <label>Percentage (%)</label>
                                <input
                                    type="number"
                                    value={route.percentage}
                                    onChange={(e) => updateRouting(index, 'percentage', e.target.value)}
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                />
                            </div>
                            <button
                                type="button"
                                className="remove-routing-btn"
                                onClick={() => removeRouting(index)}
                                title="Remove routing"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button
                type="button"
                className="add-routing-btn"
                onClick={addRouting}
            >
                + Add Routing
            </button>
        </div>
    );
};

export default RoutingManager;
