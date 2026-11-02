import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ContentContainer,
    PageHeader,
    CardContainer,
    LoadingState,
    ErrorState,
    AssignmentStatusBadge,
    CancelAssignmentModal,
    ConfirmDialog,
} from '../../components';
import { Button } from '@idds/react';
import {
    IconArrowLeft,
    IconCheck,
    IconSend,
    IconPlayerPlay,
    IconCircleCheck,
    IconBan,
    IconEdit,
    IconUser,
    IconCalendar,
    IconCash,
    IconBuildingBank,
    IconHistory,
} from '@tabler/icons-react';
import assignmentService from '../../services/assignmentService';
import masterDataService from '../../services/masterDataService';
import AssignmentFormModal from './AssignmentFormModal';

export const AssignmentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);

    // Fetch assignment detail
    const {
        data: assignmentResponse,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['assignment', id],
        queryFn: async () => {
            return await assignmentService.getAssignment(id);
        },
    });

    const assignment = assignmentResponse?.data;

    // Master references for editing
    const { data: teamsData } = useQuery({
        queryKey: ['teams', 'active'],
        queryFn: async () => (await masterDataService.getActiveTeams()).data || [],
        enabled: editModalOpen,
    });
    const { data: tasksData } = useQuery({
        queryKey: ['tasks', 'active'],
        queryFn: async () => (await masterDataService.getActiveTasks()).data || [],
        enabled: editModalOpen,
    });
    const { data: mitrasData } = useQuery({
        queryKey: ['mitras', 'all'],
        queryFn: async () => (await masterDataService.getMitras({ per_page: 200 })).data || [],
        enabled: editModalOpen,
    });
    const { data: accountsData } = useQuery({
        queryKey: ['budget-accounts', 'active'],
        queryFn: async () => (await masterDataService.getActiveBudgetAccounts()).data || [],
        enabled: editModalOpen,
    });

    // Mutations for workflow transitions
    const submitMutation = useMutation({
        mutationFn: () => assignmentService.submitForApproval(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignment', id] });
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
        },
    });

    const approveMutation = useMutation({
        mutationFn: () => assignmentService.approveAssignment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignment', id] });
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            setConfirmApproveOpen(false);
        },
    });

    const activateMutation = useMutation({
        mutationFn: () => assignmentService.activateAssignment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignment', id] });
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
        },
    });

    const completeMutation = useMutation({
        mutationFn: () => assignmentService.completeAssignment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignment', id] });
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: (reason) => assignmentService.cancelAssignment(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignment', id] });
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            setCancelModalOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data) => assignmentService.updateAssignment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignment', id] });
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            setEditModalOpen(false);
        },
    });

    if (isLoading) {
        return (
            <ContentContainer>
                <LoadingState message="Memuat detail penugasan mitra..." />
            </ContentContainer>
        );
    }

    if (isError || !assignment) {
        return (
            <ContentContainer>
                <ErrorState
                    title="Penugasan Tidak Ditemukan"
                    message="Data penugasan tidak ditemukan atau telah dihapus."
                    onRetry={refetch}
                />
            </ContentContainer>
        );
    }

    const statusVal = assignment.status?.value;
    const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

    return (
        <ContentContainer>
            <div className="mb-4">
                <Button
                    hierarchy="secondary"
                    size="sm"
                    prefixIcon={<IconArrowLeft size={16} />}
                    onClick={() => navigate('/app/assignments')}
                >
                    Kembali ke Daftar Penugasan
                </Button>
            </div>

            <PageHeader
                title={assignment.snapshots?.task_name || assignment.task?.name}
                subtitle={`Mitra: ${assignment.mitra?.name} (${assignment.mitra?.mitra_code}) | No. Rek: #${assignment.id}`}
                actions={
                    <div className="flex items-center gap-2">
                        <AssignmentStatusBadge status={assignment.status} />

                        {statusVal === 'draft' && (
                            <>
                                <Button
                                    hierarchy="secondary"
                                    size="sm"
                                    prefixIcon={<IconEdit size={16} />}
                                    onClick={() => setEditModalOpen(true)}
                                >
                                    Ubah Draf
                                </Button>
                                <Button
                                    hierarchy="primary"
                                    size="sm"
                                    prefixIcon={<IconSend size={16} />}
                                    onClick={() => submitMutation.mutate()}
                                    disabled={submitMutation.isPending}
                                >
                                    Ajukan Persetujuan
                                </Button>
                            </>
                        )}

                        {statusVal === 'pending_approval' && (
                            <Button
                                hierarchy="primary"
                                size="sm"
                                prefixIcon={<IconCheck size={16} />}
                                onClick={() => setConfirmApproveOpen(true)}
                                disabled={approveMutation.isPending}
                            >
                                Setujui Penugasan
                            </Button>
                        )}

                        {statusVal === 'approved' && (
                            <Button
                                hierarchy="primary"
                                size="sm"
                                prefixIcon={<IconPlayerPlay size={16} />}
                                onClick={() => activateMutation.mutate()}
                                disabled={activateMutation.isPending}
                            >
                                Aktifkan Penugasan
                            </Button>
                        )}

                        {statusVal === 'active' && (
                            <Button
                                hierarchy="primary"
                                size="sm"
                                prefixIcon={<IconCircleCheck size={16} />}
                                onClick={() => completeMutation.mutate()}
                                disabled={completeMutation.isPending}
                            >
                                Selesaikan Penugasan
                            </Button>
                        )}

                        {statusVal !== 'cancelled' && statusVal !== 'completed' && (
                            <Button
                                hierarchy="secondary"
                                size="sm"
                                prefixIcon={<IconBan size={16} />}
                                onClick={() => setCancelModalOpen(true)}
                                className="!text-red-700 hover:!bg-red-50 !border-red-200"
                            >
                                Batalkan
                            </Button>
                        )}
                    </div>
                }
            />

            {/* Main Content Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Nilai Honor & Volume */}
                    <CardContainer
                        title="Rincian Honor & Beban Penugasan"
                        subtitle="Kalkulasi resmi nilai perjanjian kerja dihitung di backend"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                            <div>
                                <span className="text-xs font-semibold uppercase text-gray-500 block">
                                    Volume Beban Tugas
                                </span>
                                <span className="text-sm font-semibold text-gray-900 mt-1 block">
                                    {assignment.volume} {assignment.snapshots?.unit}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold uppercase text-gray-500 block">
                                    Tarif Satuan Standar
                                </span>
                                <span className="text-sm font-semibold text-gray-900 mt-1 block">
                                    {formatRp(assignment.unit_price)}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold uppercase text-gray-500 block">
                                    Total Nilai Perjanjian
                                </span>
                                <span className="text-base font-bold text-blue-900 font-mono mt-0.5 block">
                                    {assignment.formatted_total_value || formatRp(assignment.total_value)}
                                </span>
                            </div>
                        </div>
                    </CardContainer>

                    {/* Snapshot Administrasi & Anggaran */}
                    <CardContainer
                        title="Snapshot Kegiatan & Pembebanan Anggaran"
                        subtitle="Salinan rekaman historis pada saat transaksi penugasan diterbitkan"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                            <div>
                                <span className="text-xs font-semibold uppercase text-gray-500 block">
                                    Nama Kegiatan Survei
                                </span>
                                <span className="text-sm font-medium text-gray-900 mt-1 block">
                                    {assignment.snapshots?.task_name}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold uppercase text-gray-500 block">
                                    Tim Penanggung Jawab
                                </span>
                                <span className="text-sm font-medium text-gray-900 mt-1 block">
                                    {assignment.snapshots?.team_name}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold uppercase text-gray-500 block">
                                    Akun Anggaran DIPA (MAK)
                                </span>
                                <span className="text-sm font-mono text-gray-900 mt-1 flex items-center gap-1.5">
                                    <IconBuildingBank size={16} className="text-gray-400" />
                                    {assignment.snapshots?.budget_account_code || 'Standar DIPA'}
                                </span>
                                {assignment.snapshots?.budget_account_name && (
                                    <span className="text-xs text-gray-500 mt-0.5 block">
                                        {assignment.snapshots.budget_account_name}
                                    </span>
                                )}
                            </div>
                            <div>
                                <span className="text-xs font-semibold uppercase text-gray-500 block">
                                    Surat Perintah Kerja (SPK)
                                </span>
                                <span className="text-sm text-gray-700 mt-1 block">
                                    {assignment.spk?.spk_number || 'Belum terhubung ke SPK (Phase 4)'}
                                </span>
                            </div>
                        </div>

                        {assignment.notes && (
                            <div className="pt-3 mt-3 border-t border-gray-100">
                                <span className="text-xs font-semibold text-gray-500 block mb-1">
                                    Catatan Penugasan:
                                </span>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {assignment.notes}
                                </p>
                            </div>
                        )}
                    </CardContainer>

                    {/* Pembatalan jika ada */}
                    {statusVal === 'cancelled' && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h3 className="text-sm font-bold text-red-900 flex items-center gap-1.5 mb-1">
                                <IconBan size={16} />
                                Penugasan Telah Dibatalkan
                            </h3>
                            <p className="text-xs text-red-800 leading-relaxed mb-2">
                                Alasan: &ldquo;{assignment.cancellation_reason}&rdquo;
                            </p>
                            <div className="text-[11px] text-red-600">
                                Dibatalkan oleh: {assignment.cancelled_by?.name || 'Sistem'} pada{' '}
                                {assignment.cancelled_at || '-'}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Profil Mitra */}
                    <CardContainer title="Profil Mitra Statistik">
                        <div className="space-y-3 py-1">
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase block">
                                    Nama Lengkap
                                </span>
                                <div
                                    onClick={() => navigate(`/app/mitras/${assignment.mitra?.id}`)}
                                    className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer mt-0.5"
                                >
                                    {assignment.mitra?.name}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase block">
                                    Kode Mitra
                                </span>
                                <span className="text-xs font-mono font-medium text-gray-900 mt-0.5 block">
                                    {assignment.mitra?.mitra_code}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase block">
                                    No. Kontak
                                </span>
                                <span className="text-xs font-mono text-gray-700 mt-0.5 block">
                                    {assignment.mitra?.phone || '-'}
                                </span>
                            </div>
                        </div>
                    </CardContainer>

                    {/* Jadwal & Periode Pembebanan */}
                    <CardContainer title="Jadwal & Periode Pembebanan">
                        <div className="space-y-3 py-1 text-sm">
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase block">
                                    Tanggal Mulai
                                </span>
                                <span className="font-medium text-gray-900 mt-0.5 flex items-center gap-1">
                                    <IconCalendar size={14} className="text-blue-600" />
                                    {assignment.start_date}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase block">
                                    Tanggal Selesai
                                </span>
                                <span className="font-medium text-gray-900 mt-0.5 flex items-center gap-1">
                                    <IconCalendar size={14} className="text-gray-400" />
                                    {assignment.end_date}
                                </span>
                            </div>
                            <div className="pt-2 border-t border-gray-100 text-xs text-gray-600">
                                <span className="font-semibold text-gray-700 block">Kaidah Honor:</span>
                                Seluruh nilai Rp dihitung pada bulan tanggal mulai ({assignment.start_date?.slice(0, 7)}).
                            </div>
                        </div>
                    </CardContainer>

                    {/* Jejak Audit & Otorisasi */}
                    <CardContainer title="Otorisasi & Audit">
                        <div className="space-y-2.5 py-1 text-xs text-gray-600">
                            <div>
                                <span className="text-gray-400 block">Dibuat oleh:</span>
                                <span className="font-medium text-gray-800">
                                    {assignment.created_by?.name || '-'} ({assignment.created_at?.slice(0, 10)})
                                </span>
                            </div>
                            {assignment.approved_by && (
                                <div>
                                    <span className="text-gray-400 block">Disetujui oleh:</span>
                                    <span className="font-medium text-emerald-800">
                                        {assignment.approved_by.name} ({assignment.approved_at?.slice(0, 10)})
                                    </span>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-400 block">Dihitung dalam kuota:</span>
                                <span className="font-medium text-gray-800">
                                    {assignment.status?.is_counted ? 'Ya (Aktif / Disetujui)' : 'Tidak (Draf/Batal)'}
                                </span>
                            </div>
                        </div>
                    </CardContainer>
                </div>
            </div>

            {/* Edit Draft Modal */}
            <AssignmentFormModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                assignment={assignment}
                teams={teamsData || []}
                tasks={tasksData || []}
                mitras={mitrasData || []}
                budgetAccounts={accountsData || []}
                onSubmit={(formData) => updateMutation.mutateAsync(formData)}
                isLoading={updateMutation.isPending}
            />

            {/* Cancel Assignment Modal */}
            <CancelAssignmentModal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                assignment={assignment}
                onConfirm={(reason) => cancelMutation.mutateAsync(reason)}
                isLoading={cancelMutation.isPending}
            />

            {/* Approve Confirmation Dialog */}
            <ConfirmDialog
                open={confirmApproveOpen}
                onClose={() => setConfirmApproveOpen(false)}
                onConfirm={() => approveMutation.mutate()}
                title="Persetujuan Penugasan Mitra"
                description={`Apakah Anda yakin menyetujui penugasan ${
                    assignment.snapshots?.task_name
                } senilai ${formatRp(assignment.total_value)} untuk ${
                    assignment.mitra?.name
                }? Transaksi akan divalidasi terhadap batas 10 tugas atau Rp 4.000.000.`}
                confirmText="Ya, Setujui"
                cancelText="Batal"
                isLoading={approveMutation.isPending}
            />
        </ContentContainer>
    );
};

export default AssignmentDetailPage;
