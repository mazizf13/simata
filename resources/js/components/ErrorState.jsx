import React from 'react';
import { Button } from '@idds/react';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

export const ErrorState = ({
    title = 'Terjadi Kesalahan',
    message = 'Gagal memuat data dari server. Silakan coba kembali.',
    onRetry,
    className = '',
}) => {
    return (
        <div className={`p-6 bg-red-50/60 border border-red-200 rounded-lg text-center ${className}`}>
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
                <IconAlertTriangle size={24} stroke={1.5} />
            </div>
            <h4 className="text-base font-semibold text-red-900">{title}</h4>
            <p className="mt-1 text-sm text-red-700 max-w-md mx-auto">{message}</p>
            {onRetry && (
                <div className="mt-4 flex justify-center">
                    <Button
                        hierarchy="secondary"
                        size="sm"
                        onClick={onRetry}
                        prefixIcon={<IconRefresh size={16} />}
                    >
                        Muat Ulang
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ErrorState;
