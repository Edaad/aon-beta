import React from 'react';
import './AddButton.css';

const AddButton = ({ onClick, label = "Add Item" }) => {
    return (
        <button
            className="add-button"
            onClick={onClick}
            aria-label={label}
        >
            <span className="add-icon">+</span>
            <span>{label}</span>
        </button>
    );
};

export default AddButton;