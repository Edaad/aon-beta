import React from 'react';
import './EmptyState.css';

const EmptyState = ({
    icon = '📋',
    title = 'No Data',
    message = 'No items found',
    small = false
}) => {
    return (
        <div className={`empty-state ${small ? 'small' : ''}`}>
            <div className="placeholder-icon">{icon}</div>
            <h2>{title}</h2>
            <p>{message}</p>
        </div>
    );
};

export default EmptyState;