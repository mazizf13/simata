import React from 'react';
import { Badge } from '@idds/react';

const STATUS_CONFIG = {
    draft: { text: 'Draft', variant: 'neutral', type: 'outline' },
    pending_approval: { text: 'Menunggu Persetujuan', variant: 'warning', type: 'soft' },
    approved: { text: 'Disetujui', variant: 'success', type: 'soft' },
    active: { text: 'Aktif', variant: 'info', type: 'soft' },
    completed: { text: 'Selesai', variant: 'neutral', type: 'solid' },
    cancelled: { text: 'Dibatalkan', variant: 'danger', type: 'soft' },
    inactive: { text: 'Nonaktif', variant: 'neutral', type: 'soft' },
};

export const StatusBadge = ({ status, className = '' }) => {
    const config = STATUS_CONFIG[status] || {
        text: status || 'Unknown',
        variant: 'neutral',
        type: 'soft',
    };

    return (
        <span className={className}>
            <Badge text={config.text} variant={config.variant} type={config.type} />
        </span>
    );
};

export default StatusBadge;
