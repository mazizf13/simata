import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ContentContainer,
    PageHeader,
    DataTable,
    LoadingState,
    ErrorState,
    CustomSelect,
} from '../../components';
import { Button } from '@idds/react';
import {
    IconDownload,
    IconUsers,
    IconBriefcase,
    IconFilter,
    IconSearch,
    IconListDetails,
} from '@tabler/icons-react';
import reportService from '../../services/reportService';
import masterDataService from '../../services/masterDataService';
import TeamDrilldownModal from './TeamDrilldownModal';
import { formatRupiah } from '../../utils/formatters';

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const ReportsPage = () => {
    const navigate = useNavigate();

    // Tab state: 'mitras' or 'teams'
    const [activeTab, setActiveTab] = useState('mitras');

    // Period state
    const today = new Date();
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

    // Mitra Filters state
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [selectedLimitStatus, setSelectedLimitStatus] = useState('');
    const [perPage, setPerPage] = useState(15);

    // Drilldown modal state
    const [drilldownModal, setDrilldownModal] = useState({
        open: false,
        team: null,
    });

    // Master data: Districts and Teams
    const { data: districtsData } = useQuery({
        queryKey: ['districts', 'active'],
        queryFn: async () => (await masterDataService.getActiveDistricts()).data || [],
    });
    const districts = districtsData || [];

    const { data: teamsData } = useQuery({
        queryKey: ['teams', 'active'],
        queryFn: async () => (await masterDataService.getActiveTeams()).data || [],
    });
    const teams = teamsData || [];

    // Query 1: Monthly Mitra Recap
    const {
        data: mitraRecapResponse,
        isLoading: mitraLoading,
        isError: mitraIsError,
        error: mitraError,
        refetch: refetchMitra,
    } = useQuery({
        queryKey: [
            'recap-mitras',
            selectedYear,
            selectedMonth,
            page,
            search,
            selectedDistrictId,
            selectedTeamId,
            selectedLimitStatus,
            perPage,
        ],
        queryFn: async () => {
            const res = await reportService.getMonthlyMitraRecap({
                year: selectedYear,
                month: selectedMonth,
                page,
                per_page: perPage,
                search: search || undefined,
                district_id: selectedDistrictId || undefined,
                team_id: selectedTeamId || undefined,
                limit_status: selectedLimitStatus || undefined,
            });
            return res;
        },
        enabled: activeTab === 'mitras',
    });

    const mitraList = Array.isArray(mitraRecapResponse?.data)
        ? mitraRecapResponse.data
        : (Array.isArray(mitraRecapResponse) ? mitraRecapResponse : []);
    const meta = mitraRecapResponse?.meta || {
        current_page: 1,
        last_page: 1,
        total: mitraList.length,
        per_page: 15,
    };

    // Query 2: Team Recap
    const {
        data: teamRecapResponse,
        isLoading: teamLoading,
        isError: teamIsError,
        error: teamError,
        refetch: refetchTeam,
    } = useQuery({
        queryKey: ['recap-teams', selectedYear, selectedMonth],
        queryFn: async () => {
            const res = await reportService.getTeamRecap({
                year: selectedYear,
                month: selectedMonth,
            });
            return res;
        },
        enabled: activeTab === 'teams',
    });

    const teamList = teamRecapResponse?.data?.teams || teamRecapResponse?.teams || (Array.isArray(teamRecapResponse?.data) ? teamRecapResponse.data : []);

    // Export Handlers
    const handleExportMitra = () => {
        const url = reportService.getExportMonthlyUrl({
            year: selectedYear,
            month: selectedMonth,
            district_id: selectedDistrictId || undefined,
            team_id: selectedTeamId || undefined,
            search: search || undefined,
        });
        window.open(url, '_blank');
    };

    const handleExportTeam = () => {
        const url = reportService.getExportTeamsUrl({
            year: selectedYear,
            month: selectedMonth,
        });
        window.open(url, '_blank');
    };

    // Mitra Columns
    const mitraColumns = [
        {
            key: 'mitra',
            header: 'Mitra Statistik',
            render: (row) => (
                <div>
                    <button
                        onClick={() => navigate(`/app/mitras/${row.id}`)}
                        className="font-medium text-blue-700 hover:text-blue-900 hover:underline text-left"
                    >
                        {row.name}
                    </button>
                    <div className="text-xs text-gray-400">
                        {row.mitra_code}
                    </div>
                </div>
            ),
        },
        {
            key: 'district',
            header: 'Kecamatan',
            render: (row) => (
                <span className="text-gray-700 text-sm">
                    {row.district_name || '-'}
                </span>
            ),
        },
        {
            key: 'phone',
            header: 'Nomor HP',
            render: (row) => (
                <span className="text-xs font-mono text-gray-600">
                    {row.phone || '-'}
                </span>
            ),
        },
        {
            key: 'total_tasks',
            header: 'Beban Tugas',
            align: 'center',
            render: (row) => (
                <div className="inline-flex items-center gap-1 font-mono text-sm">
                    <span className={`font-bold ${row.total_tasks >= 10 ? 'text-red-700' : 'text-gray-900'}`}>
                        {row.total_tasks}
                    </span>
                    <span className="text-gray-400">/ 10</span>
                </div>
            ),
        },
        {
            key: 'total_honor',
            header: 'Total Honor',
            align: 'right',
            render: (row) => (
                <span className={`font-mono text-sm font-semibold ${row.total_honor >= 4000000 ? 'text-red-700 font-bold' : 'text-gray-900'}`}>
                    {row.formatted_total_honor}
                </span>
            ),
        },
        {
            key: 'remaining_tasks',
            header: 'Sisa Kuota Tugas',
            align: 'center',
            render: (row) => (
                <span className="text-xs font-mono text-gray-600">
                    {row.remaining_tasks} tugas
                </span>
            ),
        },
        {
            key: 'remaining_honor',
            header: 'Sisa Kuota Honor',
            align: 'right',
            render: (row) => (
                <span className="text-xs font-mono text-emerald-700 font-medium">
                    {row.formatted_remaining_honor}
                </span>
            ),
        },
        {
            key: 'limit_status',
            header: 'Status Batas',
            align: 'center',
            render: (row) => {
                const variants = {
                    danger: 'bg-red-50 text-red-700 border-red-200',
                    warning: 'bg-amber-50 text-amber-800 border-amber-200',
                    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                };
                return (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variants[row.badge_variant] || variants.success}`}>
                        {row.limit_status_label}
                    </span>
                );
            },
        },
    ];

    return (
        <ContentContainer>
            {/* Page Header */}
            <PageHeader
                title="Rekapitulasi & Monitoring"
                subtitle="Pemantauan beban tugas dan realisasi batas kuota honor bulanan mitra statistik BPS Kabupaten Mojokerto"
                actions={
                    <Button
                        hierarchy="secondary"
                        size="md"
                        prefixIcon={<IconDownload size={16} />}
                        onClick={activeTab === 'mitras' ? handleExportMitra : handleExportTeam}
                    >
                        {activeTab === 'mitras' ? 'Export Rekap Mitra (CSV)' : 'Export Rekap Tim (CSV)'}
                    </Button>
                }
            />

            {/* Navigation Sub-Tabs */}
            <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg px-2 pt-2">
                <button
                    onClick={() => setActiveTab('mitras')}
                    className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                        activeTab === 'mitras'
                            ? 'border-blue-700 text-blue-700 bg-blue-50/40 rounded-t'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <IconUsers size={18} />
                    Rekapitulasi per Mitra
                </button>
                <button
                    onClick={() => setActiveTab('teams')}
                    className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                        activeTab === 'teams'
                            ? 'border-blue-700 text-blue-700 bg-blue-50/40 rounded-t'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <IconBriefcase size={18} />
                    Rekapitulasi per Tim Kerja
                </button>
            </div>

            {/* Tab 1: Rekap per Mitra */}
            {activeTab === 'mitras' && (
                <div className="space-y-4">
                    {/* Filters Toolbar */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Cari Nama / Kode Mitra
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Ketik nama atau kode mitra..."
                                    className="w-full h-9 px-3 text-xs bg-gray-50 border border-gray-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Month */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Bulan Pembebanan
                                </label>
                                <CustomSelect
                                    value={selectedMonth}
                                    onChange={(val) => {
                                        setSelectedMonth(Number(val));
                                        setPage(1);
                                    }}
                                    options={MONTH_NAMES.map((name, idx) => ({
                                        value: idx + 1,
                                        label: name,
                                    }))}
                                />
                            </div>

                            {/* Year */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Tahun
                                </label>
                                <CustomSelect
                                    value={selectedYear}
                                    onChange={(val) => {
                                        setSelectedYear(Number(val));
                                        setPage(1);
                                    }}
                                    options={[
                                        { value: 2025, label: '2025' },
                                        { value: 2026, label: '2026' },
                                        { value: 2027, label: '2027' },
                                    ]}
                                />
                            </div>

                            {/* District */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Kecamatan
                                </label>
                                <CustomSelect
                                    value={selectedDistrictId}
                                    onChange={(val) => {
                                        setSelectedDistrictId(val);
                                        setPage(1);
                                    }}
                                    placeholder="Semua Kecamatan"
                                    options={[
                                        { value: '', label: 'Semua Kecamatan' },
                                        ...districts.map((d) => ({
                                            value: d.id,
                                            label: d.name,
                                            badge: d.code,
                                        })),
                                    ]}
                                />
                            </div>

                            {/* Status Limit */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Status Batas
                                </label>
                                <CustomSelect
                                    value={selectedLimitStatus}
                                    onChange={(val) => {
                                        setSelectedLimitStatus(val);
                                        setPage(1);
                                    }}
                                    placeholder="Semua Status"
                                    options={[
                                        { value: '', label: 'Semua Status' },
                                        { value: 'aman', label: 'Aman' },
                                        { value: 'near_limit', label: 'Mendekati Batas' },
                                        { value: 'limit_task', label: 'Batas Tugas Tercapai' },
                                        { value: 'limit_honor', label: 'Batas Honor Tercapai' },
                                        { value: 'limit_both', label: 'Batas Tugas & Honor Tercapai' },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                            <div>
                                Menampilkan rekapitulasi berdasarkan <strong>tanggal mulai penugasan</strong> bulan {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
                            </div>
                            <Button
                                hierarchy="secondary"
                                size="sm"
                                onClick={() => {
                                    setSearch('');
                                    setSelectedDistrictId('');
                                    setSelectedTeamId('');
                                    setSelectedLimitStatus('');
                                    setPage(1);
                                }}
                            >
                                Reset Filter
                            </Button>
                        </div>
                    </div>

                    {/* DataTable */}
                    <DataTable
                        columns={mitraColumns}
                        data={mitraList}
                        isLoading={mitraLoading}
                        isError={mitraIsError}
                        errorMessage={mitraError?.response?.data?.message || 'Gagal memuat rekapitulasi mitra'}
                        onRetry={refetchMitra}
                        pagination={{
                            currentPage: meta.current_page,
                            lastPage: meta.last_page,
                            total: meta.total,
                            perPage: meta.per_page,
                            onPageChange: (p) => setPage(p),
                        }}
                        emptyState={{
                            title: 'Tidak Ada Data Rekapitulasi Mitra',
                            description: 'Tidak ditemukan mitra yang sesuai dengan kriteria filter pada periode ini.',
                        }}
                    />
                </div>
            )}

            {/* Tab 2: Rekap per Tim */}
            {activeTab === 'teams' && (
                <div className="space-y-4">
                    {/* Period Toolbar */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs font-semibold text-gray-700">Pilih Periode Pembebanan:</span>
                            <div className="w-40">
                                <CustomSelect
                                    value={selectedMonth}
                                    onChange={(val) => setSelectedMonth(Number(val))}
                                    options={MONTH_NAMES.map((name, idx) => ({
                                        value: idx + 1,
                                        label: name,
                                    }))}
                                />
                            </div>

                            <div className="w-28">
                                <CustomSelect
                                    value={selectedYear}
                                    onChange={(val) => setSelectedYear(Number(val))}
                                    options={[
                                        { value: 2025, label: '2025' },
                                        { value: 2026, label: '2026' },
                                        { value: 2027, label: '2027' },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="text-xs text-gray-500">
                            Setiap penugasan dikelompokkan ke tim penanggung jawab kegiatan.
                        </div>
                    </div>

                    {teamLoading ? (
                        <LoadingState message="Memuat rekapitulasi tim kerja..." />
                    ) : teamIsError ? (
                        <ErrorState
                            title="Gagal Memuat Rekap Tim"
                            message={teamError?.response?.data?.message || 'Terjadi kesalahan sistem.'}
                            onRetry={refetchTeam}
                        />
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Kode & Nama Tim</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Deskripsi Fungsi</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-600">Jml Kegiatan</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-600">Mitra Bertugas</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-600">Total Penugasan</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600">Total Honor</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {teamList.map((t) => (
                                        <tr key={t.team_id} className="hover:bg-gray-50/70">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-gray-900">
                                                    {t.team_name}
                                                </div>
                                                <div className="text-xs text-gray-400 font-mono">
                                                    {t.team_code}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                                                {t.description || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono">
                                                {t.tasks_count}
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono">
                                                {t.mitras_count} orang
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono font-medium">
                                                {t.assignments_count}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                                                {t.formatted_total_honor}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    hierarchy="secondary"
                                                    size="sm"
                                                    prefixIcon={<IconListDetails size={14} />}
                                                    onClick={() => setDrilldownModal({ open: true, team: t })}
                                                >
                                                    Rincian Kegiatan
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Team Drilldown Modal */}
            <TeamDrilldownModal
                isOpen={drilldownModal.open}
                onClose={() => setDrilldownModal({ open: false, team: null })}
                team={drilldownModal.team}
                year={selectedYear}
                month={selectedMonth}
            />
        </ContentContainer>
    );
};

export default ReportsPage;
