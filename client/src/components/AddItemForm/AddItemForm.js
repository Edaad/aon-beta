import React from 'react';
import './AddItemForm.css';

const AddItemForm = ({
    children,
    error,
    onCancel,
    onSubmit,
    submitLabel = "Save",
    cancelLabel = "Cancel"
}) => {
    return (
        <div className="add-item-form">
            <div className="form-inputs">
                {children}
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="form-actions">
                <button
                    className="cancel-btn"
                    onClick={onCancel}
                    aria-label={cancelLabel}
                >
                    {cancelLabel}
                </button>
                <button
                    className="save-btn"
                    onClick={onSubmit}
                    aria-label={submitLabel}
                >
                    {submitLabel}
                </button>
            </div>
        </div>
    );
};

export default AddItemForm;