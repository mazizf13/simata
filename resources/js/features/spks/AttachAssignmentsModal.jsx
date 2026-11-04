import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@idds/react';
import { assignmentService } from '../../services/assignmentService';
import { AssignmentStatusBadge, LoadingState, EmptyState } from '../../components';
import { formatRupiah, formatDateRange } from '../../utils/formatters';

export const AttachAssignmentsModal = ({
    isOpen,
    onClose,
    spk,
    onSuccess,
}) => {
    const [assignments, setAssignments] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && spk?.mitra_id) {
            loadAvailableAssignments();
        } else {
            setSelectedIds([]);
            setError(null);
        }
    }, [isOpen, spk]);

    const loadAvailableAssignments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Load assignments for this mitra
            const res = await assignmentService.getAssignments({
                mitra_id: spk.mitra_id,
                per_page: 50,
            });
            const allAssignments = Array.isArray(res.data)
                ? res.data
                : (Array.isArray(res) ? res : (res.data?.data || []));

            // Filter out assignments that are cancelled or already attached to this SPK
            const available = allAssignments.filter(
                (a) => a.spk_id !== spk.id && a.status?.value !== 'cancelled'
            );
            setAssignments(available);
            setSelectedIds([]);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat penugasan mitra');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === assignments.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(assignments.map((a) => a.id));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedIds.length === 0) {
            setError('Pilih minimal satu penugasan untuk dilampirkan.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            await onSuccess(selectedIds);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal melampirkan penugasan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalSelectedValue = assignments
        .filter((a) => selectedIds.includes(a.id))
        .reduce((sum, a) => sum + (Number(a.total_value) || 0), 0);

    return (
        <Modal
            open={isOpen}
            isOpen={isOpen}
            onClose={onClose}
            title={`Lampirkan Penugasan ke SPK: ${spk?.spk_number || ''}`}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-900">
                    <span className="font-semibold">Mitra:</span> {spk?.mitra?.name} ({spk?.mitra?.mitra_code})
                    <span className="mx-2">•</span>
                    <span className="font-semibold">Masa Kontrak:</span> {formatDateRange(spk?.period_start, spk?.period_end)}
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <LoadingState message="Memuat daftar penugasan mitra..." />
                ) : assignments.length === 0 ? (
                    <EmptyState
                        title="Tidak Ada Penugasan Tersedia"
                        description="Tidak ditemukan penugasan lain milik mitra ini yang dapat dilampirkan."
                    />
                ) : (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                        <div className="max-h-80 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-3 py-2 text-left w-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.length === assignments.length && assignments.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">Kegiatan & Periode</th>
                                        <th className="px-3 py-2 text-center font-medium text-gray-600">Volume</th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-600">Nilai</th>
                                        <th className="px-3 py-2 text-center font-medium text-gray-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {assignments.map((item) => {
                                        const isSelected = selectedIds.includes(item.id);
                                        return (
                                            <tr
                                                key={item.id}
                                                className={`hover:bg-blue-50/50 cursor-pointer ${isSelected ? 'bg-blue-50/70' : ''}`}
                                                onClick={() => toggleSelect(item.id)}
                                            >
                                                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelect(item.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="font-medium text-gray-900">
                                                        {item.snapshots?.task_name || item.task?.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatDateRange(item.start_date, item.end_date)}
                                                        {item.spk_id && (
                                                            <span className="ml-2 text-amber-600 font-medium">
                                                                (Pindah dari SPK lain)
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-center text-xs text-gray-700">
                                                    {item.volume} {item.snapshots?.unit || item.unit || 'Dokumen'}
                                                </td>
                                                <td className="px-3 py-2 text-right font-medium text-gray-900 text-xs">
                                                    {formatRupiah(item.total_value)}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <AssignmentStatusBadge status={item.status} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-700">
                            <div>
                                Dipilih: <span className="font-bold text-gray-900">{selectedIds.length}</span> penugasan
                            </div>
                            <div>
                                Total Nilai Tambahan: <span className="font-bold text-blue-700">{formatRupiah(totalSelectedValue)}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-3">
                    <Button
                        hierarchy="secondary"
                        size="md"
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Tutup
                    </Button>
                    <Button
                        hierarchy="primary"
                        size="md"
                        type="submit"
                        disabled={isSubmitting || selectedIds.length === 0}
                    >
                        {isSubmitting ? 'Melampirkan...' : `Lampirkan (${selectedIds.length}) Penugasan`}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AttachAssignmentsModal;
