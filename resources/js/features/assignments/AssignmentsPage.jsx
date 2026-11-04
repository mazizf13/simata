import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ContentContainer,
    PageHeader,
    DataTable,
    AssignmentStatusBadge,
    CancelAssignmentModal,
    CustomSelect,
} from '../../components';
import { Button } from '@idds/react';
import {
    IconPlus,
    IconUsers,
    IconEye,
    IconEdit,
    IconBan,
    IconCalendar,
    IconLayoutKanban,
    IconList,
    IconDownload,
} from '@tabler/icons-react';
import assignmentService from '../../services/assignmentService';
import masterDataService from '../../services/masterDataService';
import reportService from '../../services/reportService';
import { formatDate, formatDateRange } from '../../utils/formatters';
import AssignmentFormModal from './AssignmentFormModal';
import BulkAssignmentModal from './BulkAssignmentModal';
import AssignmentCalendarView from './AssignmentCalendarView';
import AssignmentKanbanView from './AssignmentKanbanView';

export const AssignmentsPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // View state: 'table' | 'calendar' | 'kanban'
    const [activeView, setActiveView] = useState('table');

    // Filters state
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [perPage, setPerPage] = useState(15);

    // Modals state
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [cancelModalState, setCancelModalState] = useState({
        open: false,
        assignment: null,
    });

    // Reference data: Teams, Tasks, Mitras, Budget Accounts
    const { data: teamsData } = useQuery({
        queryKey: ['teams', 'active'],
        queryFn: async () => (await masterDataService.getActiveTeams()).data || [],
    });
    const teams = teamsData || [];

    const { data: tasksData } = useQuery({
        queryKey: ['tasks', 'active'],
        queryFn: async () => (await masterDataService.getActiveTasks()).data || [],
    });
    const tasks = tasksData || [];

    const { data: mitrasData } = useQuery({
        queryKey: ['mitras', 'all'],
        queryFn: async () => (await masterDataService.getMitras({ per_page: 200 })).data || [],
    });
    const mitras = mitrasData || [];

    const { data: accountsData } = useQuery({
        queryKey: ['budget-accounts', 'active'],
        queryFn: async () => (await masterDataService.getActiveBudgetAccounts()).data || [],
    });
    const budgetAccounts = accountsData || [];

    // Fetch assignments list
    const {
        data: assignmentsResponse,
        isLoading,
    } = useQuery({
        queryKey: ['assignments', { page, search, selectedTaskId, selectedStatus, perPage }],
        queryFn: async () => {
            const params = {
                page,
                per_page: perPage,
                search: search.trim() || undefined,
                task_id: selectedTaskId || undefined,
                status: selectedStatus || undefined,
            };
            return await assignmentService.getAssignments(params);
        },
        placeholderData: (prev) => prev,
    });

    const assignmentsList = assignmentsResponse?.data || [];
    const meta = assignmentsResponse?.meta || { current_page: 1, last_page: 1, total: 0 };

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data) => assignmentService.createAssignment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            setFormModalOpen(false);
            setSelectedAssignment(null);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => assignmentService.updateAssignment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            setFormModalOpen(false);
            setSelectedAssignment(null);
        },
    });

    const bulkCreateMutation = useMutation({
        mutationFn: (data) => assignmentService.bulkCreate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            setBulkModalOpen(false);
        },
    });

    const cancelMutation = useMutation({
        mutationFn: ({ id, reason }) => assignmentService.cancelAssignment(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            setCancelModalState({ open: false, assignment: null });
        },
    });

    const handleOpenCreate = () => {
        setSelectedAssignment(null);
        setFormModalOpen(true);
    };

    const handleOpenEdit = (assignment) => {
        setSelectedAssignment(assignment);
        setFormModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        if (selectedAssignment) {
            return await updateMutation.mutateAsync({
                id: selectedAssignment.id,
                data: formData,
            });
        } else {
            return await createMutation.mutateAsync(formData);
        }
    };

    const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

    const columns = [
        {
            key: 'task',
            header: 'Kegiatan Survei & Tim',
            render: (row) => (
                <div>
                    <div
                        onClick={() => navigate(`/app/assignments/${row.id}`)}
                        className="font-medium text-gray-900 hover:text-blue-700 cursor-pointer"
                    >
                        {row.snapshots?.task_name || row.task?.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <span className="inline-block px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 font-medium">
                            {row.snapshots?.team_name || row.task?.team?.name}
                        </span>
                        {row.snapshots?.budget_account_code && (
                            <span className="font-mono text-[11px] text-gray-400">
                                {row.snapshots.budget_account_code}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'mitra',
            header: 'Mitra Statistik',
            render: (row) => (
                <div>
                    <div
                        onClick={() => navigate(`/app/mitras/${row.mitra_id}`)}
                        className="font-medium text-gray-900 hover:underline cursor-pointer"
                    >
                        {row.mitra?.name || '-'}
                    </div>
                    <div className="text-xs font-mono text-gray-500">{row.mitra?.mitra_code}</div>
                </div>
            ),
        },
        {
            key: 'dates',
            header: 'Jadwal Penugasan',
            render: (row) => (
                <div className="text-xs text-gray-700">
                    <div>{formatDate(row.start_date)}</div>
                    <div className="text-gray-500">s.d. {formatDate(row.end_date)}</div>
                </div>
            ),
        },
        {
            key: 'volume_rate',
            header: 'Beban & Tarif',
            render: (row) => (
                <div className="text-xs text-gray-700">
                    <span className="font-medium">{row.volume} {row.snapshots?.unit}</span>
                    <span className="text-gray-400 block">@ {formatRp(row.unit_price)}</span>
                </div>
            ),
        },
        {
            key: 'total_value',
            header: 'Nilai Honor',
            align: 'right',
            render: (row) => (
                <div className="font-mono font-semibold text-gray-900 text-xs">
                    {row.formatted_total_value || formatRp(row.total_value)}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <AssignmentStatusBadge status={row.status} />,
        },
        {
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (row) => {
                const statusVal = row.status?.value;
                return (
                    <div className="flex items-center justify-end gap-1.5">
                        <button
                            type="button"
                            onClick={() => navigate(`/app/assignments/${row.id}`)}
                            className="p-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="Lihat Detail Penugasan"
                        >
                            <IconEye size={16} />
                        </button>
                        {statusVal === 'draft' && (
                            <button
                                type="button"
                                onClick={() => handleOpenEdit(row)}
                                className="p-1.5 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                                title="Ubah Draf"
                            >
                                <IconEdit size={16} />
                            </button>
                        )}
                        {statusVal !== 'cancelled' && statusVal !== 'completed' && (
                            <button
                                type="button"
                                onClick={() => setCancelModalState({ open: true, assignment: row })}
                                className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                title="Batalkan Penugasan"
                            >
                                <IconBan size={16} />
                            </button>
                        )}
                    </div>
                );
            },
        },
    ];

    const handleExportAssignments = () => {
        const today = new Date();
        const url = reportService.getExportAssignmentsUrl({
            year: today.getFullYear(),
            month: today.getMonth() + 1,
            task_id: selectedTaskId || undefined,
            status: selectedStatus || undefined,
        });
        window.open(url, '_blank');
    };

    return (
        <ContentContainer>
            <PageHeader
                title="Daftar Penugasan Mitra"
                subtitle="Monitoring, alokasi tugas sensus & survei, dan validasi batas honor bulanan BPS Kabupaten Mojokerto"
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            hierarchy="secondary"
                            size="md"
                            prefixIcon={<IconDownload size={16} />}
                            onClick={handleExportAssignments}
                        >
                            Export Detail (CSV)
                        </Button>
                        <Button
                            hierarchy="secondary"
                            size="md"
                            prefixIcon={<IconUsers size={16} />}
                            onClick={() => setBulkModalOpen(true)}
                        >
                            Penugasan Kolektif
                        </Button>
                        <Button
                            hierarchy="primary"
                            size="md"
                            prefixIcon={<IconPlus size={16} />}
                            onClick={handleOpenCreate}
                        >
                            Tambah Penugasan
                        </Button>
                    </div>
                }
            />

            {/* View Mode Switcher Tabs */}
            <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg px-2 pt-2">
                <button
                    onClick={() => setActiveView('table')}
                    className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                        activeView === 'table'
                            ? 'border-blue-700 text-blue-700 bg-blue-50/40 rounded-t'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <IconList size={18} />
                    Tabel Penugasan
                </button>
                <button
                    onClick={() => setActiveView('calendar')}
                    className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                        activeView === 'calendar'
                            ? 'border-blue-700 text-blue-700 bg-blue-50/40 rounded-t'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <IconCalendar size={18} />
                    Kalender Penugasan
                </button>
                <button
                    onClick={() => setActiveView('kanban')}
                    className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                        activeView === 'kanban'
                            ? 'border-blue-700 text-blue-700 bg-blue-50/40 rounded-t'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <IconLayoutKanban size={18} />
                    Papan Kanban Alur Kerja
                </button>
            </div>

            {/* View 1: Table */}
            {activeView === 'table' && (
                <>
                    {/* Filter Toolbar */}
                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xs mb-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                                    Pencarian Penugasan
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Cari nama mitra, kode mitra, kegiatan, MAK..."
                                    className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                                    Filter Kegiatan Survei
                                </label>
                                <CustomSelect
                                    value={selectedTaskId}
                                    onChange={(val) => {
                                        setSelectedTaskId(val);
                                        setPage(1);
                                    }}
                                    placeholder="Semua Kegiatan"
                                    options={[
                                        { value: '', label: 'Semua Kegiatan' },
                                        ...tasks.map((t) => ({
                                            value: t.id,
                                            label: t.name,
                                            badge: t.code,
                                        })),
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                                    Status Alur Kerja
                                </label>
                                <CustomSelect
                                    value={selectedStatus}
                                    onChange={(val) => {
                                        setSelectedStatus(val);
                                        setPage(1);
                                    }}
                                    placeholder="Semua Status"
                                    options={[
                                        { value: '', label: 'Semua Status' },
                                        { value: 'draft', label: 'Draf' },
                                        { value: 'pending_approval', label: 'Menunggu Persetujuan' },
                                        { value: 'approved', label: 'Disetujui' },
                                        { value: 'active', label: 'Aktif Berjalan' },
                                        { value: 'completed', label: 'Selesai' },
                                        { value: 'cancelled', label: 'Dibatalkan' },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Assignments Table */}
                    <DataTable
                        columns={columns}
                        data={assignmentsList}
                        isLoading={isLoading}
                        emptyTitle="Data Penugasan Tidak Ditemukan"
                        emptyDescription={
                            search || selectedTaskId || selectedStatus
                                ? 'Tidak ada penugasan yang sesuai dengan filter atau kata kunci yang dimasukkan.'
                                : 'Belum ada data penugasan tercatat. Klik "Tambah Penugasan" atau "Penugasan Kolektif" untuk mulai menugaskan mitra.'
                        }
                        pagination={{
                            currentPage: meta.current_page,
                            totalPages: meta.last_page,
                            totalItems: meta.total,
                            perPage: meta.per_page,
                            onPageChange: (newPage) => setPage(newPage),
                        }}
                    />
                </>
            )}

            {/* View 2: Calendar */}
            {activeView === 'calendar' && (
                <AssignmentCalendarView teams={teams} tasks={tasks} />
            )}

            {/* View 3: Kanban */}
            {activeView === 'kanban' && (
                <AssignmentKanbanView teams={teams} />
            )}

            {/* Single Create / Edit Modal */}
            <AssignmentFormModal
                isOpen={formModalOpen}
                onClose={() => {
                    setFormModalOpen(false);
                    setSelectedAssignment(null);
                }}
                assignment={selectedAssignment}
                teams={teams}
                tasks={tasks}
                mitras={mitras}
                budgetAccounts={budgetAccounts}
                onSubmit={handleFormSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Bulk Assignment Modal */}
            <BulkAssignmentModal
                isOpen={bulkModalOpen}
                onClose={() => setBulkModalOpen(false)}
                teams={teams}
                tasks={tasks}
                mitras={mitras}
                budgetAccounts={budgetAccounts}
                onSubmit={(data) => bulkCreateMutation.mutateAsync(data)}
                isLoading={bulkCreateMutation.isPending}
            />

            {/* Cancel Modal */}
            <CancelAssignmentModal
                isOpen={cancelModalState.open}
                onClose={() => setCancelModalState({ open: false, assignment: null })}
                assignment={cancelModalState.assignment}
                onConfirm={(reason) =>
                    cancelMutation.mutateAsync({
                        id: cancelModalState.assignment.id,
                        reason,
                    })
                }
                isLoading={cancelMutation.isPending}
            />
        </ContentContainer>
    );
};

export default AssignmentsPage;
