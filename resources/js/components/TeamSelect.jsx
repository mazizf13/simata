import React from 'react';
import CustomSelect from './CustomSelect';

export const TeamSelect = ({
    value,
    onChange,
    teams = [],
    disabled = false,
    error = null,
    label = 'Tim Penanggung Jawab *',
    placeholder = '-- Semua / Pilih Tim Kerja --',
}) => {
    const options = [
        { value: '', label: '-- Semua / Pilih Tim Kerja --' },
        ...teams.map((t) => ({
            value: t.id,
            label: `[${t.code}] ${t.name}`,
            badge: t.code,
        })),
    ];

    return (
        <CustomSelect
            label={label}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
        />
    );
};

export default TeamSelect;
