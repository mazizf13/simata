import React from 'react';

export const TeamSelect = ({
    value,
    onChange,
    teams = [],
    disabled = false,
    error = null,
    label = 'Tim Penanggung Jawab *',
}) => {
    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`w-full h-10 px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                }`}
            >
                <option value="">-- Semua / Pilih Tim Kerja --</option>
                {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                        [{t.code}] {t.name}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
};

export default TeamSelect;
