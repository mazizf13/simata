import React from 'react';

export const BastStatusBadge = ({ status }) => {
    const statusVal = typeof status === 'object' && status !== null ? status.value : status;

    const config = {
        draft: {
            label: 'Draf',
            className: 'bg-gray-100 text-gray-700 border-gray-200',
        },
        submitted: {
            label: 'Diajukan Mitra',
            className: 'bg-blue-50 text-blue-800 border-blue-200',
        },
        approved: {
            label: 'Diterima & Disahkan',
            className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        },
        cancelled: {
            label: 'Dibatalkan',
            className: 'bg-red-50 text-red-700 border-red-200',
        },
    };

    const current = config[statusVal] || {
        label: (typeof status === 'object' && status?.label) ? status.label : (statusVal || '-'),
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

export default BastStatusBadge;
