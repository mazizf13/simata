import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    IconChevronDown,
    IconChevronUp,
    IconSearch,
    IconX,
    IconCheck,
} from '@tabler/icons-react';

export const Combobox = ({
    value,
    onChange,
    options = [],
    placeholder = '-- Pilih Pilihan --',
    searchPlaceholder = 'Ketik kata kunci untuk mencari...',
    label = null,
    error = null,
    disabled = false,
    clearable = true,
    renderOption = null,
    renderValue = null,
    getOptionLabel = (opt) => opt?.label ?? opt?.name ?? '',
    getOptionValue = (opt) => opt?.value ?? opt?.id ?? '',
    filterFn = null,
    emptyMessage = 'Tidak ada pilihan yang cocok.',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlightIndex, setHighlightIndex] = useState(-1);

    const containerRef = useRef(null);
    const searchInputRef = useRef(null);
    const listRef = useRef(null);

    // Selected option object
    const selectedOption = useMemo(() => {
        if (value === null || value === undefined || value === '') return null;
        return (
            options.find(
                (opt) => String(getOptionValue(opt)) === String(value)
            ) || null
        );
    }, [options, value, getOptionValue]);

    // Filtered options based on search term
    const filteredOptions = useMemo(() => {
        if (!search.trim()) return options;

        if (filterFn) {
            return options.filter((opt) => filterFn(opt, search.trim().toLowerCase()));
        }

        const q = search.trim().toLowerCase();
        return options.filter((opt) => {
            const lbl = String(getOptionLabel(opt)).toLowerCase();
            const val = String(getOptionValue(opt)).toLowerCase();
            return lbl.includes(q) || val.includes(q);
        });
    }, [options, search, filterFn, getOptionLabel, getOptionValue]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearch('');
                setHighlightIndex(-1);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }
    }, [isOpen]);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (disabled) return;

        if (!isOpen) {
            if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            setIsOpen(false);
            setSearch('');
            setHighlightIndex(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex((prev) =>
                prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex((prev) =>
                prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightIndex >= 0 && highlightIndex < filteredOptions.length) {
                handleSelect(filteredOptions[highlightIndex]);
            }
        }
    };

    const handleSelect = (option) => {
        const val = getOptionValue(option);
        onChange?.(val, option);
        setIsOpen(false);
        setSearch('');
        setHighlightIndex(-1);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange?.('', null);
        setSearch('');
        setHighlightIndex(-1);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}

            {/* Custom Trigger */}
            <div
                tabIndex={disabled ? -1 : 0}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                onKeyDown={handleKeyDown}
                className={`w-full min-h-[40px] px-3 py-2 text-sm bg-white border rounded-md flex items-center justify-between gap-2 transition-all cursor-pointer select-none outline-none ${
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
                        renderValue ? (
                            renderValue(selectedOption)
                        ) : (
                            <span className="text-gray-900 font-medium">
                                {getOptionLabel(selectedOption)}
                            </span>
                        )
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

            {/* Dropdown Popover */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-72">
                    {/* Search Input Bar */}
                    <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2 shrink-0">
                        <IconSearch size={16} className="text-gray-400 shrink-0 ml-1" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setHighlightIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={searchPlaceholder}
                            className="w-full text-xs sm:text-sm bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="text-gray-400 hover:text-gray-600 p-0.5"
                            >
                                <IconX size={14} />
                            </button>
                        )}
                    </div>

                    {/* Options List */}
                    <div
                        ref={listRef}
                        role="listbox"
                        className="overflow-y-auto divide-y divide-gray-50 p-1 flex-1"
                    >
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 px-4 text-center text-xs text-gray-500">
                                {emptyMessage}
                            </div>
                        ) : (
                            filteredOptions.map((opt, idx) => {
                                const optVal = getOptionValue(opt);
                                const isSelected =
                                    selectedOption &&
                                    String(getOptionValue(selectedOption)) === String(optVal);
                                const isHighlighted = idx === highlightIndex;

                                return (
                                    <div
                                        key={optVal ?? idx}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => handleSelect(opt)}
                                        onMouseEnter={() => setHighlightIndex(idx)}
                                        className={`px-3 py-2.5 rounded-md text-sm cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                                            isSelected
                                                ? 'bg-blue-50 text-blue-900 font-medium'
                                                : isHighlighted
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            {renderOption ? (
                                                renderOption(opt, isSelected)
                                            ) : (
                                                <div className="truncate">
                                                    {getOptionLabel(opt)}
                                                </div>
                                            )}
                                        </div>

                                        {isSelected && (
                                            <IconCheck
                                                size={16}
                                                className="text-blue-700 shrink-0 ml-2"
                                            />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer count indicator */}
                    <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between items-center">
                        <span>Menampilkan {filteredOptions.length} pilihan</span>
                        {search && <span>Filter aktif</span>}
                    </div>
                </div>
            )}

            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
};

export default Combobox;
