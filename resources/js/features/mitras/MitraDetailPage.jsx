import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ContentContainer,
    PageHeader,
    CardContainer,
    StatusBadge,
    LoadingState,
    ErrorState,
    EmptyState,
    AssignmentStatusBadge,
    SpkStatusBadge,
    CustomSelect,
} from '../../components';
import { Button } from '@idds/react';
import {
    IconArrowLeft,
    IconUser,
    IconCalendarTime,
    IconCash,
    IconFileText,
    IconMapPin,
    IconPhone,
    IconMail,
    IconBriefcase,
    IconCalendar,
    IconCheck,
    IconFilePlus,
    IconEye,
} from '@tabler/icons-react';
import masterDataService from '../../services/masterDataService';
import assignmentService from '../../services/assignmentService';
import spkService from '../../services/spkService';
import { formatDate, formatDateRange } from '../../utils/formatters';
import SpkFormModal from '../spks/SpkFormModal';

export const MitraDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');

    // Filter year and month for honor summary
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [spkModalOpen, setSpkModalOpen] = useState(false);

    // Fetch Mitra details
    const {
        data: mitraResponse,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['mitra', id],
        queryFn: async () => {
            return await masterDataService.getMitra(id);
        },
    });
    const mitra = mitraResponse?.data;

    // Fetch Mitra assignments history
    const {
        data: assignmentsResponse,
        isLoading: assignmentsLoading,
    } = useQuery({
        queryKey: ['mitra-assignments', id],
        queryFn: async () => {
            return await assignmentService.getAssignments({ mitra_id: id, per_page: 50 });
        },
        enabled: activeTab === 'assignments' || activeTab === 'honor',
    });
    const assignments = assignmentsResponse?.data || [];

    // Fetch Mitra Monthly Honor Summary
    const {
        data: honorSummaryResponse,
        isLoading: summaryLoading,
    } = useQuery({
        queryKey: ['mitra-honor-summary', id, selectedYear, selectedMonth],
        queryFn: async () => {
            return await assignmentService.getMitraHonorSummary(id, selectedYear, selectedMonth);
        },
        enabled: activeTab === 'honor',
    });
    const summary = honorSummaryResponse?.data;

    // Fetch 12-month breakdown
    const {
        data: breakdownResponse,
        isLoading: breakdownLoading,
    } = useQuery({
        queryKey: ['mitra-honor-breakdown', id, selectedYear],
        queryFn: async () => {
            return await assignmentService.getMitraHonorBreakdown(id, selectedYear);
        },
        enabled: activeTab === 'honor',
    });
    const breakdown = breakdownResponse?.data || [];

    // Fetch Mitra SPKs
    const {
        data: spksResponse,
        isLoading: spksLoading,
        refetch: refetchSpks,
    } = useQuery({
        queryKey: ['mitra-spks', id],
        queryFn: async () => {
            const res = await spkService.getMitraSpks(id);
            return res.data || res;
        },
        enabled: activeTab === 'spk',
    });
    const spks = Array.isArray(spksResponse?.data)
        ? spksResponse.data
        : (Array.isArray(spksResponse) ? spksResponse : []);

    if (isLoading) {
        return (
            <ContentContainer>
                <LoadingState message="Memuat detail profil mitra statistik..." />
            </ContentContainer>
        );
    }

    if (isError || !mitra) {
        return (
            <ContentContainer>
                <ErrorState
                    title="Gagal Memuat Data Mitra"
                    message="Data mitra statistik tidak ditemukan atau telah dihapus."
                    onRetry={refetch}
                />
            </ContentContainer>
        );
    }

    const tabs = [
        { id: 'info', label: 'Informasi Profil', icon: <IconUser size={16} /> },
        { id: 'assignments', label: 'Riwayat Penugasan', icon: <IconCalendarTime size={16} /> },
        { id: 'honor', label: 'Rekap Honor & Kuota', icon: <IconCash size={16} /> },
        { id: 'spk', label: 'Dokumen SPK', icon: <IconFileText size={16} /> },
    ];

    const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

    const months = [
        { val: 1, label: 'Januari' },
        { val: 2, label: 'Februari' },
        { val: 3, label: 'Maret' },
        { val: 4, label: 'April' },
        { val: 5, label: 'Mei' },
        { val: 6, label: 'Juni' },
        { val: 7, label: 'Juli' },
        { val: 8, label: 'Agustus' },
        { val: 9, label: 'September' },
        { val: 10, label: 'Oktober' },
        { val: 11, label: 'November' },
        { val: 12, label: 'Desember' },
    ];

    return (
        <ContentContainer>
            <div className="mb-4">
                <Button
                    hierarchy="secondary"
                    size="sm"
                    prefixIcon={<IconArrowLeft size={16} />}
                    onClick={() => navigate('/app/mitras')}
                >
                    Kembali ke Daftar Mitra
                </Button>
            </div>

            <PageHeader
                title={mitra.name}
                subtitle={`Kode Identitas: ${mitra.mitra_code}`}
                actions={<StatusBadge status={mitra.status} />}
            />

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6 bg-white rounded-t-lg px-4 pt-2 shadow-xs">
                <div className="flex gap-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-all ${
                                    isActive
                                        ? 'border-blue-700 text-blue-800 font-semibold bg-blue-50/50'
                                        : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab 1: Informasi */}
            {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <CardContainer
                            title="Data Pokok Mitra"
                            subtitle="Rincian informasi identitas administrasi mitra"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                                        Kode Mitra
                                    </span>
                                    <span className="text-sm font-mono font-medium text-gray-900 mt-1 block">
                                        {mitra.mitra_code}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                                        Nama Lengkap
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 mt-1 block">
                                        {mitra.name}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                                        Kecamatan Tugas (Mojokerto 3516)
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-1.5">
                                        <IconMapPin size={16} className="text-gray-400" />
                                        {mitra.district
                                            ? `[${mitra.district.code}] ${mitra.district.name}`
                                            : '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                                        Pekerjaan / Profesi
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-1.5">
                                        <IconBriefcase size={16} className="text-gray-400" />
                                        {mitra.occupation || '-'}
                                    </span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                                        Alamat Domisili Lengkap
                                    </span>
                                    <span className="text-sm text-gray-900 mt-1 block">
                                        {mitra.address}
                                    </span>
                                </div>
                            </div>
                        </CardContainer>

                        <CardContainer
                            title="Catatan Administrasi"
                            subtitle="Catatan rekam jejak atau evaluasi petugas"
                        >
                            <div className="py-2">
                                {mitra.notes ? (
                                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                        {mitra.notes}
                                    </p>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">
                                        Tidak ada catatan administrasi tambahan.
                                    </span>
                                )}
                            </div>
                        </CardContainer>
                    </div>

                    <div className="space-y-6">
                        <CardContainer title="Kontak & Komunikasi">
                            <div className="space-y-4 py-2">
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                                        Nomor Telepon / WA
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
                                        <IconPhone size={16} className="text-emerald-600" />
                                        {mitra.phone}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                                        Alamat Email
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
                                        <IconMail size={16} className="text-blue-600" />
                                        {mitra.email || '-'}
                                    </span>
                                </div>
                            </div>
                        </CardContainer>

                        <CardContainer title="Informasi Sistem">
                            <div className="space-y-3 py-2 text-xs text-gray-600">
                                <div>
                                    <span className="text-gray-400 block">Status:</span>
                                    <StatusBadge status={mitra.status} />
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Terdaftar pada:</span>
                                    <span className="font-medium text-gray-800">
                                        {mitra.created_at || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Terakhir diperbarui:</span>
                                    <span className="font-medium text-gray-800">
                                        {mitra.updated_at || '-'}
                                    </span>
                                </div>
                            </div>
                        </CardContainer>
                    </div>
                </div>
            )}

            {/* Tab 2: Riwayat Penugasan */}
            {activeTab === 'assignments' && (
                <div className="space-y-4">
                    {assignmentsLoading ? (
                        <LoadingState message="Memuat riwayat penugasan mitra..." />
                    ) : assignments.length === 0 ? (
                        <CardContainer>
                            <EmptyState
                                title="Belum Ada Riwayat Penugasan"
                                description="Mitra ini belum memiliki penugasan survei atau sensus yang terdaftar."
                            />
                        </CardContainer>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto shadow-xs">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4">Kegiatan Survei</th>
                                        <th className="py-3 px-4">Jadwal Tugas</th>
                                        <th className="py-3 px-4">Volume & Beban</th>
                                        <th className="py-3 px-4 text-right">Nilai Honor</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {assignments.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/70">
                                            <td className="py-3 px-4 font-medium text-gray-900">
                                                <div>{item.snapshots?.task_name || item.task?.name}</div>
                                                <div className="text-[11px] text-gray-500">
                                                    {item.snapshots?.team_name || item.task?.team?.name}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-700">
                                                <div>{formatDate(item.start_date)}</div>
                                                <div className="text-gray-500">s.d. {formatDate(item.end_date)}</div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-700">
                                                {item.volume} {item.snapshots?.unit}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono font-semibold text-gray-900">
                                                {item.formatted_total_value || formatRp(item.total_value)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <AssignmentStatusBadge status={item.status} />
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/app/assignments/${item.id}`)}
                                                    className="px-2 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors font-medium"
                                                >
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Tab 3: Rekap Honor & Kuota Bulanan */}
            {activeTab === 'honor' && (
                <div className="space-y-6">
                    {/* Filter Periode */}
                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xs flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                Monitoring Kuota & Akumulasi Honor Bulanan
                            </h3>
                            <p className="text-xs text-gray-500">
                                Parameter batas resmi BPS Mojokerto: Maksimal 10 penugasan ATAU total honor Rp 4.000.000 per bulan.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-36">
                                <CustomSelect
                                    value={String(selectedMonth)}
                                    onChange={(val) => setSelectedMonth(Number(val))}
                                    options={months.map((m) => ({
                                        value: String(m.val),
                                        label: m.label,
                                    }))}
                                    placeholder="Pilih Bulan"
                                />
                            </div>
                            <input
                                type="number"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="h-10 w-24 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                        </div>
                    </div>

                    {/* Month Summary Cards */}
                    {summaryLoading ? (
                        <LoadingState message="Menghitung kuota dan honor..." />
                    ) : summary ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xs space-y-1">
                                <span className="text-xs font-semibold uppercase text-gray-500">
                                    Jumlah Tugas ({summary.month_name})
                                </span>
                                <div className="text-xl font-bold text-gray-900 font-mono">
                                    {summary.total_tasks} <span className="text-xs text-gray-400 font-normal">/ {summary.max_tasks} tugas</span>
                                </div>
                                <div className="text-xs text-blue-700 font-medium">
                                    Sisa Kuota: {summary.remaining_tasks} tugas
                                </div>
                            </div>

                            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xs space-y-1">
                                <span className="text-xs font-semibold uppercase text-gray-500">
                                    Total Honor ({summary.month_name})
                                </span>
                                <div className="text-xl font-bold text-blue-900 font-mono">
                                    {formatRp(summary.total_honor)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Batas Maksimal: {formatRp(summary.max_honor)}
                                </div>
                            </div>

                            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xs space-y-1">
                                <span className="text-xs font-semibold uppercase text-gray-500">
                                    Sisa Batas Honor
                                </span>
                                <div className="text-xl font-bold text-emerald-800 font-mono">
                                    {formatRp(summary.remaining_honor)}
                                </div>
                                <div className="text-xs text-emerald-600 font-medium">
                                    Tersedia untuk alokasi baru
                                </div>
                            </div>

                            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xs space-y-1">
                                <span className="text-xs font-semibold uppercase text-gray-500">
                                    Persentase Kuota Terpakai
                                </span>
                                <div className="text-xl font-bold text-gray-900 font-mono">
                                    {Math.max(summary.task_percentage, summary.honor_percentage)}%
                                </div>
                                <div className="text-xs text-gray-500">
                                    Tugas: {summary.task_percentage}% | Honor: {summary.honor_percentage}%
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* 12-Month Table Breakdown */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-xs text-gray-700 uppercase tracking-wider">
                            Rincian Akumulasi Sepanjang Tahun {selectedYear}
                        </div>
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
                                <tr>
                                    <th className="py-2.5 px-4">Bulan Pembebanan</th>
                                    <th className="py-2.5 px-4">Tugas Terhitung</th>
                                    <th className="py-2.5 px-4">Sisa Kuota Tugas</th>
                                    <th className="py-2.5 px-4 text-right">Total Honor</th>
                                    <th className="py-2.5 px-4 text-right">Sisa Batas Honor</th>
                                    <th className="py-2.5 px-4">Status Batas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {breakdown.map((row) => {
                                    const isCurrent = row.month === selectedMonth;
                                    const isFull = row.total_tasks >= 10 || row.total_honor >= 4000000;

                                    return (
                                        <tr
                                            key={row.month}
                                            onClick={() => setSelectedMonth(row.month)}
                                            className={`cursor-pointer transition-colors ${
                                                isCurrent ? 'bg-blue-50/60 font-semibold' : 'hover:bg-gray-50/60'
                                            }`}
                                        >
                                            <td className="py-2.5 px-4 text-gray-900">
                                                {row.month_name} {row.year}
                                            </td>
                                            <td className="py-2.5 px-4 text-gray-700 font-mono">
                                                {row.total_tasks} / 10
                                            </td>
                                            <td className="py-2.5 px-4 text-gray-500 font-mono">
                                                {row.remaining_tasks} tugas
                                            </td>
                                            <td className="py-2.5 px-4 text-right font-mono text-gray-900">
                                                {formatRp(row.total_honor)}
                                            </td>
                                            <td className="py-2.5 px-4 text-right font-mono text-emerald-700">
                                                {formatRp(row.remaining_honor)}
                                            </td>
                                            <td className="py-2.5 px-4">
                                                {isFull ? (
                                                    <span className="px-2 py-0.5 rounded text-[11px] bg-red-50 text-red-700 border border-red-200">
                                                        Penuh
                                                    </span>
                                                ) : row.total_tasks > 0 ? (
                                                    <span className="px-2 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                                                        Terisi Sebagian
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[11px] bg-gray-100 text-gray-500">
                                                        Kosong
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 4: SPK */}
            {activeTab === 'spk' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">
                                Berkas Kontrak & Surat Perjanjian Kerja (SPK)
                            </h3>
                            <p className="text-xs text-gray-500">
                                Seluruh perjanjian kerja yang pernah diterbitkan untuk mitra statistik ini
                            </p>
                        </div>
                        <Button
                            hierarchy="primary"
                            size="sm"
                            prefixIcon={<IconFilePlus size={16} />}
                            onClick={() => setSpkModalOpen(true)}
                        >
                            Buat SPK Mitra Ini
                        </Button>
                    </div>

                    {spksLoading ? (
                        <CardContainer>
                            <LoadingState message="Memuat dokumen SPK mitra..." />
                        </CardContainer>
                    ) : spks.length === 0 ? (
                        <CardContainer>
                            <EmptyState
                                title="Belum Ada Dokumen SPK"
                                description="Mitra ini belum memiliki Surat Perjanjian Kerja terdaftar. Klik tombol di bawah untuk membuat SPK baru."
                                action={
                                    <Button
                                        hierarchy="primary"
                                        size="md"
                                        prefixIcon={<IconFilePlus size={16} />}
                                        onClick={() => setSpkModalOpen(true)}
                                    >
                                        Buat SPK untuk Mitra Ini
                                    </Button>
                                }
                            />
                        </CardContainer>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Nomor SPK</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Tanggal SPK</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Masa Kontrak</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-600">Jml Pekerjaan</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600">Total Nilai Kontrak</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {spks.map((spk) => (
                                        <tr key={spk.id} className="hover:bg-gray-50/70">
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => navigate(`/app/spks/${spk.id}`)}
                                                    className="font-medium text-blue-700 hover:text-blue-900 hover:underline text-left"
                                                >
                                                    {spk.spk_number}
                                                </button>
                                                <div className="text-xs text-gray-500">
                                                    {spk.position || spk.occupation || 'Mitra Statistik'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 text-xs">
                                                {formatDate(spk.contract_date)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 text-xs whitespace-nowrap">
                                                {formatDateRange(spk.period_start, spk.period_end)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                                    {spk.tasks_count || 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900 text-xs whitespace-nowrap">
                                                {formatRp(spk.total_value)}
                                            </td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                <SpkStatusBadge status={spk.status} />
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => navigate(`/app/spks/${spk.id}`)}
                                                    className="p-1 text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded transition-colors"
                                                    title="Buka Lembar SPK"
                                                >
                                                    <IconEye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Create SPK for this mitra */}
            <SpkFormModal
                isOpen={spkModalOpen}
                onClose={() => setSpkModalOpen(false)}
                initialMitraId={id}
                mitras={mitra ? [mitra] : []}
                onSubmit={async (formData) => {
                    await spkService.createSpk(formData);
                    refetchSpks();
                    setSpkModalOpen(false);
                }}
            />
        </ContentContainer>
    );
};

export default MitraDetailPage;
