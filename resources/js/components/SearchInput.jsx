import React, { useState, useEffect } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';

export const SearchInput = ({
    value = '',
    onChange,
    placeholder = 'Cari data...',
    debounceMs = 300,
    className = '',
    disabled = false,
}) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onChange && localValue !== value) {
                onChange(localValue);
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [localValue, debounceMs]);

    const handleClear = () => {
        setLocalValue('');
        if (onChange) onChange('');
    };

    return (
        <div className={`relative flex items-center ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <IconSearch size={17} stroke={1.8} />
            </div>
            <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
            />
            {localValue && !disabled && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                    title="Hapus pencarian"
                >
                    <IconX size={15} />
                </button>
            )}
        </div>
    );
};

export default SearchInput;
