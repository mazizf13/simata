import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    IconCalendar,
    IconChevronLeft,
    IconChevronRight,
    IconX,
    IconCalendarEvent,
} from '@tabler/icons-react';

const MONTH_NAMES_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const MONTH_SHORT_ID = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const DAY_NAMES_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export const CustomDatePicker = ({
    value, // YYYY-MM-DD string
    onChange, // callback with YYYY-MM-DD string or ''
    label = null,
    placeholder = 'Pilih tanggal...',
    error = null,
    disabled = false,
    minDate = null, // YYYY-MM-DD
    maxDate = null, // YYYY-MM-DD
    clearable = true,
    align = 'auto', // 'left' | 'right' | 'auto'
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const [alignRight, setAlignRight] = useState(false);
    const [viewMode, setViewMode] = useState('days'); // 'days' | 'months' | 'years'
    const containerRef = useRef(null);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 350 && rect.top > 320) {
                setOpenUpward(true);
            } else {
                setOpenUpward(false);
            }

            if (align === 'right') {
                setAlignRight(true);
            } else if (align === 'left') {
                setAlignRight(false);
            } else {
                // Auto detect if there's less than 340px to the right edge of viewport
                const spaceRight = window.innerWidth - rect.left;
                setAlignRight(spaceRight < 340);
            }
        }
    }, [isOpen, align]);

    // Parse current value or fallback to today
    const parsedDate = useMemo(() => {
        if (!value) return null;
        const [y, m, d] = value.split('-').map(Number);
        if (!y || !m || !d) return null;
        return new Date(y, m - 1, d);
    }, [value]);

    // Active browsing month and year in the calendar
    const [browsingDate, setBrowsingDate] = useState(() => {
        if (parsedDate) return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    // Sync browsing date when external value changes
    useEffect(() => {
        if (parsedDate) {
            setBrowsingDate(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
        }
    }, [parsedDate]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setViewMode('days');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const browsingYear = browsingDate.getFullYear();
    const browsingMonth = browsingDate.getMonth();

    const handlePrevMonth = (e) => {
        e.stopPropagation();
        setBrowsingDate(new Date(browsingYear, browsingMonth - 1, 1));
    };

    const handleNextMonth = (e) => {
        e.stopPropagation();
        setBrowsingDate(new Date(browsingYear, browsingMonth + 1, 1));
    };

    // Format display date: "24 Oktober 2026"
    const displayValue = useMemo(() => {
        if (!parsedDate) return '';
        const day = parsedDate.getDate();
        const monthName = MONTH_NAMES_ID[parsedDate.getMonth()];
        const year = parsedDate.getFullYear();
        return `${day} ${monthName} ${year}`;
    }, [parsedDate]);

    // Compute calendar day grid
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(browsingYear, browsingMonth, 1);
        const lastDayOfMonth = new Date(browsingYear, browsingMonth + 1, 0);

        // Monday = 0, ..., Sunday = 6
        let startDayOfWeek = firstDayOfMonth.getDay() - 1;
        if (startDayOfWeek === -1) startDayOfWeek = 6;

        const totalDaysInMonth = lastDayOfMonth.getDate();

        // Prev month days
        const prevMonthLastDay = new Date(browsingYear, browsingMonth, 0).getDate();
        const prevMonthDays = [];
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            prevMonthDays.push({
                day: prevMonthLastDay - i,
                isCurrentMonth: false,
                dateStr: null,
            });
        }

        // Current month days
        const currentMonthDays = [];
        const today = new Date();
        const isCurrentYearAndMonth =
            today.getFullYear() === browsingYear && today.getMonth() === browsingMonth;
        const todayDate = today.getDate();

        for (let d = 1; d <= totalDaysInMonth; d++) {
            const mPad = String(browsingMonth + 1).padStart(2, '0');
            const dPad = String(d).padStart(2, '0');
            const dateStr = `${browsingYear}-${mPad}-${dPad}`;

            const isToday = isCurrentYearAndMonth && todayDate === d;
            const isSelected = value === dateStr;

            const isBeforeMin = minDate && dateStr < minDate;
            const isAfterMax = maxDate && dateStr > maxDate;
            const isDisabled = isBeforeMin || isAfterMax;

            currentMonthDays.push({
                day: d,
                isCurrentMonth: true,
                dateStr,
                isToday,
                isSelected,
                isDisabled,
            });
        }

        // Next month days to complete 42 or 35 slots
        const filledSlots = prevMonthDays.length + currentMonthDays.length;
        const totalSlotsNeeded = filledSlots > 35 ? 42 : 35;
        const nextMonthDays = [];
        const remaining = totalSlotsNeeded - filledSlots;
        for (let d = 1; d <= remaining; d++) {
            nextMonthDays.push({
                day: d,
                isCurrentMonth: false,
                dateStr: null,
            });
        }

        return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    }, [browsingYear, browsingMonth, value, minDate, maxDate]);

    const handleSelectDay = (dayObj) => {
        if (!dayObj.isCurrentMonth || dayObj.isDisabled) return;
        onChange?.(dayObj.dateStr);
        setIsOpen(false);
    };

    const handleSelectToday = () => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        setBrowsingDate(new Date(y, today.getMonth(), 1));
        onChange?.(dateStr);
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange?.('');
    };

    return (
        <div className={`relative ${isOpen ? 'z-50' : 'z-auto'} ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}

            {/* Custom Trigger */}
            <div
                tabIndex={disabled ? -1 : 0}
                role="button"
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                className={`w-full h-10 px-3 py-2 text-sm bg-white border rounded-md flex items-center justify-between gap-2 transition-all cursor-pointer select-none outline-none ${
                    disabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                        : isOpen
                        ? 'border-blue-600 ring-2 ring-blue-100'
                        : error
                        ? 'border-red-500 ring-1 ring-red-100'
                        : 'border-gray-300 hover:border-gray-400'
                }`}
            >
                <div className="flex items-center gap-2.5 truncate">
                    <IconCalendar
                        size={17}
                        className={disabled ? 'text-gray-400' : 'text-blue-700'}
                    />
                    {displayValue ? (
                        <span className="text-gray-900 font-medium">{displayValue}</span>
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0 text-gray-400">
                    {clearable && value && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="Hapus tanggal"
                        >
                            <IconX size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* Custom Calendar Popover */}
            {isOpen && (
                <div className={`absolute ${alignRight ? 'right-0' : 'left-0'} ${
                    openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                } z-[100] bg-white border border-gray-200 rounded-lg shadow-2xl p-3.5 w-72 sm:w-80 select-none`}>
                    {/* Header: Month & Year navigation */}
                    <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                            title="Bulan sebelumnya"
                        >
                            <IconChevronLeft size={18} />
                        </button>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() =>
                                    setViewMode((prev) => (prev === 'months' ? 'days' : 'months'))
                                }
                                className="px-2 py-0.5 rounded text-sm font-semibold text-gray-800 hover:bg-gray-100 hover:text-blue-700 transition-colors"
                            >
                                {MONTH_NAMES_ID[browsingMonth]}
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setViewMode((prev) => (prev === 'years' ? 'days' : 'years'))
                                }
                                className="px-2 py-0.5 rounded text-sm font-semibold text-gray-800 hover:bg-gray-100 hover:text-blue-700 transition-colors"
                            >
                                {browsingYear}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                            title="Bulan selanjutnya"
                        >
                            <IconChevronRight size={18} />
                        </button>
                    </div>

                    {/* View: Month selection grid */}
                    {viewMode === 'months' && (
                        <div className="grid grid-cols-3 gap-2 py-2">
                            {MONTH_SHORT_ID.map((mShort, idx) => (
                                <button
                                    key={mShort}
                                    type="button"
                                    onClick={() => {
                                        setBrowsingDate(new Date(browsingYear, idx, 1));
                                        setViewMode('days');
                                    }}
                                    className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                                        idx === browsingMonth
                                            ? 'bg-blue-700 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {mShort}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* View: Year selection grid */}
                    {viewMode === 'years' && (
                        <div className="grid grid-cols-3 gap-2 py-2 max-h-48 overflow-y-auto">
                            {Array.from({ length: 12 }, (_, i) => browsingYear - 5 + i).map(
                                (yr) => (
                                    <button
                                        key={yr}
                                        type="button"
                                        onClick={() => {
                                            setBrowsingDate(new Date(yr, browsingMonth, 1));
                                            setViewMode('days');
                                        }}
                                        className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                                            yr === browsingYear
                                                ? 'bg-blue-700 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {yr}
                                    </button>
                                )
                            )}
                        </div>
                    )}

                    {/* View: Day grid */}
                    {viewMode === 'days' && (
                        <>
                            {/* Weekday headers */}
                            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                {DAY_NAMES_ID.map((dayName) => (
                                    <div key={dayName} className="py-1">
                                        {dayName}
                                    </div>
                                ))}
                            </div>

                            {/* Day slots */}
                            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                {calendarDays.map((dObj, idx) => {
                                    if (!dObj.isCurrentMonth) {
                                        return (
                                            <div
                                                key={`empty-${idx}`}
                                                className="py-2 text-gray-300 pointer-events-none"
                                            >
                                                {dObj.day}
                                            </div>
                                        );
                                    }

                                    return (
                                        <button
                                            key={dObj.dateStr}
                                            type="button"
                                            disabled={dObj.isDisabled}
                                            onClick={() => handleSelectDay(dObj)}
                                            className={`py-1.5 rounded-md font-medium transition-colors ${
                                                dObj.isSelected
                                                    ? 'bg-blue-700 text-white shadow-xs font-bold'
                                                    : dObj.isDisabled
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : dObj.isToday
                                                    ? 'border border-blue-600 text-blue-700 font-bold hover:bg-blue-50'
                                                    : 'text-gray-800 hover:bg-gray-100'
                                            }`}
                                        >
                                            {dObj.day}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Footer: Quick Actions */}
                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                        <button
                            type="button"
                            onClick={handleSelectToday}
                            className="text-blue-700 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1"
                        >
                            <IconCalendarEvent size={14} />
                            Hari Ini
                        </button>

                        {value && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-gray-500 hover:text-red-600 transition-colors"
                            >
                                Kosongkan
                            </button>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
};

export default CustomDatePicker;
