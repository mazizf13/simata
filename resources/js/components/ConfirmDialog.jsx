import React from 'react';
import { Modal, Button } from '@idds/react';

export const ConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    title = 'Konfirmasi Tindakan',
    description = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    danger = false,
    isLoading = false,
}) => {
    return (
        <Modal open={open} onClose={onClose} title={title} size="md">
            <div className="py-2">
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-gray-100">
                    <Button
                        hierarchy="secondary"
                        size="md"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        hierarchy={danger ? 'secondary' : 'primary'}
                        size="md"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={danger ? '!bg-red-600 !text-white hover:!bg-red-700 !border-transparent' : ''}
                    >
                        {isLoading ? 'Memproses...' : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
