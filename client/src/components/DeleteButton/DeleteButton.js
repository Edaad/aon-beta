import React from 'react';
import './DeleteButton.css';

const DeleteButton = ({ onDelete, label, itemName }) => {
    return (
        <button
            className="delete-btn"
            onClick={onDelete}
            aria-label={label || `Delete ${itemName}`}
        >
            ✕
        </button>
    );
};

export default DeleteButton;