import React from 'react';
import './ErrorState.css';

const ErrorState = ({ message = 'An error occurred' }) => {
    return (
        <div className="error-state">
            <p>Error: {message}</p>
        </div>
    );
};

export default ErrorState;