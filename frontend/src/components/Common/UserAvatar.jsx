import React from 'react';

const UserAvatar = ({ user, size = '24px', showName = false }) => {
    if (!user) return null;

    const avatar = user.profileImage ? (
        <img
            src={user.profileImage}
            alt={user.username}
            title={user.username}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
                border: '1px solid var(--border)'
            }}
        />
    ) : (
        <div
            title={user.username}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: '#3b82f6',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `calc(${size} * 0.5)`,
                fontWeight: 'bold',
                flexShrink: 0,
                border: '1px solid var(--border)'
            }}
        >
            {user.username.charAt(0).toUpperCase()}
        </div>
    );

    if (showName) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {avatar}
                <span>{user.username}</span>
            </div>
        );
    }

    return avatar;
};

export default UserAvatar;
