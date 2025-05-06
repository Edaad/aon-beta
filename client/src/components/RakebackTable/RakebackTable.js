import React from 'react';
import './RakebackTable.css';

const RakebackTable = ({
    data,
    columns,
    onDelete,
    footerData = null,
    emptyMessage = "No data available"
}) => {
    if (!data || data.length === 0) {
        return <div className="empty-table-message">{emptyMessage}</div>;
    }

    return (
        <div className="rakeback-table-container">
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
                        <tr key={item.id || rowIndex}>
                            {columns.map((column, colIndex) => (
                                <td key={colIndex}>
                                    {column.render
                                        ? column.render(item)
                                        : item[column.accessor]
                                    }
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