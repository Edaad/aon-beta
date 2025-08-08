import React from 'react';
import { FaTrash } from 'react-icons/fa';
import './DeleteButton.css';

const DeleteButton = ({ onDelete, label, itemName }) => {
    return (
        <button
            className="delete-btn"
            onClick={onDelete}
            aria-label={label || `Delete ${itemName}`}
        >
            <FaTrash />
        </button>
    );
};

export default DeleteButton;