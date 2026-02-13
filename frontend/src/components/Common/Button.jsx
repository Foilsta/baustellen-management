import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'normal',
    onClick,
    type = 'button',
    disabled = false,
    className = ''
}) => {
    const variantClass = `btn-${variant}`;
    const sizeClass = size === 'small' ? 'btn-small' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn ${variantClass} ${sizeClass} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
