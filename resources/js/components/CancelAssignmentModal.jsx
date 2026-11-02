import React, { useState } from 'react';
import { Modal, Button, TextArea } from '@idds/react';

export const CancelAssignmentModal = ({
    isOpen,
    onClose,
    assignment = null,
    onConfirm,
    isLoading = false,
}) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!reason.trim()) {
            setError('Alasan pembatalan penugasan wajib diisi.');
            return;
        }

        try {
            await onConfirm(reason.trim());
            setReason('');
        } catch (err) {
            setError(err.message || 'Gagal membatalkan penugasan.');
        }
    };

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            title="Batalkan Penugasan Mitra"
            size="md"
        >
            <form onSubmit={handleSubmit} className="py-2 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                    Anda akan membatalkan penugasan{' '}
                    <span className="font-semibold text-gray-900">
                        {assignment?.snapshots?.task_name || assignment?.task?.name}
                    </span>{' '}
                    untuk mitra{' '}
                    <span className="font-semibold text-gray-900">
                        {assignment?.mitra?.name}
                    </span>.
                </p>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 leading-relaxed">
                    Pembatalan akan mengeluarkan nilai honor dan jumlah tugas dari hitungan aktif bulan pembebanan, namun rekam jejak histori tetap diarsipkan dalam audit log sistem.
                </div>

                <div>
                    <TextArea
                        label="Alasan Pembatalan *"
                        placeholder="Tuliskan alasan resmi pembatalan penugasan ini..."
                        value={reason}
                        onChange={(val) => {
                            setReason(val);
                            if (error) setError('');
                        }}
                        status={error ? 'error' : 'neutral'}
                        statusMessage={error}
                        rows={3}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                        hierarchy="secondary"
                        size="md"
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        hierarchy="primary"
                        size="md"
                        type="submit"
                        disabled={isLoading}
                        className="!bg-red-600 !text-white hover:!bg-red-700 !border-transparent"
                    >
                        {isLoading ? 'Memproses...' : 'Konfirmasi Batalkan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CancelAssignmentModal;
