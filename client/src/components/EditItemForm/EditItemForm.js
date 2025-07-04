import React from 'react';
import './EditItemForm.css';

const EditItemForm = ({
    error,
    onCancel,
    onSubmit,
    submitLabel = "Update",
    children
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="edit-item-overlay">
            <div className="edit-item-form">
                <h3>Edit Item</h3>
                <form onSubmit={handleSubmit}>
                    {children}
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn">
                            {submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditItemForm;
