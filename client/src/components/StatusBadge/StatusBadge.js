import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status, text }) => {
    return (
        <span className={`status ${status}`}>
            {text}
        </span>
    );
};

export default StatusBadge;