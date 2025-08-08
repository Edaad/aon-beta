import React from 'react';
import { FaTrash } from 'react-icons/fa';
import './DeleteButton.css';

const DeleteButton = ({ onDelete, label, itemName }) => {
    const handleDelete = () => {
        const itemDescription = itemName ? `"${itemName}"` : 'this item';
        const confirmMessage = `Are you sure you want to delete ${itemDescription}? This action cannot be undone.`;

        if (window.confirm(confirmMessage)) {
            onDelete();
        }
    };

    return (
        <button
            className="delete-btn"
            onClick={handleDelete}
            aria-label={label || `Delete ${itemName}`}
        >
            <FaTrash />
        </button>
    );
};

export default DeleteButton;