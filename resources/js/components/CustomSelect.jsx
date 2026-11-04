import React, { useState, useRef, useEffect, useMemo } from 'react';
import { IconChevronDown, IconChevronUp, IconCheck, IconX } from '@tabler/icons-react';

export const CustomSelect = ({
    value,
    onChange,
    options = [], // [{ value, label, subtitle, badge, disabled }] or string values
    placeholder = '-- Pilih --',
    label = null,
    error = null,
    disabled = false,
    clearable = false,
    size = 'md', // 'sm' | 'md'
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const containerRef = useRef(null);

    // Normalize options
    const normalizedOptions = useMemo(() => {
        return options.map((opt) => {
            if (typeof opt === 'object' && opt !== null) {
                return {
                    value: opt.value ?? opt.id,
                    label: opt.label ?? opt.name ?? String(opt.value ?? opt.id),
                    subtitle: opt.subtitle,
                    badge: opt.badge,
                    disabled: opt.disabled,
                };
            }
            return { value: opt, label: String(opt), subtitle: null, badge: null, disabled: false };
        });
    }, [options]);

    const selectedOption = useMemo(() => {
        if (value === null || value === undefined || value === '') return null;
        return (
            normalizedOptions.find((opt) => String(opt.value) === String(value)) || null
        );
    }, [normalizedOptions, value]);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 240 && rect.top > 240) {
                setOpenUpward(true);
            } else {
                setOpenUpward(false);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (opt) => {
        if (opt.disabled) return;
        onChange?.(opt.value, opt);
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange?.('', null);
    };

    return (
        <div className={`relative ${isOpen ? 'z-50' : 'z-auto'} ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}

            <div
                tabIndex={disabled ? -1 : 0}
                role="combobox"
                aria-expanded={isOpen}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                className={`w-full ${size === 'sm' ? 'h-9 px-2.5 py-1 text-xs' : 'min-h-[40px] px-3 py-2 text-sm'} bg-white border rounded-md flex items-center justify-between gap-1.5 transition-all cursor-pointer select-none outline-none ${
                    disabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                        : isOpen
                        ? 'border-blue-600 ring-2 ring-blue-100'
                        : error
                        ? 'border-red-500 ring-1 ring-red-100'
                        : 'border-gray-300 hover:border-gray-400'
                }`}
            >
                <div className="flex-1 truncate">
                    {selectedOption ? (
                        <div className="flex items-center gap-2 truncate">
                            <span className="text-gray-900 font-medium truncate">
                                {selectedOption.label}
                            </span>
                            {selectedOption.badge && (
                                <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                    {selectedOption.badge}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0 text-gray-400">
                    {clearable && selectedOption && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="Hapus pilihan"
                        >
                            <IconX size={15} />
                        </button>
                    )}
                    {isOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                </div>
            </div>

            {isOpen && (
                <div className={`absolute left-0 right-0 ${
                    openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                } z-[100] bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto p-1 divide-y divide-gray-50`}>
                    {normalizedOptions.length === 0 ? (
                        <div className="py-4 px-3 text-center text-xs text-gray-500">
                            Tidak ada pilihan tersedia
                        </div>
                    ) : (
                        normalizedOptions.map((opt) => {
                            const isSelected =
                                selectedOption && String(selectedOption.value) === String(opt.value);

                            return (
                                <div
                                    key={opt.value}
                                    onClick={() => handleSelect(opt)}
                                    className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                                        opt.disabled
                                            ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                            : isSelected
                                            ? 'bg-blue-50 text-blue-900 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="truncate">
                                        <div className="truncate">{opt.label}</div>
                                        {opt.subtitle && (
                                            <div className="text-xs text-gray-500 truncate">
                                                {opt.subtitle}
                                            </div>
                                        )}
                                    </div>

                                    {isSelected && (
                                        <IconCheck size={16} className="text-blue-700 shrink-0" />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
};

export default CustomSelect;
