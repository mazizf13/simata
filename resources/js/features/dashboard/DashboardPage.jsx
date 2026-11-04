import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { getRoleLabel, formatRupiah } from '../../utils/formatters';
import {
    ContentContainer,
    PageHeader,
    CardContainer,
    LoadingState,
    ErrorState,
    CustomSelect,
} from '../../components';
import {
    IconUsers,
    IconClipboardList,
    IconCash,
    IconAlertTriangle,
    IconCircleCheck,
    IconBriefcase,
    IconHistory,
    IconBuildingBank,
    IconArrowRight,
    IconCalendar,
} from '@tabler/icons-react';
import reportService from '../../services/reportService';
import masterDataService from '../../services/masterDataService';

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const today = new Date();
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedTeamId, setSelectedTeamId] = useState('');

    // Load active teams for filter
    const { data: teamsData } = useQuery({
        queryKey: ['teams', 'active'],
        queryFn: async () => (await masterDataService.getActiveTeams()).data || [],
    });
    const teams = teamsData || [];

    // Load dashboard stats
    const {
        data: dashboardResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['dashboard', selectedYear, selectedMonth, selectedTeamId],
        queryFn: async () => {
            const res = await reportService.getDashboard({
                year: selectedYear,
                month: selectedMonth,
                team_id: selectedTeamId || undefined,
            });
            return res.data || res;
        },
    });

    const stats = dashboardResponse?.data || dashboardResponse;
    const metrics = stats?.metrics || {
        total_active_mitras: 0,
        total_assignments: 0,
        total_honor_value: 0,
        active_assignments_count: 0,
        mitras_reached_task_limit: 0,
        mitras_reached_honor_limit: 0,
    };

    const teamDistribution = stats?.team_distribution || [];
    const mitrasNearLimit = stats?.mitras_near_limit || [];
    const recentActivities = stats?.recent_activities || [];

    return (
        <ContentContainer>
            {/* Page Header */}
            <div className="mb-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Dashboard Operasional & Pemantauan
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Monitoring beban kerja mitra, realisasi anggaran honor, dan pengendalian batas kuota BPS Kabupaten Mojokerto
                    </p>
                </div>

                {/* Filter Toolbar - strictly inline, compact, and non-wrapping */}
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-xs shrink-0 self-start xl:self-auto">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium px-1.5 shrink-0">
                        <IconCalendar size={15} />
                        <span>Periode:</span>
                    </div>

                    <div className="w-28 shrink-0">
                        <CustomSelect
                            size="sm"
                            value={String(selectedMonth)}
                            onChange={(val) => setSelectedMonth(Number(val))}
                            options={MONTH_NAMES.map((name, idx) => ({
                                value: String(idx + 1),
                                label: name,
                            }))}
                            placeholder="Pilih Bulan"
                        />
                    </div>

                    <div className="w-20 shrink-0">
                        <CustomSelect
                            size="sm"
                            value={String(selectedYear)}
                            onChange={(val) => setSelectedYear(Number(val))}
                            options={[
                                { value: '2025', label: '2025' },
                                { value: '2026', label: '2026' },
                                { value: '2027', label: '2027' },
                            ]}
                            placeholder="Tahun"
                        />
                    </div>

                    <div className="w-44 shrink-0">
                        <CustomSelect
                            size="sm"
                            value={selectedTeamId}
                            onChange={(val) => setSelectedTeamId(val)}
                            options={[
                                { value: '', label: 'Semua Tim Kerja' },
                                ...teams.map((t) => ({ value: String(t.id), label: t.name })),
                            ]}
                            placeholder="Semua Tim Kerja"
                        />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <LoadingState message="Memuat metrik dan statistik operasional aktual..." />
            ) : isError ? (
                <ErrorState
                    title="Gagal Memuat Dashboard"
                    message={error?.response?.data?.message || 'Terjadi gangguan saat mengambil data dashboard.'}
                    onRetry={refetch}
                />
            ) : (
                <div className="space-y-6">
                    {/* 6 Metric KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                        {/* 1. Mitra Aktif */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                            <div className="flex items-center justify-between text-gray-500 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider">Mitra Aktif</span>
                                <div className="p-1.5 bg-blue-50 text-blue-700 rounded">
                                    <IconUsers size={16} />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {metrics.total_active_mitras}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                                Terdaftar di master data
                            </div>
                        </div>

                        {/* 2. Total Penugasan */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                            <div className="flex items-center justify-between text-gray-500 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider">Total Tugas</span>
                                <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded">
                                    <IconClipboardList size={16} />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {metrics.total_assignments}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                                Periode {MONTH_NAMES[selectedMonth - 1]}
                            </div>
                        </div>

                        {/* 3. Total Nilai Honor */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                            <div className="flex items-center justify-between text-gray-500 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider">Total Honor</span>
                                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded">
                                    <IconCash size={16} />
                                </div>
                            </div>
                            <div className="text-xl font-bold text-emerald-700 font-mono truncate">
                                {formatRupiah(metrics.total_honor_value)}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                                Beban bulan berjalan
                            </div>
                        </div>

                        {/* 4. Tugas Aktif */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                            <div className="flex items-center justify-between text-gray-500 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider">Tugas Aktif</span>
                                <div className="p-1.5 bg-teal-50 text-teal-700 rounded">
                                    <IconCircleCheck size={16} />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-teal-700">
                                {metrics.active_assignments_count}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                                Sedang berlangsung
                            </div>
                        </div>

                        {/* 5. Batas Tugas Tercapai */}
                        <div className={`p-4 rounded-lg border shadow-xs ${
                            metrics.mitras_reached_task_limit > 0
                                ? 'bg-amber-50/50 border-amber-200'
                                : 'bg-white border-gray-200'
                        }`}>
                            <div className="flex items-center justify-between text-gray-500 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider">Batas Tugas</span>
                                <div className={`p-1.5 rounded ${
                                    metrics.mitras_reached_task_limit > 0
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    <IconAlertTriangle size={16} />
                                </div>
                            </div>
                            <div className={`text-2xl font-bold ${
                                metrics.mitras_reached_task_limit > 0 ? 'text-amber-800' : 'text-gray-900'
                            }`}>
                                {metrics.mitras_reached_task_limit} Mitra
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                                Mencapai 10 penugasan
                            </div>
                        </div>

                        {/* 6. Batas Honor Tercapai */}
                        <div className={`p-4 rounded-lg border shadow-xs ${
                            metrics.mitras_reached_honor_limit > 0
                                ? 'bg-red-50/50 border-red-200'
                                : 'bg-white border-gray-200'
                        }`}>
                            <div className="flex items-center justify-between text-gray-500 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider">Batas Honor</span>
                                <div className={`p-1.5 rounded ${
                                    metrics.mitras_reached_honor_limit > 0
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    <IconAlertTriangle size={16} />
                                </div>
                            </div>
                            <div className={`text-2xl font-bold ${
                                metrics.mitras_reached_honor_limit > 0 ? 'text-red-700' : 'text-gray-900'
                            }`}>
                                {metrics.mitras_reached_honor_limit} Mitra
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                                Mencapai Rp 4.000.000
                            </div>
                        </div>
                    </div>

                    {/* Main Content Layout: Left Table & Right Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left 2 Columns: Near Limit Table + Team Distribution Table */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Table: Mitra Mendekati / Mencapai Batas */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                                <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                        <h2 className="text-sm font-bold text-gray-900">
                                            Mitra Mendekati / Mencapai Batas Kuota Bulanan
                                        </h2>
                                    </div>
                                    <Link
                                        to="/app/reports"
                                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1"
                                    >
                                        Buka Rekap Lengkap
                                        <IconArrowRight size={14} />
                                    </Link>
                                </div>

                                {mitrasNearLimit.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-gray-500">
                                        Tidak ada mitra yang mendekati batas (≥ 8 tugas atau ≥ Rp 3.200.000) pada periode ini.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                                <tr>
                                                    <th className="px-4 py-2.5 text-left">Nama Mitra</th>
                                                    <th className="px-4 py-2.5 text-left">Kecamatan</th>
                                                    <th className="px-4 py-2.5 text-center">Beban Tugas</th>
                                                    <th className="px-4 py-2.5 text-right">Total Honor</th>
                                                    <th className="px-4 py-2.5 text-center">Status Batas</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {mitrasNearLimit.map((item) => (
                                                    <tr
                                                        key={item.mitra_id}
                                                        className="hover:bg-gray-50/70 cursor-pointer transition-colors"
                                                        onClick={() => navigate(`/app/mitras/${item.mitra_id}`)}
                                                    >
                                                        <td className="px-4 py-2.5">
                                                            <div className="font-semibold text-blue-700 hover:underline">
                                                                {item.name}
                                                            </div>
                                                            <div className="text-[11px] text-gray-400">
                                                                {item.mitra_code}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-gray-600">
                                                            {item.district}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-center font-mono">
                                                            <span className="font-bold text-gray-900">{item.total_tasks}</span> / 10
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-gray-900">
                                                            {formatRupiah(item.total_honor)}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-center">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                                                                item.status_variant === 'danger'
                                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                                            }`}>
                                                                {item.status_label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Table: Distribusi Penugasan per Tim */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                                <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                                        <h2 className="text-sm font-bold text-gray-900">
                                            Distribusi Beban Kerja per Tim BPS
                                        </h2>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        Periode: {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                                        <thead className="bg-gray-50 text-gray-600 font-medium">
                                            <tr>
                                                <th className="px-4 py-2.5 text-left">Tim Kerja</th>
                                                <th className="px-4 py-2.5 text-center">Jml Kegiatan</th>
                                                <th className="px-4 py-2.5 text-center">Mitra Bertugas</th>
                                                <th className="px-4 py-2.5 text-center">Total Penugasan</th>
                                                <th className="px-4 py-2.5 text-right">Total Honor Terhitung</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {teamDistribution.map((t) => (
                                                <tr key={t.team_id} className="hover:bg-gray-50/70">
                                                    <td className="px-4 py-2.5">
                                                        <div className="font-semibold text-gray-900">
                                                            {t.team_name}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400">
                                                            Kode: {t.team_code}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center font-mono">
                                                        {t.tasks_count}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center font-mono">
                                                        {t.mitras_count} orang
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center font-mono font-medium">
                                                        {t.assignments_count}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right font-mono font-bold text-gray-900">
                                                        {formatRupiah(t.total_honor)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: User Session & Recent Audit Activities */}
                        <div className="space-y-6">
                            {/* Session Information */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                                    Sesi Operator BPS
                                </div>
                                <div className="font-bold text-gray-900 text-sm">
                                    {user?.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {user?.email}
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Peran Sistem:</span>
                                    <span className="font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                        {getRoleLabel(user?.roles?.[0]?.name)}
                                    </span>
                                </div>
                            </div>

                            {/* Recent Activity Logs */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                                        <IconHistory size={16} />
                                        <span>Aktivitas Sistem Terbaru</span>
                                    </div>
                                </div>

                                {recentActivities.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-gray-400">
                                        Belum ada aktivitas tercatat.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 text-xs">
                                        {recentActivities.map((act) => (
                                            <div key={act.id} className="p-3 hover:bg-gray-50/60">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-gray-900">
                                                        {act.user_name}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(act.created_at).toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="text-gray-600 mt-0.5 font-mono text-[11px]">
                                                    {act.action} • {act.entity_type} #{act.entity_id}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ContentContainer>
    );
};

export default DashboardPage;
