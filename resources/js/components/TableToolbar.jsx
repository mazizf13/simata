import React from 'react';
import SearchInput from './SearchInput';

export const TableToolbar = ({
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Cari data...',
    filters,
    actions,
    className = '',
}) => {
    return (
        <div className={`p-4 bg-white border border-gray-200 rounded-t-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${className}`}>
            {/* Left: Search input & Filter controls */}
            <div className="flex flex-1 flex-wrap items-center gap-3">
                {onSearchChange && (
                    <div className="w-full sm:w-72">
                        <SearchInput
                            value={searchValue}
                            onChange={onSearchChange}
                            placeholder={searchPlaceholder}
                        />
                    </div>
                )}
                {filters && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {filters}
                    </div>
                )}
            </div>

            {/* Right: Action Buttons */}
            {actions && (
                <div className="flex items-center gap-2.5 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default TableToolbar;
