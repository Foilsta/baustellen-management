import React from 'react';

const StatusBadge = ({ status, type = 'task' }) => {
    const getStatusText = () => {
        if (type === 'task') {
            const statusMap = {
                open: 'Offen',
                in_progress: 'In Bearbeitung',
                completed: 'Erledigt',
            };
            return statusMap[status] || status;
        } else {
            const statusMap = {
                needed: 'Benötigt',
                ordered: 'Bestellt',
                arrived: 'Eingetroffen',
            };
            return statusMap[status] || status;
        }
    };

    return (
        <span className={`status-badge status-${status}`}>
            {getStatusText()}
        </span>
    );
};

export default StatusBadge;
