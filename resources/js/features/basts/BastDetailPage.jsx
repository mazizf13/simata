import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ContentContainer,
    PageHeader,
    BastStatusBadge,
    LoadingState,
    ErrorState,
    EmptyState,
    ConfirmDialog,
} from '../../components';
import { Button, Badge } from '@idds/react';
import {
    IconArrowLeft,
    IconDownload,
    IconCheck,
    IconEdit,
    IconCalendar,
    IconUser,
    IconFileText,
    IconBriefcase,
    IconFileCertificate,
    IconAlertCircle,
} from '@tabler/icons-react';
import { bastService } from '../../services/bastService';
import { BastFormModal } from './BastFormModal';
import { formatDate, formatDateRange } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export const BastDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { hasAnyRole } = useAuth();

    // Modals & States
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Fetch BAST detail
    const {
        data: bastResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['bast', id],
        queryFn: async () => {
            const res = await bastService.getBast(id);
            return res.data || res;
        },
        enabled: Boolean(id),
    });

    const bast = bastResponse?.data || bastResponse;
    const spk = bast?.spk;
    const taskAssignments = spk?.task_assignments || [];

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: async () => await bastService.approveBast(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bast', id] });
            queryClient.invalidateQueries({ queryKey: ['basts'] });
            setConfirmApproveOpen(false);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async (payload) => await bastService.updateBast(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bast', id] });
            queryClient.invalidateQueries({ queryKey: ['basts'] });
            setEditModalOpen(false);
        },
    });

    const handleDownloadDocument = async () => {
        try {
            setDownloading(true);
            const cleanBast = bast?.bast_number ? bast.bast_number.replace(/[\/\\]/g, '-') : id;
            const cleanMitra = spk?.mitra?.name ? spk.mitra.name.replace(/\s+/g, '_') : 'Mitra';
            const defaultFilename = `BAST_${cleanBast}_${cleanMitra}.docx`;
            await bastService.downloadDocument(id, defaultFilename);
            refetch();
        } catch (err) {
            console.error('Gagal mengunduh dokumen BAST:', err);
            alert('Terjadi kesalahan saat memproses atau mengunduh dokumen BAST.');
        } finally {
            setDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <ContentContainer>
                <div className="py-12">
                    <LoadingState text="Memuat rincian Berita Acara Serah Terima (BAST)..." />
                </div>
            </ContentContainer>
        );
    }

    if (isError || !bast) {
        return (
            <ContentContainer>
                <div className="py-12">
                    <ErrorState
                        title="BAST Tidak Ditemukan"
                        message={error?.message || 'Data Berita Acara Serah Terima tidak ditemukan atau telah dihapus.'}
                        onRetry={() => navigate('/app/basts')}
                    />
                </div>
            </ContentContainer>
        );
    }

    const statusVal = typeof bast.status === 'object' && bast.status !== null ? bast.status.value : bast.status;
    const isDraft = statusVal === 'draft';
    const isSubmitted = statusVal === 'submitted';
    const isApproved = statusVal === 'approved';
    const isCancelled = statusVal === 'cancelled';
    const canModify = (isDraft || isSubmitted) && hasAnyRole(['super_admin', 'admin', 'operator_tim']);
    const canApprove = (isDraft || isSubmitted) && hasAnyRole(['super_admin', 'admin', 'pimpinan']);

    return (
        <ContentContainer>
            {/* Header / Nav Back */}
            <div className="mb-4">
                <Button
                    hierarchy="tertiary"
                    size="sm"
                    prefixIcon={<IconArrowLeft size={16} />}
                    onClick={() => navigate('/app/basts')}
                >
                    Kembali ke Daftar BAST
                </Button>
            </div>

            {/* Title Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 font-mono">
                            {bast.bast_number}
                        </h1>
                        <BastStatusBadge status={bast.status} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Berita Acara Serah Terima Hasil Pekerjaan atas SPK{' '}
                        {spk ? (
                            <Link
                                to={`/app/spks/${spk.id}`}
                                className="font-semibold text-blue-700 hover:underline font-mono"
                            >
                                {spk.spk_number}
                            </Link>
                        ) : '-'}
                        {spk?.mitra ? ` (${spk.mitra.name})` : ''}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Unduh Berkas Word */}
                    <Button
                        hierarchy="secondary"
                        size="md"
                        prefixIcon={<IconDownload size={16} />}
                        onClick={handleDownloadDocument}
                        disabled={downloading}
                    >
                        {downloading ? 'Memproses Berkas...' : 'Unduh BAST (.docx)'}
                    </Button>

                    {/* Ubah BAST */}
                    {canModify && (
                        <Button
                            hierarchy="secondary"
                            size="md"
                            prefixIcon={<IconEdit size={16} />}
                            onClick={() => setEditModalOpen(true)}
                        >
                            Ubah BAST
                        </Button>
                    )}

                    {/* Sahkan BAST */}
                    {canApprove && (
                        <Button
                            hierarchy="primary"
                            size="md"
                            prefixIcon={<IconCheck size={16} />}
                            onClick={() => setConfirmApproveOpen(true)}
                        >
                            Sahkan BAST
                        </Button>
                    )}
                </div>
            </div>

            {/* Summary Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center">
                        <IconFileText size={22} />
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs text-gray-500 font-medium">Rujukan SPK</div>
                        <div className="text-sm font-bold text-gray-900 font-mono truncate">
                            {spk?.spk_number || '-'}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center">
                        <IconCalendar size={22} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">Tanggal BAST</div>
                        <div className="text-sm font-bold text-gray-900">
                            {formatDate(bast.bast_date)}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
                        <IconUser size={22} />
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs text-gray-500 font-medium">Mitra Penerima</div>
                        <div className="text-sm font-bold text-gray-900 truncate">
                            {spk?.mitra?.name || '-'}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <IconBriefcase size={22} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">Rincian Pekerjaan</div>
                        <div className="text-sm font-bold text-gray-900">
                            {taskAssignments.length} Kegiatan Selesai
                        </div>
                    </div>
                </div>
            </div>

            {/* Information Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-xs mb-6 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">
                        Informasi Administrasi & Rujukan Perjanjian
                    </h2>
                    <span className="text-xs text-gray-500">
                        Dokumen serah terima hasil sensus/survei
                    </span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                        <span className="block text-xs font-medium text-gray-500">Nomor BAST</span>
                        <span className="font-semibold text-gray-900 font-mono">{bast.bast_number}</span>
                    </div>

                    <div>
                        <span className="block text-xs font-medium text-gray-500">Tanggal Serah Terima (BAST)</span>
                        <span className="font-medium text-gray-900">{formatDate(bast.bast_date)}</span>
                    </div>

                    <div>
                        <span className="block text-xs font-medium text-gray-500">Status Pengesahan</span>
                        <div className="mt-1">
                            <BastStatusBadge status={bast.status} />
                        </div>
                    </div>

                    <div>
                        <span className="block text-xs font-medium text-gray-500">Nomor Perjanjian Kerja (SPK)</span>
                        <div className="mt-0.5">
                            {spk ? (
                                <Link
                                    to={`/app/spks/${spk.id}`}
                                    className="font-medium text-blue-700 hover:underline font-mono text-sm"
                                >
                                    {spk.spk_number}
                                </Link>
                            ) : '-'}
                        </div>
                    </div>

                    <div>
                        <span className="block text-xs font-medium text-gray-500">Tanggal Kontrak SPK</span>
                        <span className="font-medium text-gray-900">
                            {spk?.contract_date ? formatDate(spk.contract_date) : '-'}
                        </span>
                    </div>

                    <div>
                        <span className="block text-xs font-medium text-gray-500">Rentang Periode Tugas</span>
                        <span className="font-medium text-gray-900">
                            {spk?.period_start && spk?.period_end
                                ? formatDateRange(spk.period_start, spk.period_end)
                                : '-'}
                        </span>
                    </div>

                    <div>
                        <span className="block text-xs font-medium text-gray-500">Pihak Pertama (PPK BPS)</span>
                        <span className="font-medium text-gray-900 block">
                            {spk?.first_party_name || '-'}
                        </span>
                        {spk?.first_party_nip && (
                            <span className="text-xs text-gray-500">NIP. {spk.first_party_nip}</span>
                        )}
                    </div>

                    <div>
                        <span className="block text-xs font-medium text-gray-500">Pihak Kedua (Mitra Statistik)</span>
                        <span className="font-medium text-gray-900 block">
                            {spk?.second_party_name || spk?.mitra?.name || '-'}
                        </span>
                        {spk?.second_party_nik && (
                            <span className="text-xs text-gray-500">NIK. {spk.second_party_nik}</span>
                        )}
                    </div>

                    <div>
                        <span className="block text-xs font-medium text-gray-500">Arsip Berkas Digital</span>
                        <div className="mt-1">
                            {bast.has_document ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    <IconCheck size={13} className="text-emerald-600" />
                                    Tersimpan ({bast.document_hash ? bast.document_hash.substring(0, 10) + '...' : 'Tersedia'})
                                </span>
                            ) : (
                                <span className="text-[11px] text-gray-400 italic">
                                    Otomatis dibuat saat tombol Unduh diklik
                                </span>
                            )}
                        </div>
                    </div>

                    {bast.notes && (
                        <div className="md:col-span-3 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-700 whitespace-pre-line">
                            <span className="font-semibold text-gray-900 block mb-1">
                                Keterangan & Catatan Pemeriksaan:
                            </span>
                            {bast.notes}
                        </div>
                    )}
                </div>
            </div>

            {/* Deliverables / Hasil Pekerjaan Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            Daftar Hasil Pekerjaan yang Diserahterimakan
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Pemeriksaan kesesuaian target dan realisasi hasil sensus/survei (tanpa nominal biaya/honor)
                        </p>
                    </div>
                </div>

                {taskAssignments.length === 0 ? (
                    <div className="p-8">
                        <EmptyState
                            title="Belum Ada Rincian Hasil Pekerjaan"
                            description="SPK yang dirujuk belum memiliki rincian penugasan yang dapat diserahterimakan."
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600 w-12">No</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                                        Uraian Kegiatan Sensus / Survei
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                                        Periode Tugas
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-600">
                                        Target Beban Kerja
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-600">
                                        Realisasi Diserahkan
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-600">
                                        Status Pemeriksaan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {taskAssignments.map((assignment, index) => {
                                    const targetVol = assignment.volume ?? assignment.target_volume ?? 0;
                                    const unit = assignment.snapshots?.unit || assignment.task?.default_unit || assignment.task?.unit || 'Dokumen';
                                    const taskName = assignment.snapshots?.task_name || assignment.task?.name || '-';
                                    const teamName = assignment.snapshots?.team_name || assignment.task?.team?.name || '-';
                                    const isCompleted = assignment.status?.value === 'completed' || assignment.status?.value === 'accepted' || assignment.status === 'completed' || assignment.status === 'accepted';

                                    return (
                                        <tr key={assignment.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-500 text-center font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">
                                                    {taskName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Tim: {teamName}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                                                {formatDateRange(
                                                    assignment.start_date || assignment.task?.start_date,
                                                    assignment.end_date || assignment.task?.end_date
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center font-semibold text-gray-900">
                                                {targetVol} {unit}
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs text-gray-400 italic">
                                                (Diisi tulisan tangan mitra)
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {isCompleted ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                        <IconCheck size={12} className="text-emerald-600" />
                                                        Selesai
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                                        Dalam Pelaksanaan
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Edit BAST */}
            {editModalOpen && (
                <BastFormModal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    bast={bast}
                    onSubmit={async (payload) => {
                        await updateMutation.mutateAsync(payload);
                    }}
                    isLoading={updateMutation.isPending}
                />
            )}

            {/* Confirm Dialog Sahkan BAST */}
            {confirmApproveOpen && (
                <ConfirmDialog
                    isOpen={confirmApproveOpen}
                    title="Sahkan Berita Acara Serah Terima (BAST)"
                    message={`Apakah Anda yakin ingin mengesahkan BAST dengan nomor "${bast.bast_number}"? Dokumen yang telah disahkan menyatakan bahwa seluruh hasil pekerjaan mitra telah diperiksa dan diterima dengan baik.`}
                    confirmLabel="Ya, Sahkan BAST"
                    cancelLabel="Batal"
                    variant="primary"
                    isLoading={approveMutation.isPending}
                    onConfirm={() => approveMutation.mutate()}
                    onCancel={() => setConfirmApproveOpen(false)}
                />
            )}
        </ContentContainer>
    );
};

export default BastDetailPage;
