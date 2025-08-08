import React from 'react';
import './ThresholdManager.css';

const ThresholdManager = ({ thresholds, onChange }) => {
    const handleThresholdChange = (index, field, value) => {
        const updatedThresholds = [...thresholds];
        updatedThresholds[index] = {
            ...updatedThresholds[index],
            [field]: value
        };
        onChange(updatedThresholds);
    };

    const addThreshold = () => {
        const newThresholds = [...thresholds, { start: '', end: '', percentage: '' }];
        onChange(newThresholds);
    };

    const removeThreshold = (index) => {
        const updatedThresholds = thresholds.filter((_, i) => i !== index);
        onChange(updatedThresholds);
    };

    return (
        <div className="threshold-manager">
            <table className="threshold-table">
                <thead>
                    <tr>
                        <th>Start</th>
                        <th>End</th>
                        <th>Percentage %</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {thresholds.map((threshold, index) => (
                        <tr key={index}>
                            <td>
                                <div className="threshold-input-wrapper">
                                    <input
                                        type="number"
                                        value={threshold.start}
                                        onChange={(e) => handleThresholdChange(index, 'start', e.target.value)}
                                        placeholder="500"
                                        min="0"
                                    />
                                </div>
                            </td>
                            <td>
                                <div className="threshold-input-wrapper">
                                    <input
                                        type="number"
                                        value={threshold.end}
                                        onChange={(e) => handleThresholdChange(index, 'end', e.target.value)}
                                        placeholder="1000"
                                        min="0"
                                    />
                                </div>
                            </td>
                            <td>
                                <div className="threshold-input-wrapper">
                                    <input
                                        type="number"
                                        value={threshold.percentage}
                                        onChange={(e) => handleThresholdChange(index, 'percentage', e.target.value)}
                                        placeholder="35"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </td>
                            <td className="threshold-action-cell">
                                {thresholds.length > 1 && (
                                    <button
                                        type="button"
                                        className="remove-threshold-btn"
                                        onClick={() => removeThreshold(index)}
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
                className="add-threshold-btn"
                onClick={addThreshold}
            >
                Add Threshold
            </button>
        </div>
    );
};

export default ThresholdManager;