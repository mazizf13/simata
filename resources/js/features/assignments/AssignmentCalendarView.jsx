import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LoadingState, ErrorState } from '../../components';
import { Modal, Button } from '@idds/react';
import {
    IconChevronLeft,
    IconChevronRight,
    IconCalendar,
    IconClock,
    IconUser,
    IconCash,
    IconBriefcase,
    IconArrowRight,
} from '@tabler/icons-react';
import reportService from '../../services/reportService';
import { formatRupiah, formatDateRange } from '../../utils/formatters';

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

// Team color map for consistent institutional highlights
const getTeamBadgeStyle = (teamName = '') => {
    const t = teamName.toLowerCase();
    if (t.includes('prod')) return 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100';
    if (t.includes('sos')) return 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
    if (t.includes('tani') || t.includes('pertanian')) return 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
    if (t.includes('dist')) return 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100';
    if (t.includes('ipds')) return 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100';
    return 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100';
};

export const AssignmentCalendarView = ({ teams = [], tasks = [] }) => {
    const navigate = useNavigate();
    const today = new Date();

    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
    const [filterTeamId, setFilterTeamId] = useState('');
    const [filterTaskId, setFilterTaskId] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Fetch calendar events
    const {
        data: calendarResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['assignments-calendar', currentYear, currentMonth, filterTeamId, filterTaskId],
        queryFn: async () => {
            const res = await reportService.getCalendar({
                year: currentYear,
                month: currentMonth,
                team_id: filterTeamId || undefined,
                task_id: filterTaskId || undefined,
            });
            return res.data;
        },
    });

    const events = calendarResponse?.data || [];

    // Prev / Next month handlers
    const handlePrevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
    };

    // Calendar grid calculations
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Monday as 0, Sunday as 6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    // Total cells in grid (start padding + days)
    const calendarDays = [];
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarDays.push({ day: null, dateString: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const monthPad = String(currentMonth).padStart(2, '0');
        const dayPad = String(d).padStart(2, '0');
        calendarDays.push({
            day: d,
            dateString: `${currentYear}-${monthPad}-${dayPad}`,
        });
    }

    return (
        <div className="space-y-4">
            {/* Calendar Controls & Filter Toolbar */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                        title="Bulan Sebelumnya"
                    >
                        <IconChevronLeft size={18} />
                    </button>
                    <h2 className="text-base font-bold text-gray-900 min-w-[180px] text-center">
                        {MONTH_NAMES[currentMonth - 1]} {currentYear}
                    </h2>
                    <button
                        onClick={handleNextMonth}
                        className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                        title="Bulan Berikutnya"
                    >
                        <IconChevronRight size={18} />
                    </button>
                    <button
                        onClick={() => {
                            setCurrentYear(today.getFullYear());
                            setCurrentMonth(today.getMonth() + 1);
                        }}
                        className="ml-2 text-xs font-semibold text-blue-700 hover:underline px-2 py-1 rounded bg-blue-50 border border-blue-200"
                    >
                        Bulan Ini
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={filterTeamId}
                        onChange={(e) => setFilterTeamId(e.target.value)}
                        className="h-9 px-2 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Semua Tim</option>
                        {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filterTaskId}
                        onChange={(e) => setFilterTaskId(e.target.value)}
                        className="h-9 px-2 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs truncate"
                    >
                        <option value="">Semua Kegiatan</option>
                        {tasks.map((task) => (
                            <option key={task.id} value={task.id}>
                                {task.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="bg-white p-12 rounded-lg border border-gray-200">
                    <LoadingState message="Memuat jadwal pelaksanaan tugas di kalender..." />
                </div>
            ) : isError ? (
                <ErrorState
                    title="Gagal Memuat Kalender"
                    message={error?.response?.data?.message || 'Terjadi kesalahan sistem.'}
                    onRetry={refetch}
                />
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center text-xs font-semibold text-gray-600">
                        {DAY_NAMES.map((name) => (
                            <div key={name} className="py-2.5">
                                {name}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 bg-gray-100 text-xs">
                        {calendarDays.map((cell, idx) => {
                            if (!cell.day) {
                                return (
                                    <div
                                        key={`pad-${idx}`}
                                        className="min-h-[110px] bg-gray-50/50 p-2"
                                    />
                                );
                            }

                            const isToday =
                                cell.dateString === today.toISOString().slice(0, 10);

                            // Find events active on this specific date
                            const dayEvents = events.filter((ev) => {
                                if (!ev.start || !ev.end) return false;
                                return cell.dateString >= ev.start && cell.dateString <= ev.end;
                            });

                            return (
                                <div
                                    key={cell.dateString}
                                    className={`min-h-[110px] bg-white p-1.5 flex flex-col transition-colors ${
                                        isToday ? 'bg-blue-50/20' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span
                                            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                                                isToday
                                                    ? 'bg-blue-700 text-white'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            {cell.day}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <span className="text-[10px] font-mono text-gray-400">
                                                {dayEvents.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Events on this day */}
                                    <div className="space-y-1 overflow-y-auto flex-1 max-h-24">
                                        {dayEvents.slice(0, 3).map((ev) => (
                                            <button
                                                key={ev.id}
                                                onClick={() => setSelectedEvent(ev)}
                                                className={`w-full text-left p-1 rounded border text-[11px] leading-tight truncate block transition-colors ${getTeamBadgeStyle(
                                                    ev.team_name
                                                )}`}
                                                title={`${ev.task_name} (${ev.mitra_name})`}
                                            >
                                                <div className="font-semibold truncate">
                                                    {ev.task_name}
                                                </div>
                                                <div className="text-[10px] opacity-80 truncate">
                                                    {ev.mitra_name}
                                                </div>
                                            </button>
                                        ))}

                                        {dayEvents.length > 3 && (
                                            <div className="text-[10px] text-gray-500 font-medium text-center">
                                                +{dayEvents.length - 3} kegiatan lainnya
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Event Detail Modal */}
            {selectedEvent && (
                <Modal
                    isOpen={Boolean(selectedEvent)}
                    onClose={() => setSelectedEvent(null)}
                    title="Detail Pelaksanaan Tugas"
                    size="md"
                >
                    <div className="space-y-4 text-xs">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="font-bold text-sm text-blue-950">
                                {selectedEvent.task_name}
                            </div>
                            <div className="text-blue-800 text-xs mt-0.5">
                                Tim Penanggung Jawab: {selectedEvent.team_name}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 py-1">
                            <div>
                                <span className="text-gray-400 block font-medium">Petugas Mitra</span>
                                <span className="font-bold text-gray-900 text-sm block mt-0.5">
                                    {selectedEvent.mitra_name}
                                </span>
                                <span className="text-gray-500 text-[11px]">
                                    {selectedEvent.mitra_code}
                                </span>
                            </div>

                            <div>
                                <span className="text-gray-400 block font-medium">Status Penugasan</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-emerald-50 text-emerald-800 border-emerald-200 mt-1">
                                    {selectedEvent.status_label}
                                </span>
                            </div>

                            <div>
                                <span className="text-gray-400 block font-medium">Jangka Waktu Pelaksanaan</span>
                                <span className="font-medium text-gray-800 block mt-0.5">
                                    {formatDateRange(selectedEvent.start, selectedEvent.end)}
                                </span>
                            </div>

                            <div>
                                <span className="text-gray-400 block font-medium">Nilai Perjanjian Honor</span>
                                <span className="font-bold text-gray-900 font-mono text-sm block mt-0.5">
                                    {selectedEvent.formatted_total_value}
                                </span>
                                <span className="text-gray-500 text-[11px]">
                                    ({selectedEvent.volume} {selectedEvent.unit})
                                </span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                            <Button
                                hierarchy="secondary"
                                size="sm"
                                onClick={() => setSelectedEvent(null)}
                            >
                                Tutup
                            </Button>
                            <Button
                                hierarchy="primary"
                                size="sm"
                                prefixIcon={<IconArrowRight size={14} />}
                                onClick={() => navigate(`/app/assignments/${selectedEvent.id}`)}
                            >
                                Buka Lembar Penugasan
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AssignmentCalendarView;
