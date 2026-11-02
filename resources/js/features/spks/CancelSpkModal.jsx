import React, { useState } from 'react';
import { Modal, Button, TextArea } from '@idds/react';

export const CancelSpkModal = ({
    isOpen,
    onClose,
    spk = null,
    onConfirm,
    isLoading = false,
}) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!reason.trim()) {
            setError('Alasan pembatalan SPK wajib diisi.');
            return;
        }

        try {
            await onConfirm(reason.trim());
            setReason('');
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Gagal membatalkan SPK.');
        }
    };

    return (
        <Modal
            open={isOpen}
            isOpen={isOpen}
            onClose={onClose}
            title="Batalkan Surat Perjanjian Kerja (SPK)"
            size="md"
        >
            <form onSubmit={handleSubmit} className="py-2 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                    Anda akan membatalkan SPK Nomor{' '}
                    <span className="font-semibold text-gray-900">
                        {spk?.spk_number}
                    </span>{' '}
                    atas nama mitra{' '}
                    <span className="font-semibold text-gray-900">
                        {spk?.mitra?.name}
                    </span>.
                </p>

                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 leading-relaxed">
                    Status SPK akan diubah menjadi <strong>Dibatalkan</strong> dan dicatat ke dalam audit log. Penugasan yang sebelumnya terhubung dapat dialihkan ke SPK lain.
                </div>

                <div>
                    <TextArea
                        label="Alasan Pembatalan *"
                        placeholder="Tuliskan alasan resmi pembatalan SPK ini..."
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

                <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-3">
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
                        hierarchy="danger"
                        size="md"
                        type="submit"
                        disabled={isLoading || !reason.trim()}
                    >
                        {isLoading ? 'Membatalkan...' : 'Konfirmasi Batalkan SPK'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CancelSpkModal;
