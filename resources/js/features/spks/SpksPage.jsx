import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ContentContainer,
    PageHeader,
    DataTable,
    SpkStatusBadge,
    CustomSelect,
} from '../../components';
import { Button } from '@idds/react';
import {
    IconFilePlus,
    IconEye,
    IconEdit,
    IconBan,
    IconFileText,
} from '@tabler/icons-react';
import spkService from '../../services/spkService';
import SpkFormModal from './SpkFormModal';
import CancelSpkModal from './CancelSpkModal';
import { formatDate, formatDateRange, formatRupiah } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export const SpksPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { hasAnyRole } = useAuth();

    // Filters state
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [perPage, setPerPage] = useState(15);

    // Modals state
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [selectedSpk, setSelectedSpk] = useState(null);
    const [cancelModalState, setCancelModalState] = useState({
        open: false,
        spk: null,
    });

    // Query SPKs
    const {
        data: spkResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['spks', { page, search, selectedStatus, perPage }],
        queryFn: async () => {
            const res = await spkService.getSpks({
                page,
                per_page: perPage,
                search: search || undefined,
                status: selectedStatus || undefined,
            });
            return res;
        },
    });

    const spkList = Array.isArray(spkResponse?.data)
        ? spkResponse.data
        : (Array.isArray(spkResponse) ? spkResponse : []);
    const meta = spkResponse?.meta || {
        current_page: 1,
        last_page: 1,
        total: spkList.length,
        per_page: 15,
    };

    // Create / Update mutation
    const saveMutation = useMutation({
        mutationFn: async (formData) => {
            if (selectedSpk) {
                return await spkService.updateSpk(selectedSpk.id, formData);
            }
            return await spkService.createSpk(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spks'] });
            setFormModalOpen(false);
            setSelectedSpk(null);
        },
    });

    // Cancel mutation
    const cancelMutation = useMutation({
        mutationFn: async ({ id, reason }) => {
            return await spkService.cancelSpk(id, reason);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spks'] });
            setCancelModalState({ open: false, spk: null });
        },
    });

    const handleCreateNew = () => {
        setSelectedSpk(null);
        setFormModalOpen(true);
    };

    const handleEdit = (spk) => {
        setSelectedSpk(spk);
        setFormModalOpen(true);
    };

    const handleOpenCancel = (spk) => {
        setCancelModalState({ open: true, spk });
    };

    const handleSearchChange = (val) => {
        setSearch(val);
        setPage(1);
    };

    const handleStatusFilterChange = (val) => {
        setSelectedStatus(val);
        setPage(1);
    };

    const columns = [
        {
            key: 'spk_number',
            header: 'Nomor SPK',
            render: (row) => (
                <div>
                    <button
                        onClick={() => navigate(`/app/spks/${row.id}`)}
                        className="font-medium text-blue-700 hover:text-blue-900 hover:underline text-left"
                    >
                        {row.spk_number}
                    </button>
                    <div className="text-xs text-gray-500">
                        {row.occupation || 'Mitra Statistik'}
                    </div>
                </div>
            ),
        },
        {
            key: 'mitra',
            header: 'Mitra Statistik',
            render: (row) => (
                <div>
                    <div className="font-medium text-gray-900">
                        {row.mitra?.name || '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                        {row.mitra?.mitra_code} • {row.mitra?.district?.name || '-'}
                    </div>
                </div>
            ),
        },
        {
            key: 'contract_date',
            header: 'Tanggal SPK',
            render: (row) => (
                <span className="text-gray-700 text-sm">
                    {formatDate(row.contract_date)}
                </span>
            ),
        },
        {
            key: 'period',
            header: 'Periode Kontrak',
            render: (row) => (
                <span className="text-xs text-gray-700">
                    {formatDateRange(row.period_start, row.period_end)}
                </span>
            ),
        },
        {
            key: 'tasks_count',
            header: 'Jml Tugas',
            align: 'center',
            render: (row) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                    {row.tasks_count || 0}
                </span>
            ),
        },
        {
            key: 'total_value',
            header: 'Total Nilai Kontrak',
            align: 'right',
            render: (row) => (
                <span className="font-semibold text-gray-900 text-sm">
                    {formatRupiah(row.total_value)}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            align: 'center',
            render: (row) => <SpkStatusBadge status={row.status} />,
        },
        {
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (row) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={() => navigate(`/app/spks/${row.id}`)}
                        className="p-1.5 text-gray-600 hover:text-blue-700 hover:bg-gray-100 rounded transition-colors"
                        title="Lihat Detail SPK"
                    >
                        <IconEye size={18} />
                    </button>
                    {hasAnyRole(['super_admin', 'admin', 'operator_tim']) &&
                        ['draft', 'active'].includes(row.status?.value) && (
                            <button
                                onClick={() => handleEdit(row)}
                                className="p-1.5 text-gray-600 hover:text-blue-700 hover:bg-gray-100 rounded transition-colors"
                                title="Edit Dokumen SPK"
                            >
                                <IconEdit size={18} />
                            </button>
                        )}
                    {hasAnyRole(['super_admin', 'admin', 'pimpinan']) &&
                        ['draft', 'active'].includes(row.status?.value) && (
                            <button
                                onClick={() => handleOpenCancel(row)}
                                className="p-1.5 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                title="Batalkan SPK"
                            >
                                <IconBan size={18} />
                            </button>
                        )}
                </div>
            ),
        },
    ];

    return (
        <ContentContainer>
            <PageHeader
                title="Surat Perjanjian Kerja (SPK)"
                subtitle="Administrasi perjanjian kerja mitra statistik, penetapan masa kontrak, dan agregasi beban kegiatan"
                actions={
                    hasAnyRole(['super_admin', 'admin', 'operator_tim']) && (
                        <Button
                            hierarchy="primary"
                            size="md"
                            prefixIcon={<IconFilePlus size={16} />}
                            onClick={handleCreateNew}
                        >
                            Buat SPK Baru
                        </Button>
                    )
                }
            />

            {/* Filters Toolbar */}
            <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
                <div className="w-full md:w-80">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Cari nomor SPK, mitra, jabatan..."
                        className="w-full h-10 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="w-48">
                        <CustomSelect
                            value={selectedStatus}
                            onChange={(val) => handleStatusFilterChange(val)}
                            placeholder="Semua Status"
                            options={[
                                { value: '', label: 'Semua Status' },
                                { value: 'draft', label: 'Draf' },
                                { value: 'active', label: 'Aktif Berjalan' },
                                { value: 'completed', label: 'Selesai' },
                                { value: 'cancelled', label: 'Dibatalkan' },
                            ]}
                        />
                    </div>

                    <Button
                        hierarchy="secondary"
                        size="md"
                        onClick={() => {
                            setSearch('');
                            setSelectedStatus('');
                            setPage(1);
                        }}
                    >
                        Reset Filter
                    </Button>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={spkList}
                isLoading={isLoading}
                isError={isError}
                errorMessage={error?.response?.data?.message || 'Gagal memuat daftar SPK'}
                onRetry={refetch}
                pagination={{
                    currentPage: meta.current_page,
                    lastPage: meta.last_page,
                    total: meta.total,
                    perPage: meta.per_page,
                    onPageChange: (p) => setPage(p),
                }}
                emptyState={{
                    title: 'Belum Ada Surat Perjanjian Kerja',
                    description: 'Silakan buat SPK baru untuk mengikat penugasan kegiatan mitra statistik.',
                    action: hasAnyRole(['super_admin', 'admin', 'operator_tim']) && (
                        <Button
                            hierarchy="primary"
                            size="md"
                            prefixIcon={<IconFilePlus size={16} />}
                            onClick={handleCreateNew}
                        >
                            Buat SPK Baru
                        </Button>
                    ),
                }}
            />

            {/* Create/Edit Modal */}
            <SpkFormModal
                isOpen={formModalOpen}
                onClose={() => {
                    setFormModalOpen(false);
                    setSelectedSpk(null);
                }}
                spk={selectedSpk}
                onSubmit={saveMutation.mutateAsync}
                isLoading={saveMutation.isPending}
            />

            {/* Cancel Modal */}
            <CancelSpkModal
                isOpen={cancelModalState.open}
                onClose={() => setCancelModalState({ open: false, spk: null })}
                spk={cancelModalState.spk}
                onConfirm={(reason) =>
                    cancelMutation.mutateAsync({
                        id: cancelModalState.spk?.id,
                        reason,
                    })
                }
                isLoading={cancelMutation.isPending}
            />
        </ContentContainer>
    );
};

export default SpksPage;
