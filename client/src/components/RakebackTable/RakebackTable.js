import React, { useState } from 'react';
import './RakebackTable.css';

const RakebackTable = ({
    data,
    columns,
    onDelete,
    footerData = null,
    emptyMessage = "No data available",
    onUpdate,
    editableFields = []
}) => {
    const [editingRow, setEditingRow] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [editError, setEditError] = useState('');

    if (!data || data.length === 0) {
        return <div className="empty-table-message">{emptyMessage}</div>;
    }

    const startEdit = (item) => {
        setEditingRow(item._id || item.id);
        const initialValues = {};
        editableFields.forEach(field => {
            initialValues[field] = item[field];
        });
        setEditValues(initialValues);
        setEditError('');
    };

    const cancelEdit = () => {
        setEditingRow(null);
        setEditValues({});
        setEditError('');
    };

    const handleInputChange = (field, value) => {
        setEditValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const saveEdit = async () => {
        try {
            // Validation
            if (editableFields.includes('nickname') && !editValues.nickname?.trim()) {
                setEditError('Username cannot be empty');
                return;
            }

            if (editableFields.includes('rakeback')) {
                const percentage = parseFloat(editValues.rakeback);
                if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                    setEditError('Percentage must be between 0 and 100');
                    return;
                }
            }

            await onUpdate(editingRow, editValues);
            setEditingRow(null);
            setEditValues({});
            setEditError('');
        } catch (err) {
            setEditError('Error updating: ' + err.message);
        }
    };

    const renderCell = (item, column, colIndex) => {
        const isEditing = editingRow === (item._id || item.id);
        const fieldName = column.accessor;

        if (isEditing && editableFields.includes(fieldName)) {
            if (fieldName === 'rakeback') {
                return (
                    <input
                        type="number"
                        value={editValues[fieldName] || ''}
                        onChange={(e) => handleInputChange(fieldName, e.target.value)}
                        className="inline-edit-input"
                        min="0"
                        max="100"
                        step="0.01"
                    />
                );
            } else if (fieldName === 'nickname') {
                return (
                    <input
                        type="text"
                        value={editValues[fieldName] || ''}
                        onChange={(e) => handleInputChange(fieldName, e.target.value)}
                        className="inline-edit-input"
                    />
                );
            }
        }

        // Render normal cell content
        if (column.render) {
            return column.render(item, isEditing, startEdit, cancelEdit, saveEdit);
        }

        if (fieldName === 'rakeback') {
            return `${item[fieldName]}%`;
        }

        return item[fieldName];
    };

    return (
        <div className="rakeback-table-container">
            {editError && (
                <div className="inline-edit-error">
                    {editError}
                </div>
            )}
            <table className="rakeback-table">
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index}>{column.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, rowIndex) => (
                        <tr key={item._id || item.id || rowIndex} className={editingRow === (item._id || item.id) ? 'editing-row' : ''}>
                            {columns.map((column, colIndex) => (
                                <td key={colIndex}>
                                    {renderCell(item, column, colIndex)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                {footerData && (
                    <tfoot>
                        <tr>
                            {columns.map((column, index) => (
                                <td key={index}>
                                    {column.footer && column.footer(data)}
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
};

export default RakebackTable;