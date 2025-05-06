import React from 'react';
import './InputGroup.css';

const InputGroup = ({
    label,
    id,
    type = "text",
    value,
    onChange,
    placeholder,
    min,
    max
}) => {
    return (
        <div className="input-group">
            <label htmlFor={id}>{label}</label>
            <input
                type={type}
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                min={min}
                max={max}
            />
        </div>
    );
};

export default InputGroup;