import React from 'react';
import Combobox from './Combobox';
import { IconUser, IconMapPin } from '@tabler/icons-react';

export const MitraSelect = ({
    value,
    onChange,
    mitras = [],
    disabled = false,
    error = null,
    label = 'Mitra Statistik Penugasan *',
    placeholder = '-- Cari dan Pilih Mitra Statistik --',
}) => {
    // Custom filter function matching Name, SOBAT ID, and District
    const filterMitra = (mitra, searchLower) => {
        const name = (mitra.name || '').toLowerCase();
        const code = (mitra.mitra_code || '').toLowerCase();
        const distName = (mitra.district?.name || '').toLowerCase();
        const distCode = (mitra.district?.code || '').toLowerCase();

        return (
            name.includes(searchLower) ||
            code.includes(searchLower) ||
            distName.includes(searchLower) ||
            distCode.includes(searchLower)
        );
    };

    // Render Option inside dropdown
    const renderOption = (mitra, isSelected) => {
        const districtName = mitra.district?.name || '-';
        const districtCode = mitra.district?.code || '';
        const isInactive = mitra.status !== 'active';

        return (
            <div className="py-0.5">
                <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900 truncate">
                        {mitra.name}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                        {mitra.mitra_code}
                    </span>
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1 truncate">
                        <IconMapPin size={13} className="text-gray-400 shrink-0" />
                        Kec. {districtName} {districtCode ? `(${districtCode})` : ''}
                    </span>

                    {mitra.occupation && (
                        <span className="hidden sm:inline text-gray-400">
                            • {mitra.occupation}
                        </span>
                    )}

                    {isInactive && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-100 text-red-700 font-semibold ml-auto">
                            Nonaktif
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // Render selected value in Trigger
    const renderValue = (mitra) => {
        const districtName = mitra.district?.name || '';
        return (
            <div className="flex items-center justify-between gap-2 truncate">
                <div className="flex items-center gap-2 truncate">
                    <IconUser size={16} className="text-blue-700 shrink-0" />
                    <span className="font-semibold text-gray-900 truncate">
                        {mitra.name}
                    </span>
                    {districtName && (
                        <span className="text-xs text-gray-500 hidden sm:inline">
                            (Kec. {districtName})
                        </span>
                    )}
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                    {mitra.mitra_code}
                </span>
            </div>
        );
    };

    return (
        <Combobox
            label={label}
            value={value}
            onChange={onChange}
            options={mitras}
            placeholder={placeholder}
            searchPlaceholder="Ketik nama mitra, SOBAT ID, atau kecamatan..."
            emptyMessage="Mitra tidak ditemukan. Periksa ejaan nama, SOBAT ID, atau nama kecamatan."
            disabled={disabled}
            error={error}
            filterFn={filterMitra}
            renderOption={renderOption}
            renderValue={renderValue}
            getOptionLabel={(m) => `${m.name} [${m.mitra_code}]`}
            getOptionValue={(m) => m.id}
        />
    );
};

export default MitraSelect;
