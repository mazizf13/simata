import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ContentContainer,
    PageHeader,
    SpkStatusBadge,
    AssignmentStatusBadge,
    LoadingState,
    ErrorState,
    EmptyState,
    ConfirmDialog,
} from '../../components';
import { Button } from '@idds/react';
import {
    IconArrowLeft,
    IconPlus,
    IconCheck,
    IconBan,
    IconEdit,
    IconTrash,
    IconCalendar,
    IconUser,
    IconCash,
    IconBriefcase,
    IconBuildingBank,
} from '@tabler/icons-react';
import spkService from '../../services/spkService';
import SpkFormModal from './SpkFormModal';
import CancelSpkModal from './CancelSpkModal';
import AttachAssignmentsModal from './AttachAssignmentsModal';
import { formatDate, formatDateRange, formatRupiah } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export const SpkDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { hasAnyRole } = useAuth();

    // Modals
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [attachModalOpen, setAttachModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [confirmActivateOpen, setConfirmActivateOpen] = useState(false);
    const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
    const [detachTargetAssignment, setDetachTargetAssignment] = useState(null);

    // Fetch SPK Detail
    const {
        data: spkResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['spk', id],
        queryFn: async () => {
            const res = await spkService.getSpk(id);
            return res.data;
        },
        enabled: Boolean(id),
    });

    const spk = spkResponse?.data;

    // Activate mutation
    const activateMutation = useMutation({
        mutationFn: async () => await spkService.activateSpk(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spk', id] });
            queryClient.invalidateQueries({ queryKey: ['spks'] });
            setConfirmActivateOpen(false);
        },
    });

    // Complete mutation
    const completeMutation = useMutation({
        mutationFn: async () => await spkService.completeSpk(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spk', id] });
            queryClient.invalidateQueries({ queryKey: ['spks'] });
            setConfirmCompleteOpen(false);
        },
    });

    // Cancel mutation
    const cancelMutation = useMutation({
        mutationFn: async (reason) => await spkService.cancelSpk(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spk', id] });
            queryClient.invalidateQueries({ queryKey: ['spks'] });
            setCancelModalOpen(false);
        },
    });

    // Attach mutation
    const attachMutation = useMutation({
        mutationFn: async (assignmentIds) => await spkService.attachAssignments(id, assignmentIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spk', id] });
            queryClient.invalidateQueries({ queryKey: ['spks'] });
        },
    });

    // Detach mutation
    const detachMutation = useMutation({
        mutationFn: async (assignmentId) => await spkService.detachAssignment(id, assignmentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spk', id] });
            queryClient.invalidateQueries({ queryKey: ['spks'] });
            setDetachTargetAssignment(null);
        },
    });

    if (isLoading) {
        return (
            <ContentContainer>
                <LoadingState message="Memuat detail Surat Perjanjian Kerja (SPK)..." />
            </ContentContainer>
        );
    }

    if (isError || !spk) {
        return (
            <ContentContainer>
                <ErrorState
                    title="Gagal Memuat SPK"
                    message={error?.response?.data?.message || 'Data SPK tidak ditemukan.'}
                    onRetry={refetch}
                />
            </ContentContainer>
        );
    }

    const isDraft = spk.status?.value === 'draft';
    const isActive = spk.status?.value === 'active';
    const isCompleted = spk.status?.value === 'completed';
    const isCancelled = spk.status?.value === 'cancelled';
    const canModify = (isDraft || isActive) && hasAnyRole(['super_admin', 'admin', 'operator_tim']);

    const taskAssignments = spk.task_assignments || [];

    return (
        <ContentContainer>
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate('/app/spks')}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-700 transition-colors mb-2"
                    >
                        <IconArrowLeft size={16} className="mr-1" />
                        Kembali ke Daftar SPK
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {spk.spk_number}
                        </h1>
                        <SpkStatusBadge status={spk.status} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Surat Perjanjian Kerja atas nama{' '}
                        <Link
                            to={`/app/mitras/${spk.mitra_id}`}
                            className="font-semibold text-blue-700 hover:underline"
                        >
                            {spk.mitra?.name}
                        </Link>{' '}
                        ({spk.mitra?.mitra_code})
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Attach assignment */}
                    {canModify && (
                        <Button
                            hierarchy="primary"
                            size="md"
                            prefixIcon={<IconPlus size={16} />}
                            onClick={() => setAttachModalOpen(true)}
                        >
                            Lampirkan Penugasan
                        </Button>
                    )}

                    {/* Edit SPK */}
                    {canModify && (
                        <Button
                            hierarchy="secondary"
                            size="md"
                            prefixIcon={<IconEdit size={16} />}
                            onClick={() => setEditModalOpen(true)}
                        >
                            Ubah SPK
                        </Button>
                    )}

                    {/* Activate SPK */}
                    {isDraft && hasAnyRole(['super_admin', 'admin']) && (
                        <Button
                            hierarchy="primary"
                            size="md"
                            prefixIcon={<IconCheck size={16} />}
                            onClick={() => setConfirmActivateOpen(true)}
                        >
                            Aktifkan SPK
                        </Button>
                    )}

                    {/* Complete SPK */}
                    {isActive && hasAnyRole(['super_admin', 'admin']) && (
                        <Button
                            hierarchy="primary"
                            size="md"
                            prefixIcon={<IconCheck size={16} />}
                            onClick={() => setConfirmCompleteOpen(true)}
                        >
                            Selesaikan SPK
                        </Button>
                    )}

                    {/* Cancel SPK */}
                    {(isDraft || isActive) && hasAnyRole(['super_admin', 'admin', 'pimpinan']) && (
                        <Button
                            hierarchy="danger"
                            size="md"
                            prefixIcon={<IconBan size={16} />}
                            onClick={() => setCancelModalOpen(true)}
                        >
                            Batalkan SPK
                        </Button>
                    )}
                </div>
            </div>

            {/* Summary Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center">
                        <IconCash size={22} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">Total Nilai SPK</div>
                        <div className="text-lg font-bold text-gray-900">
                            {formatRupiah(spk.total_value)}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <IconBriefcase size={22} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">Jumlah Kegiatan</div>
                        <div className="text-lg font-bold text-gray-900">
                            {taskAssignments.length} Kegiatan
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center">
                        <IconCalendar size={22} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">Masa Kontrak</div>
                        <div className="text-sm font-bold text-gray-900">
                            {formatDateRange(spk.period_start, spk.period_end)}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
                        <IconUser size={22} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">Mitra Penerima</div>
                        <div className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                            {spk.mitra?.name}
                        </div>
                    </div>
                </div>
            </div>

            {/* Information Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-xs mb-6 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">
                        Klausul & Informasi Kontrak Perjanjian
                    </h2>
                    <span className="text-xs text-gray-500">
                        Dibuat oleh: {spk.creator?.name || 'Sistem'}
                    </span>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                        <span className="block text-xs font-medium text-gray-500">Nomor SPK</span>
                        <span className="font-semibold text-gray-900 text-base">{spk.spk_number}</span>
                    </div>

                    <div>
                        <span className="block text-xs font-medium text-gray-500">Tanggal Penandatanganan SPK</span>
                        <span className="font-medium text-gray-900">{formatDate(spk.contract_date)}</span>
                    </div>

                    <div>
                        <span className="block text-xs font-medium text-gray-500">Masa Berlaku Perjanjian</span>
                        <span className="font-medium text-gray-900">
                            {formatDateRange(spk.period_start, spk.period_end)}
                        </span>
                    </div>

                    <div>
                        <span className="block text-xs font-medium text-gray-500">Nama Pihak Kedua (Mitra)</span>
                        <span className="font-semibold text-gray-900">
                            {spk.mitra?.name} ({spk.mitra?.mitra_code})
                        </span>
                        <div className="text-xs text-gray-500 mt-0.5">
                            Kecamatan {spk.mitra?.district?.name || '-'}
                        </div>
                    </div>

                    <div>
                        <span className="block text-xs font-medium text-gray-500">Jabatan / Peran</span>
                        <span className="font-medium text-gray-900">{spk.position || '-'}</span>
                    </div>

                    <div>
                        <span className="block text-xs font-medium text-gray-500">Klasifikasi Pekerjaan</span>
                        <span className="font-medium text-gray-900">{spk.occupation || 'Mitra Statistik'}</span>
                    </div>

                    <div className="md:col-span-2">
                        <span className="block text-xs font-medium text-gray-500">Wilayah / Tempat Kerja</span>
                        <span className="font-medium text-gray-900">{spk.work_address || '-'}</span>
                    </div>

                    <div>
                        <span className="block text-xs font-medium text-gray-500">Status Perjanjian</span>
                        <div className="mt-1">
                            <SpkStatusBadge status={spk.status} />
                        </div>
                    </div>

                    {spk.notes && (
                        <div className="md:col-span-3 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-700 whitespace-pre-line">
                            <span className="font-semibold text-gray-900 block mb-1">Catatan Dokumen:</span>
                            {spk.notes}
                        </div>
                    )}
                </div>
            </div>

            {/* Attached Tasks Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            Daftar Penugasan & Rincian Beban Kerja
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Rincian kegiatan survei/sensus yang dibebankan pada SPK ini
                        </p>
                    </div>

                    {canModify && (
                        <Button
                            hierarchy="secondary"
                            size="sm"
                            prefixIcon={<IconPlus size={14} />}
                            onClick={() => setAttachModalOpen(true)}
                        >
                            Tambah Penugasan
                        </Button>
                    )}
                </div>

                {taskAssignments.length === 0 ? (
                    <div className="p-8">
                        <EmptyState
                            title="Belum Ada Rincian Penugasan Terlampir"
                            description="SPK ini belum memiliki penugasan kegiatan survei. Klik tombol di bawah untuk melampirkan penugasan mitra."
                            action={
                                canModify && (
                                    <Button
                                        hierarchy="primary"
                                        size="md"
                                        prefixIcon={<IconPlus size={16} />}
                                        onClick={() => setAttachModalOpen(true)}
                                    >
                                        Lampirkan Penugasan Sekarang
                                    </Button>
                                )
                            }
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">No</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">Uraian Tugas / Kegiatan</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">Jangka Waktu</th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-600">Volume</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-600">Tarif Satuan</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-600">Nilai Perjanjian</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">Akun Anggaran</th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                                    {canModify && (
                                        <th className="px-4 py-3 text-right font-medium text-gray-600">Aksi</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {taskAssignments.map((assignment, idx) => (
                                    <tr key={assignment.id} className="hover:bg-gray-50/70">
                                        <td className="px-4 py-3 text-gray-500 text-center w-12">
                                            {idx + 1}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                to={`/app/assignments/${assignment.id}`}
                                                className="font-medium text-blue-700 hover:underline"
                                            >
                                                {assignment.snapshots?.task_name || assignment.task?.name}
                                            </Link>
                                            <div className="text-xs text-gray-500">
                                                Tim: {assignment.snapshots?.team_name || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                                            {formatDateRange(assignment.start_date, assignment.end_date)}
                                        </td>
                                        <td className="px-4 py-3 text-center font-medium text-gray-900 whitespace-nowrap">
                                            {assignment.volume} {assignment.snapshots?.unit || 'Dokumen'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">
                                            {formatRupiah(assignment.unit_price)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-900 whitespace-nowrap">
                                            {formatRupiah(assignment.total_value)}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            <span className="font-mono font-medium text-gray-800">
                                                {assignment.snapshots?.budget_account_code || assignment.budget_account?.code || '-'}
                                            </span>
                                            <div className="truncate max-w-[160px] text-gray-500">
                                                {assignment.snapshots?.budget_account_name || assignment.budget_account?.name || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                            <AssignmentStatusBadge status={assignment.status} />
                                        </td>
                                        {canModify && (
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => setDetachTargetAssignment(assignment)}
                                                    className="p-1 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                    title="Lepas Penugasan dari SPK"
                                                >
                                                    <IconTrash size={16} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                <tr>
                                    <td colSpan={5} className="px-4 py-3 text-right font-bold text-gray-900">
                                        Total Nilai Kontrak SPK:
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-base text-blue-700 whitespace-nowrap">
                                        {formatRupiah(spk.total_value)}
                                    </td>
                                    <td colSpan={canModify ? 3 : 2}></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            <SpkFormModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                spk={spk}
                onSubmit={async (formData) => {
                    await spkService.updateSpk(id, formData);
                    queryClient.invalidateQueries({ queryKey: ['spk', id] });
                    queryClient.invalidateQueries({ queryKey: ['spks'] });
                    setEditModalOpen(false);
                }}
            />

            <AttachAssignmentsModal
                isOpen={attachModalOpen}
                onClose={() => setAttachModalOpen(false)}
                spk={spk}
                onSuccess={attachMutation.mutateAsync}
            />

            <CancelSpkModal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                spk={spk}
                onConfirm={cancelMutation.mutateAsync}
                isLoading={cancelMutation.isPending}
            />

            {/* Activate Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmActivateOpen}
                onClose={() => setConfirmActivateOpen(false)}
                title="Aktifkan Surat Perjanjian Kerja (SPK)"
                message={`Apakah Anda yakin ingin mengaktifkan SPK Nomor ${spk.spk_number}? Status SPK akan berubah menjadi Aktif dan penugasan di dalamnya dinyatakan resmi berjalan.`}
                confirmText="Aktifkan SPK"
                confirmVariant="primary"
                onConfirm={() => activateMutation.mutate()}
                isLoading={activateMutation.isPending}
            />

            {/* Complete Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmCompleteOpen}
                onClose={() => setConfirmCompleteOpen(false)}
                title="Selesaikan Surat Perjanjian Kerja (SPK)"
                message={`Apakah Anda yakin ingin menandai SPK Nomor ${spk.spk_number} sebagai Selesai? Pastikan seluruh target pekerjaan dan verifikasi lapangan telah dituntaskan.`}
                confirmText="Selesaikan SPK"
                confirmVariant="primary"
                onConfirm={() => completeMutation.mutate()}
                isLoading={completeMutation.isPending}
            />

            {/* Detach Confirm Dialog */}
            <ConfirmDialog
                isOpen={Boolean(detachTargetAssignment)}
                onClose={() => setDetachTargetAssignment(null)}
                title="Lepaskan Penugasan dari SPK"
                message={`Apakah Anda yakin ingin melepas penugasan "${detachTargetAssignment?.snapshots?.task_name || detachTargetAssignment?.task?.name}" dari SPK ini? Data penugasan tidak akan dihapus dan dapat dilampirkan kembali ke SPK lain.`}
                confirmText="Lepas Penugasan"
                confirmVariant="danger"
                onConfirm={() => detachMutation.mutate(detachTargetAssignment?.id)}
                isLoading={detachMutation.isPending}
            />
        </ContentContainer>
    );
};

export default SpkDetailPage;
