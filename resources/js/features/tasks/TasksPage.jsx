import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ContentContainer,
    PageHeader,
    DataTable,
    StatusBadge,
    ConfirmDialog,
} from '../../components';
import { Button } from '@idds/react';
import {
    IconFolderPlus,
    IconEdit,
    IconTrash,
    IconEye,
} from '@tabler/icons-react';
import masterDataService from '../../services/masterDataService';
import TaskFormModal from './TaskFormModal';

export const TasksPage = () => {
    const queryClient = useQueryClient();

    // Filter & Pagination state
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [perPage, setPerPage] = useState(15);

    // Modal / Drawer state
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [deactivateDialog, setDeactivateDialog] = useState({
        open: false,
        task: null,
    });

    // Reference data: Teams & Budget Accounts
    const { data: teamsData } = useQuery({
        queryKey: ['teams', 'active'],
        queryFn: async () => {
            const res = await masterDataService.getActiveTeams();
            return res.data || [];
        },
    });
    const teams = teamsData || [];

    const { data: accountsData } = useQuery({
        queryKey: ['budget-accounts', 'active'],
        queryFn: async () => {
            const res = await masterDataService.getActiveBudgetAccounts();
            return res.data || [];
        },
    });
    const budgetAccounts = accountsData || [];

    // Fetch tasks
    const {
        data: tasksResponse,
        isLoading,
    } = useQuery({
        queryKey: ['tasks', { page, search, selectedTeam, selectedStatus, perPage }],
        queryFn: async () => {
            const params = {
                page,
                per_page: perPage,
                search: search.trim() || undefined,
                team_id: selectedTeam || undefined,
                is_active: selectedStatus !== '' ? selectedStatus : undefined,
            };
            return await masterDataService.getTasks(params);
        },
        placeholderData: (prev) => prev,
    });

    const tasksList = tasksResponse?.data || [];
    const meta = tasksResponse?.meta || { current_page: 1, last_page: 1, total: 0 };

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data) => masterDataService.createTask(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setDrawerOpen(false);
            setSelectedTask(null);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => masterDataService.updateTask(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setDrawerOpen(false);
            setSelectedTask(null);
        },
    });

    const deactivateMutation = useMutation({
        mutationFn: (id) => masterDataService.deactivateTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setDeactivateDialog({ open: false, task: null });
        },
    });

    const handleOpenCreate = () => {
        setSelectedTask(null);
        setDrawerOpen(true);
    };

    const handleOpenEdit = (task) => {
        setSelectedTask(task);
        setDrawerOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        if (selectedTask) {
            return await updateMutation.mutateAsync({
                id: selectedTask.id,
                data: formData,
            });
        } else {
            return await createMutation.mutateAsync(formData);
        }
    };

    const handleConfirmDeactivate = async () => {
        if (!deactivateDialog.task) return;
        await deactivateMutation.mutateAsync(deactivateDialog.task.id);
    };

    const columns = [
        {
            key: 'code',
            header: 'Kode Kegiatan',
            render: (row) => (
                <div className="font-mono text-xs font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200 inline-block">
                    {row.code}
                </div>
            ),
        },
        {
            key: 'name',
            header: 'Nama Kegiatan Survei',
            render: (row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.name}</div>
                    {row.description && (
                        <div className="text-xs text-gray-500 line-clamp-1 max-w-md">
                            {row.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'team',
            header: 'Tim Penanggung Jawab',
            render: (row) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                    {row.team?.name || '-'}
                </span>
            ),
        },
        {
            key: 'rate',
            header: 'Tarif / Satuan',
            render: (row) => (
                <div>
                    <div className="font-medium text-gray-900 text-xs">
                        {row.formatted_rate || `Rp ${Number(row.default_rate).toLocaleString('id-ID')}`}
                    </div>
                    <div className="text-[11px] text-gray-500">per {row.default_unit}</div>
                </div>
            ),
        },
        {
            key: 'budget_account',
            header: 'Akun Anggaran',
            render: (row) => (
                <span className="text-xs font-mono text-gray-700">
                    {row.default_budget_account?.code || '-'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => (
                <StatusBadge status={row.is_active ? 'active' : 'inactive'} />
            ),
        },
        {
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (row) => (
                <div className="flex items-center justify-end gap-1.5">
                    <button
                        type="button"
                        onClick={() => handleOpenEdit(row)}
                        className="p-1.5 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                        title="Ubah Kegiatan"
                    >
                        <IconEdit size={16} />
                    </button>
                    {row.is_active && (
                        <button
                            type="button"
                            onClick={() => setDeactivateDialog({ open: true, task: row })}
                            className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Nonaktifkan Kegiatan"
                        >
                            <IconTrash size={16} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <ContentContainer>
            <PageHeader
                title="Katalog Kegiatan Survei"
                subtitle="Master kegiatan statistik, tarif standar honor, dan akun pembebanan anggaran BPS Kabupaten Mojokerto"
                actions={
                    <Button
                        hierarchy="primary"
                        size="md"
                        prefixIcon={<IconFolderPlus size={16} />}
                        onClick={handleOpenCreate}
                    >
                        Tambah Kegiatan
                    </Button>
                }
            />

            {/* Filter Toolbar */}
            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xs mb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                            Pencarian Kegiatan
                        </label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Cari berdasarkan nama kegiatan, kode, deskripsi..."
                            className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                            Tim Penanggung Jawab
                        </label>
                        <select
                            value={selectedTeam}
                            onChange={(e) => {
                                setSelectedTeam(e.target.value);
                                setPage(1);
                            }}
                            className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Tim Kerja</option>
                            {teams.map((t) => (
                                <option key={t.id} value={t.id}>
                                    [{t.code}] {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                            Status Kegiatan
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                setPage(1);
                            }}
                            className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Status</option>
                            <option value="1">Aktif</option>
                            <option value="0">Nonaktif</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tasks Table */}
            <DataTable
                columns={columns}
                data={tasksList}
                isLoading={isLoading}
                emptyTitle="Kegiatan Survei Tidak Ditemukan"
                emptyDescription={
                    search || selectedTeam || selectedStatus
                        ? 'Tidak ada kegiatan survei yang cocok dengan filter yang dipilih.'
                        : 'Belum ada katalog kegiatan survei terdaftar. Klik "Tambah Kegiatan" untuk menambahkan.'
                }
                pagination={{
                    currentPage: meta.current_page,
                    totalPages: meta.last_page,
                    totalItems: meta.total,
                    perPage: meta.per_page,
                    onPageChange: (newPage) => setPage(newPage),
                }}
            />

            {/* Create / Edit Modal */}
            <TaskFormModal
                isOpen={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setSelectedTask(null);
                }}
                task={selectedTask}
                teams={teams}
                budgetAccounts={budgetAccounts}
                onSubmit={handleFormSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Deactivation Confirm Dialog */}
            <ConfirmDialog
                open={deactivateDialog.open}
                onClose={() => setDeactivateDialog({ open: false, task: null })}
                onConfirm={handleConfirmDeactivate}
                title="Konfirmasi Nonaktifkan Kegiatan"
                description={`Apakah Anda yakin ingin menonaktifkan kegiatan "${
                    deactivateDialog.task?.name || ''
                }" (${deactivateDialog.task?.code || ''})? Kegiatan nonaktif tidak dapat dipilih pada penugasan baru.`}
                confirmText="Ya, Nonaktifkan"
                cancelText="Batal"
                danger={true}
                isLoading={deactivateMutation.isPending}
            />
        </ContentContainer>
    );
};

export default TasksPage;
