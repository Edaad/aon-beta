import React from 'react';
import './ContentCard.css';

const ContentCard = ({ children, className = '' }) => {
    return (
        <div className={`content-card ${className}`}>
            {children}
        </div>
    );
};

export default ContentCard;