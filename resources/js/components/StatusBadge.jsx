import React from 'react';
import { Badge } from '@idds/react';

const STATUS_CONFIG = {
    draft: { text: 'Draft', variant: 'neutral', type: 'outline' },
    pending_approval: { text: 'Menunggu Persetujuan', variant: 'warning', type: 'soft' },
    approved: { text: 'Disetujui', variant: 'success', type: 'soft' },
    active: { text: 'Aktif', variant: 'success', type: 'soft' },
    completed: { text: 'Selesai', variant: 'info', type: 'solid' },
    cancelled: { text: 'Dibatalkan', variant: 'danger', type: 'soft' },
    inactive: { text: 'Nonaktif', variant: 'neutral', type: 'soft' },
};

export const StatusBadge = ({ status, className = '' }) => {
    let resolvedKey = status;

    if (typeof status === 'boolean') {
        resolvedKey = status ? 'active' : 'inactive';
    } else if (typeof status === 'number') {
        resolvedKey = status === 1 ? 'active' : 'inactive';
    } else if (typeof status === 'object' && status !== null) {
        resolvedKey = status.value || (status.is_active !== undefined ? (status.is_active ? 'active' : 'inactive') : 'draft');
    }

    const config = STATUS_CONFIG[resolvedKey] || {
        text: typeof status === 'object' && status?.label ? status.label : (resolvedKey ? String(resolvedKey) : 'Nonaktif'),
        variant: 'neutral',
        type: 'soft',
    };

    return (
        <span className={`inline-flex items-center ${className}`}>
            <Badge variant={config.variant} type={config.type}>
                {config.text}
            </Badge>
        </span>
    );
};

export default StatusBadge;
