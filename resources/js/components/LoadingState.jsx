import React from 'react';
import { Spinner } from '@idds/react';

export const LoadingState = ({ message = 'Memuat data...', fullScreen = false }) => {
    const containerClasses = fullScreen
        ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs'
        : 'flex flex-col items-center justify-center py-16 px-4 text-center';

    return (
        <div className={containerClasses}>
            <Spinner size="lg" />
            <p className="mt-4 text-sm font-medium text-gray-600">{message}</p>
        </div>
    );
};

export default LoadingState;
