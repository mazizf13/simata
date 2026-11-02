import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LoadingState, ErrorState } from '../../components';
import {
    IconCalendar,
    IconSearch,
    IconClipboardList,
} from '@tabler/icons-react';
import reportService from '../../services/reportService';
import { formatDateRange, formatRupiah } from '../../utils/formatters';

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const COLUMNS_CONFIG = [
    { key: 'draft', label: 'Draf', color: 'border-t-gray-400 bg-gray-50/50', badgeColor: 'bg-gray-100 text-gray-700' },
    { key: 'pending_approval', label: 'Menunggu Persetujuan', color: 'border-t-amber-500 bg-amber-50/20', badgeColor: 'bg-amber-50 text-amber-800' },
    { key: 'approved', label: 'Disetujui', color: 'border-t-blue-500 bg-blue-50/20', badgeColor: 'bg-blue-50 text-blue-800' },
    { key: 'active', label: 'Aktif Berjalan', color: 'border-t-emerald-500 bg-emerald-50/20', badgeColor: 'bg-emerald-50 text-emerald-800' },
    { key: 'completed', label: 'Selesai', color: 'border-t-indigo-500 bg-indigo-50/20', badgeColor: 'bg-indigo-50 text-indigo-800' },
];

export const AssignmentKanbanView = ({ teams = [] }) => {
    const navigate = useNavigate();
    const today = new Date();

    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [search, setSearch] = useState('');

    const {
        data: kanbanResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['assignments-kanban', currentYear, currentMonth, selectedTeamId, search],
        queryFn: async () => {
            const res = await reportService.getKanban({
                year: currentYear,
                month: currentMonth,
                team_id: selectedTeamId || undefined,
                search: search || undefined,
            });
            return res.data;
        },
    });

    const columnsData = kanbanResponse?.data || {
        draft: [],
        pending_approval: [],
        approved: [],
        active: [],
        completed: [],
    };

    return (
        <div className="space-y-4">
            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">Periode Pembebanan:</span>
                    <select
                        value={currentMonth}
                        onChange={(e) => setCurrentMonth(Number(e.target.value))}
                        className="h-9 px-2.5 text-xs bg-white border border-gray-300 rounded font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {MONTH_NAMES.map((name, idx) => (
                            <option key={idx + 1} value={idx + 1}>
                                {name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={currentYear}
                        onChange={(e) => setCurrentYear(Number(e.target.value))}
                        className="h-9 px-2.5 text-xs bg-white border border-gray-300 rounded font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                        <option value={2027}>2027</option>
                    </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari kegiatan atau nama mitra..."
                        className="h-9 px-3 text-xs bg-gray-50 border border-gray-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                    />

                    <select
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="h-9 px-2.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Semua Tim</option>
                        {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="bg-white p-12 rounded-lg border border-gray-200">
                    <LoadingState message="Memuat papan Kanban alur administrasi penugasan..." />
                </div>
            ) : isError ? (
                <ErrorState
                    title="Gagal Memuat Kanban"
                    message={error?.response?.data?.message || 'Terjadi gangguan saat mengambil data Kanban.'}
                    onRetry={refetch}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-start">
                    {COLUMNS_CONFIG.map((col) => {
                        const items = columnsData[col.key] || [];

                        return (
                            <div
                                key={col.key}
                                className={`rounded-lg border border-gray-200 border-t-4 ${col.color} shadow-xs flex flex-col min-h-[450px]`}
                            >
                                {/* Column Header */}
                                <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-white/70">
                                    <span className="font-bold text-xs text-gray-800">
                                        {col.label}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${col.badgeColor}`}>
                                        {items.length}
                                    </span>
                                </div>

                                {/* Column Cards Container */}
                                <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[600px]">
                                    {items.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-xs">
                                            Tidak ada penugasan
                                        </div>
                                    ) : (
                                        items.map((card) => (
                                            <div
                                                key={card.id}
                                                onClick={() => navigate(`/app/assignments/${card.id}`)}
                                                className="bg-white p-3 rounded border border-gray-200 shadow-2xs hover:shadow-sm hover:border-blue-400 cursor-pointer transition-all space-y-1.5"
                                            >
                                                <div className="font-semibold text-xs text-gray-900 leading-tight">
                                                    {card.task_name}
                                                </div>

                                                <div className="text-[11px] text-gray-500">
                                                    Tim: <span className="font-medium text-gray-700">{card.team_name}</span>
                                                </div>

                                                <div className="text-[11px] font-medium text-blue-700 truncate">
                                                    {card.mitra_name}
                                                </div>

                                                <div className="text-[10px] text-gray-400">
                                                    {formatDateRange(card.start_date, card.end_date)}
                                                </div>

                                                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                                                    <span className="text-[11px] text-gray-500">
                                                        {card.volume} {card.unit}
                                                    </span>
                                                    <span className="font-bold text-gray-900 font-mono">
                                                        {card.formatted_total_value}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AssignmentKanbanView;
