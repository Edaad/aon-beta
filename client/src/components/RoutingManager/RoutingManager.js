import React from 'react';
import './RoutingManager.css';

const RoutingManager = ({ routing, onChange }) => {
    const handleRoutingChange = (index, field, value) => {
        const updatedRouting = [...routing];
        updatedRouting[index] = {
            ...updatedRouting[index],
            [field]: value
        };
        onChange(updatedRouting);
    };

    const addRouting = () => {
        const newRouting = [...routing, { username: '', type: 'player', percentage: '' }];
        onChange(newRouting);
    };

    const removeRouting = (index) => {
        const updatedRouting = routing.filter((_, i) => i !== index);
        onChange(updatedRouting);
    };

    return (
        <div className="routing-manager">
            <table className="routing-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Type</th>
                        <th>%</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {routing.map((route, index) => (
                        <tr key={index}>
                            <td>
                                <div className="routing-input-wrapper">
                                    <input
                                        type="text"
                                        value={route.username}
                                        onChange={(e) => handleRoutingChange(index, 'username', e.target.value)}
                                        placeholder="Enter username"
                                    />
                                </div>
                            </td>
                            <td>
                                <div className="routing-input-wrapper">
                                    <select
                                        value={route.type}
                                        onChange={(e) => handleRoutingChange(index, 'type', e.target.value)}
                                    >
                                        <option value="player">Player</option>
                                        <option value="agent">Agent</option>
                                        <option value="superAgent">Super Agent</option>
                                    </select>
                                </div>
                            </td>
                            <td>
                                <div className="routing-input-wrapper">
                                    <input
                                        type="number"
                                        value={route.percentage}
                                        onChange={(e) => handleRoutingChange(index, 'percentage', e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </td>
                            <td className="routing-action-cell">
                                {routing.length > 1 && (
                                    <button
                                        type="button"
                                        className="remove-routing-btn"
                                        onClick={() => removeRouting(index)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button
                type="button"
                className="add-routing-btn"
                onClick={addRouting}
            >
                Add Routing
            </button>
        </div>
    );
};

export default RoutingManager;
