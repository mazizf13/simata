import React from 'react';

export const AssignmentStatusBadge = ({ status }) => {
    const statusVal = typeof status === 'object' && status !== null ? status.value : status;

    const config = {
        draft: {
            label: 'Draf',
            className: 'bg-gray-100 text-gray-700 border-gray-200',
        },
        pending_approval: {
            label: 'Menunggu Persetujuan',
            className: 'bg-amber-50 text-amber-800 border-amber-200',
        },
        approved: {
            label: 'Disetujui',
            className: 'bg-blue-50 text-blue-800 border-blue-200',
        },
        active: {
            label: 'Aktif Berjalan',
            className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        },
        completed: {
            label: 'Selesai',
            className: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        },
        cancelled: {
            label: 'Dibatalkan',
            className: 'bg-red-50 text-red-700 border-red-200',
        },
    };

    const current = config[statusVal] || {
        label: statusVal || '-',
        className: 'bg-gray-100 text-gray-600 border-gray-200',
    };

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${current.className}`}
        >
            {current.label}
        </span>
    );
};

export default AssignmentStatusBadge;
