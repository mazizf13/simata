import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Badge } from '@idds/react';
import {
    IconPlus,
    IconDownload,
    IconEye,
    IconCheck,
    IconFileCertificate,
    IconSearch,
    IconFilter,
} from '@tabler/icons-react';
import {
    PageHeader,
    DataTable,
    CardContainer,
    ContentContainer,
    LoadingState,
    ErrorState,
} from '../../components';
import { bastService } from '../../services/bastService';
import { useAuth } from '../../hooks/useAuth';
import { BastFormModal } from './BastFormModal';

export const BastsPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { hasAnyRole } = useAuth();

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    // Fetch BASTs list
    const {
        data: bastsData,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['basts', { search, status: statusFilter, page }],
        queryFn: async () => {
            const res = await bastService.getBasts({
                search: search.trim() || undefined,
                status: statusFilter || undefined,
                page,
                per_page: 15,
            });
            return res;
        },
    });

    const basts = bastsData?.data || [];
    const meta = bastsData?.meta || { current_page: 1, last_page: 1, total: 0 };

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data) => await bastService.createBast(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['basts'] });
            setCreateModalOpen(false);
            const newBastId = res.data?.id || res.id;
            if (newBastId) {
                navigate(`/app/basts/${newBastId}`);
            }
        },
    });

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: async (id) => await bastService.approveBast(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['basts'] });
        },
    });

    // Handle Download
    const handleDownload = async (bast) => {
        try {
            setDownloadingId(bast.id);
            const cleanNum = bast.bast_number ? bast.bast_number.replace(/[\/\\]/g, '-') : bast.id;
            const cleanMitra = bast.spk?.mitra?.name ? bast.spk.mitra.name.replace(/\s+/g, '_') : 'Mitra';
            const defaultFilename = `BAST_${cleanNum}_${cleanMitra}.docx`;
            await bastService.downloadDocument(bast.id, defaultFilename);
        } catch (err) {
            console.error('Gagal mengunduh dokumen BAST:', err);
            alert(err.message || 'Terjadi kesalahan saat mengunduh dokumen BAST.');
        } finally {
            setDownloadingId(null);
        }
    };

    const columns = useMemo(
        () => [
            {
                key: 'bast_number',
                header: 'Nomor BAST & Tanggal',
                render: (row) => (
                    <div>
                        <span className="font-semibold text-blue-900 block font-mono text-sm">
                            {row.bast_number}
                        </span>
                        <span className="text-xs text-gray-500 block mt-0.5">
                            Tanggal: {row.formatted_bast_date || row.bast_date}
                        </span>
                    </div>
                ),
            },
            {
                key: 'spk',
                header: 'Rujukan SPK',
                render: (row) => (
                    <div>
                        <span className="font-medium text-gray-800 block text-xs font-mono">
                            {row.spk?.spk_number || '-'}
                        </span>
                        <span className="text-xs text-gray-500 block mt-0.5">
                            Periode: {row.spk?.period_start} s.d. {row.spk?.period_end}
                        </span>
                    </div>
                ),
            },
            {
                key: 'mitra',
                header: 'Mitra Statistik',
                render: (row) => (
                    <div>
                        <span className="font-medium text-gray-900 block text-sm">
                            {row.spk?.mitra?.name || '-'}
                        </span>
                        <span className="text-xs text-gray-500 block">
                            Kecamatan {row.spk?.mitra?.district?.name || '-'}
                        </span>
                    </div>
                ),
            },
            {
                key: 'volume',
                header: 'Target Tugas',
                render: (row) => {
                    const assignments = row.spk?.task_assignments || [];
                    return (
                        <div className="text-xs text-gray-700">
                            <span className="font-semibold">{assignments.length} Kegiatan</span>
                            {assignments.length > 0 && (
                                <span className="block text-gray-500 mt-0.5">
                                    {assignments[0].task_name_snapshot || assignments[0].task?.name || ''}
                                    {assignments.length > 1 && ` (+${assignments.length - 1} lainnya)`}
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                key: 'status',
                header: 'Status',
                render: (row) => (
                    <Badge variant={row.status?.variant || 'neutral'}>
                        {row.status?.label || row.status?.value}
                    </Badge>
                ),
            },
            {
                key: 'actions',
                header: 'Aksi',
                align: 'right',
                render: (row) => (
                    <div className="flex items-center justify-end gap-1.5">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/app/basts/${row.id}`)}
                            title="Lihat Detail BAST"
                        >
                            <IconEye size={15} />
                        </Button>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDownload(row)}
                            disabled={downloadingId === row.id}
                            title="Unduh Dokumen BAST (.docx)"
                        >
                            <IconDownload size={15} className={downloadingId === row.id ? 'animate-bounce text-blue-600' : ''} />
                        </Button>

                        {row.status?.value !== 'approved' && hasAnyRole(['super_admin', 'admin', 'pimpinan']) && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                    if (confirm(`Sahkan dan tandatangani BAST ${row.bast_number}?`)) {
                                        approveMutation.mutate(row.id);
                                    }
                                }}
                                disabled={approveMutation.isPending}
                                title="Sahkan BAST (Tandai Diterima)"
                            >
                                <IconCheck size={15} />
                            </Button>
                        )}
                    </div>
                ),
            },
        ],
        [navigate, downloadingId, hasAnyRole, approveMutation]
    );

    if (isLoading && !bastsData) {
        return (
            <ContentContainer>
                <LoadingState message="Memuat daftar Berita Acara Serah Terima (BAST)..." />
            </ContentContainer>
        );
    }

    if (isError) {
        return (
            <ContentContainer>
                <ErrorState
                    title="Gagal Memuat BAST"
                    message={error?.message || 'Terjadi kesalahan saat memuat data BAST.'}
                    onRetry={refetch}
                />
            </ContentContainer>
        );
    }

    return (
        <ContentContainer>
            <PageHeader
                title="Berita Acara Serah Terima (BAST)"
                subtitle="Administrasi penerimaan dan pengesahan hasil penugasan survei mitra BPS Kabupaten Mojokerto."
                actions={
                    hasAnyRole(['super_admin', 'admin', 'operator_tim']) && (
                        <Button
                            hierarchy="primary"
                            size="md"
                            prefixIcon={<IconPlus size={16} />}
                            onClick={() => setCreateModalOpen(true)}
                        >
                            Buat BAST Baru
                        </Button>
                    )
                }
            />

            {/* Filter Bar */}
            <CardContainer className="mb-6 p-4">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nomor BAST, nomor SPK, atau nama mitra..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">Semua Status</option>
                            <option value="draft">Draf</option>
                            <option value="submitted">Diserahkan Mitra</option>
                            <option value="approved">Diterima & Disahkan</option>
                        </select>
                    </div>
                </div>
            </CardContainer>

            {/* Datatable */}
            <CardContainer>
                <DataTable
                    columns={columns}
                    data={basts}
                    emptyMessage="Belum ada data Berita Acara Serah Terima (BAST)."
                    pagination={{
                        currentPage: meta.current_page,
                        totalPages: meta.last_page,
                        totalItems: meta.total,
                        onPageChange: (p) => setPage(p),
                    }}
                />
            </CardContainer>

            {/* Modal Buat BAST */}
            {createModalOpen && (
                <BastFormModal
                    isOpen={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    onSubmit={(data) => createMutation.mutateAsync(data)}
                    isLoading={createMutation.isPending}
                />
            )}
        </ContentContainer>
    );
};

export default BastsPage;
