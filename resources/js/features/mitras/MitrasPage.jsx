import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ContentContainer,
    PageHeader,
    TableToolbar,
    DataTable,
    StatusBadge,
    ConfirmDialog,
    CustomSelect,
} from '../../components';
import { Button } from '@idds/react';
import {
    IconUserPlus,
    IconEye,
    IconEdit,
    IconUserOff,
    IconFilter,
    IconUpload,
    IconDownload,
    IconFileSpreadsheet,
} from '@tabler/icons-react';
import masterDataService from '../../services/masterDataService';
import MitraFormModal from './MitraFormModal';
import MitraImportModal from './MitraImportModal';

export const MitrasPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Filters and pagination state
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [perPage, setPerPage] = useState(15);

    // Modal / Drawer state
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedMitra, setSelectedMitra] = useState(null);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [deactivateDialog, setDeactivateDialog] = useState({
        open: false,
        mitra: null,
    });

    // Fetch active districts for filter & form
    const { data: districtsData } = useQuery({
        queryKey: ['districts', 'active'],
        queryFn: async () => {
            const res = await masterDataService.getActiveDistricts();
            return res.data || [];
        },
    });
    const districts = districtsData || [];

    // Fetch mitras with pagination & filters
    const {
        data: mitrasResponse,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['mitras', { page, search, selectedDistrict, selectedStatus, perPage }],
        queryFn: async () => {
            const params = {
                page,
                per_page: perPage,
                search: search.trim() || undefined,
                district_id: selectedDistrict || undefined,
                status: selectedStatus || undefined,
            };
            return await masterDataService.getMitras(params);
        },
        placeholderData: (prev) => prev,
    });

    const mitrasList = mitrasResponse?.data || [];
    const meta = mitrasResponse?.meta || { current_page: 1, last_page: 1, total: 0 };

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data) => masterDataService.createMitra(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mitras'] });
            setDrawerOpen(false);
            setSelectedMitra(null);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => masterDataService.updateMitra(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mitras'] });
            setDrawerOpen(false);
            setSelectedMitra(null);
        },
    });

    const deactivateMutation = useMutation({
        mutationFn: (id) => masterDataService.deactivateMitra(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mitras'] });
            setDeactivateDialog({ open: false, mitra: null });
        },
    });

    const handleOpenCreate = () => {
        setSelectedMitra(null);
        setDrawerOpen(true);
    };

    const handleOpenEdit = (mitra) => {
        setSelectedMitra(mitra);
        setDrawerOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        if (selectedMitra) {
            return await updateMutation.mutateAsync({
                id: selectedMitra.id,
                data: formData,
            });
        } else {
            return await createMutation.mutateAsync(formData);
        }
    };

    const handleConfirmDeactivate = async () => {
        if (!deactivateDialog.mitra) return;
        await deactivateMutation.mutateAsync(deactivateDialog.mitra.id);
    };

    const handleExportExcel = async () => {
        try {
            setIsExporting(true);
            await masterDataService.exportMitras({
                search: search.trim() || undefined,
                district_id: selectedDistrict || undefined,
                status: selectedStatus || undefined,
            });
        } catch (err) {
            console.error('Gagal mengekspor data mitra:', err);
        } finally {
            setIsExporting(false);
        }
    };

    // Columns configuration
    const columns = [
        {
            key: 'mitra_code',
            header: 'Kode Mitra',
            render: (row) => (
                <div className="font-mono text-xs font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200 inline-block">
                    {row.mitra_code}
                </div>
            ),
        },
        {
            key: 'name',
            header: 'Nama Lengkap',
            render: (row) => (
                <div>
                    <div className="font-medium text-gray-900 hover:text-blue-700 cursor-pointer" onClick={() => navigate(`/app/mitras/${row.id}`)}>
                        {row.name}
                    </div>
                    {row.occupation && (
                        <div className="text-xs text-gray-500">{row.occupation}</div>
                    )}
                </div>
            ),
        },
        {
            key: 'district',
            header: 'Kecamatan (3516)',
            render: (row) => (
                <span className="text-gray-700">
                    {row.district ? `[${row.district.code}] ${row.district.name}` : '-'}
                </span>
            ),
        },
        {
            key: 'phone',
            header: 'No. Kontak',
            render: (row) => (
                <span className="text-gray-700 font-mono text-xs">{row.phone || '-'}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} />,
        },
        {
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (row) => (
                <div className="flex items-center justify-end gap-1.5">
                    <button
                        type="button"
                        onClick={() => navigate(`/app/mitras/${row.id}`)}
                        className="p-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="Lihat Detail Profil"
                    >
                        <IconEye size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleOpenEdit(row)}
                        className="p-1.5 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                        title="Ubah Data Mitra"
                    >
                        <IconEdit size={16} />
                    </button>
                    {row.status === 'active' && (
                        <button
                            type="button"
                            onClick={() => setDeactivateDialog({ open: true, mitra: row })}
                            className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Nonaktifkan Mitra"
                        >
                            <IconUserOff size={16} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <ContentContainer>
            <PageHeader
                title="Data Mitra Statistik"
                subtitle="Master data terpusat mitra survei dan sensus BPS Kabupaten Mojokerto (Kode Wilayah 3516)"
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            hierarchy="secondary"
                            size="md"
                            prefixIcon={<IconDownload size={16} />}
                            onClick={handleExportExcel}
                            disabled={isExporting}
                        >
                            {isExporting ? 'Mengekspor...' : 'Ekspor Excel'}
                        </Button>
                        <Button
                            hierarchy="secondary"
                            size="md"
                            prefixIcon={<IconUpload size={16} />}
                            onClick={() => setImportModalOpen(true)}
                        >
                            Impor Excel
                        </Button>
                        <Button
                            hierarchy="primary"
                            size="md"
                            prefixIcon={<IconUserPlus size={16} />}
                            onClick={handleOpenCreate}
                        >
                            Tambah Mitra
                        </Button>
                    </div>
                }
            />

            {/* Filters Toolbar */}
            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xs mb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                            Pencarian Mitra
                        </label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Cari berdasarkan nama, kode mitra, telepon, dll..."
                            className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                            Kecamatan (3516)
                        </label>
                        <CustomSelect
                            value={selectedDistrict}
                            onChange={(val) => {
                                setSelectedDistrict(val);
                                setPage(1);
                            }}
                            placeholder="Semua Kecamatan (18)"
                            options={[
                                { value: '', label: 'Semua Kecamatan (18)' },
                                ...districts.map((d) => ({
                                    value: d.id,
                                    label: `[${d.code}] ${d.name}`,
                                    badge: d.code,
                                })),
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                            Status Keaktifan
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
                                { value: 'active', label: 'Aktif' },
                                { value: 'inactive', label: 'Nonaktif' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Mitras Table */}
            <DataTable
                columns={columns}
                data={mitrasList}
                isLoading={isLoading}
                emptyTitle="Data Mitra Tidak Ditemukan"
                emptyDescription={
                    search || selectedDistrict || selectedStatus
                        ? 'Tidak ada data mitra yang sesuai dengan filter atau kata kunci yang dimasukkan.'
                        : 'Belum ada data mitra terdaftar. Klik "Tambah Mitra" untuk mulai mendata mitra statistik.'
                }
                pagination={{
                    currentPage: meta.current_page || 1,
                    totalPages: meta.last_page || 1,
                    totalItems: meta.total || 0,
                    perPage: perPage,
                    pageSizeOptions: [10, 15, 25, 50],
                    onPageChange: (newPage) => setPage(newPage),
                    onPageSizeChange: (newSize) => {
                        setPerPage(newSize);
                        setPage(1);
                    },
                }}
            />

            {/* Create / Edit Modal */}
            <MitraFormModal
                isOpen={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setSelectedMitra(null);
                }}
                mitra={selectedMitra}
                districts={districts}
                onSubmit={handleFormSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Import Excel Modal */}
            <MitraImportModal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['mitras'] });
                }}
            />

            {/* Deactivate Confirmation Dialog */}
            <ConfirmDialog
                open={deactivateDialog.open}
                onClose={() => setDeactivateDialog({ open: false, mitra: null })}
                onConfirm={handleConfirmDeactivate}
                title="Konfirmasi Nonaktifkan Mitra"
                description={`Apakah Anda yakin ingin menonaktifkan status mitra ${
                    deactivateDialog.mitra?.name || ''
                } (${deactivateDialog.mitra?.mitra_code || ''})? Mitra yang dinonaktifkan tidak akan dapat dipilih pada penugasan survei baru.`}
                confirmText="Ya, Nonaktifkan"
                cancelText="Batal"
                danger={true}
                isLoading={deactivateMutation.isPending}
            />
        </ContentContainer>
    );
};

export default MitrasPage;
