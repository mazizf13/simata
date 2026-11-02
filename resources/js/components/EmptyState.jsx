import React from 'react';
import { IconInbox } from '@tabler/icons-react';

export const EmptyState = ({
    title = 'Tidak Ada Data',
    description = 'Belum ada data yang tercatat pada bagian ini.',
    icon: CustomIcon,
    action,
    className = '',
}) => {
    const IconComponent = CustomIcon || IconInbox;

    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-dashed border-gray-200 rounded-lg ${className}`}>
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
                <IconComponent size={24} stroke={1.5} />
            </div>
            <h3 className="text-base font-semibold text-gray-800">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};

export default EmptyState;
