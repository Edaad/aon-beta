import React from 'react';
import './PageHeader.css';

const PageHeader = ({ title, description }) => {
    return (
        <header className="page-header">
            <h1>{title}</h1>
            {description && <p className="page-description">{description}</p>}
        </header>
    );
};

export default PageHeader;