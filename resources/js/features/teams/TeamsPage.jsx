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
    IconUsersGroup,
    IconEdit,
    IconTrash,
    IconUserCheck,
} from '@tabler/icons-react';
import masterDataService from '../../services/masterDataService';
import TeamFormModal from './TeamFormModal';

export const TeamsPage = () => {
    const queryClient = useQueryClient();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [deactivateDialog, setDeactivateDialog] = useState({
        open: false,
        team: null,
    });

    const {
        data: teamsResponse,
        isLoading,
    } = useQuery({
        queryKey: ['teams', 'all'],
        queryFn: async () => {
            return await masterDataService.getTeams();
        },
    });

    const teamsList = teamsResponse?.data || [];

    const createMutation = useMutation({
        mutationFn: (data) => masterDataService.createTeam(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setModalOpen(false);
            setSelectedTeam(null);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => masterDataService.updateTeam(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setModalOpen(false);
            setSelectedTeam(null);
        },
    });

    const deactivateMutation = useMutation({
        mutationFn: (id) => masterDataService.deactivateTeam(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setDeactivateDialog({ open: false, team: null });
        },
    });

    const handleOpenCreate = () => {
        setSelectedTeam(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (team) => {
        setSelectedTeam(team);
        setModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        if (selectedTeam) {
            return await updateMutation.mutateAsync({
                id: selectedTeam.id,
                data: formData,
            });
        } else {
            return await createMutation.mutateAsync(formData);
        }
    };

    const handleConfirmDeactivate = async () => {
        if (!deactivateDialog.team) return;
        await deactivateMutation.mutateAsync(deactivateDialog.team.id);
    };

    const columns = [
        {
            key: 'code',
            header: 'Kode Tim',
            render: (row) => (
                <div className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded border border-blue-200 inline-block">
                    {row.code}
                </div>
            ),
        },
        {
            key: 'name',
            header: 'Nama Tim Kerja',
            render: (row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.name}</div>
                    {row.description && (
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {row.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'members',
            header: 'Pengguna / Operator Tim',
            render: (row) => {
                const users = row.users || [];
                if (users.length === 0) {
                    return <span className="text-xs text-gray-400 italic">Belum ada anggota</span>;
                }
                return (
                    <div className="flex flex-wrap gap-1">
                        {users.map((u) => (
                            <span
                                key={u.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800 border border-gray-200"
                            >
                                <IconUserCheck size={12} className="text-blue-600" />
                                {u.name}
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            key: 'tasks_count',
            header: 'Jumlah Kegiatan',
            render: (row) => (
                <span className="text-xs font-medium text-gray-700">
                    {row.tasks_count ?? 0} Kegiatan
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
                        title="Ubah Tim Kerja"
                    >
                        <IconEdit size={16} />
                    </button>
                    {row.is_active && (
                        <button
                            type="button"
                            onClick={() => setDeactivateDialog({ open: true, team: row })}
                            className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Nonaktifkan Tim Kerja"
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
                title="Master Tim Kerja BPS"
                subtitle="Pengelompokan bidang tugas teknis, operator survei, dan struktur tanggung jawab organisasi BPS Kabupaten Mojokerto"
                actions={
                    <Button
                        hierarchy="primary"
                        size="md"
                        prefixIcon={<IconUsersGroup size={16} />}
                        onClick={handleOpenCreate}
                    >
                        Tambah Tim
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={teamsList}
                isLoading={isLoading}
                emptyTitle="Belum Ada Tim Kerja"
                emptyDescription="Klik 'Tambah Tim' untuk mendaftarkan unit kerja fungsional."
            />

            <TeamFormModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedTeam(null);
                }}
                team={selectedTeam}
                onSubmit={handleFormSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            <ConfirmDialog
                open={deactivateDialog.open}
                onClose={() => setDeactivateDialog({ open: false, team: null })}
                onConfirm={handleConfirmDeactivate}
                title="Konfirmasi Nonaktifkan Tim Kerja"
                description={`Apakah Anda yakin ingin menonaktifkan tim "${
                    deactivateDialog.team?.name || ''
                }" (${deactivateDialog.team?.code || ''})? Tim yang nonaktif tidak dapat dipilih saat pembuatan kegiatan survei baru.`}
                confirmText="Ya, Nonaktifkan"
                cancelText="Batal"
                danger={true}
                isLoading={deactivateMutation.isPending}
            />
        </ContentContainer>
    );
};

export default TeamsPage;
