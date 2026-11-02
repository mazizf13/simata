import React from 'react';

export const MitraSelect = ({
    value,
    onChange,
    mitras = [],
    disabled = false,
    error = null,
    label = 'Pilih Mitra Statistik *',
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
                <option value="">-- Pilih Mitra Statistik --</option>
                {mitras.map((m) => (
                    <option key={m.id} value={m.id}>
                        [{m.mitra_code}] {m.name} {m.district ? `(${m.district.name})` : ''}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
};

export default MitraSelect;
