import React from 'react';
import { FaEdit } from 'react-icons/fa';
import './EditButton.css';

const EditButton = ({ onEdit, itemName }) => {
    const handleClick = (e) => {
        e.stopPropagation();
        onEdit();
    };

    return (
        <button
            className="edit-btn"
            onClick={handleClick}
            aria-label={`Edit ${itemName}`}
            title={`Edit ${itemName}`}
        >
            <FaEdit />
        </button>
    );
};

export default EditButton;
