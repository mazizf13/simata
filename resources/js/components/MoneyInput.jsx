import React from 'react';

export const MoneyInput = ({
    value,
    onChange,
    label = 'Nominal (Rp)',
    placeholder = '0',
    disabled = false,
    errorMessage,
    helperText,
    className = '',
}) => {
    // Format raw numeric input to thousands display (e.g. 4000000 -> 4.000.000)
    const formatDisplay = (val) => {
        if (val === null || val === undefined || val === '') return '';
        const digits = String(val).replace(/\D/g, '');
        if (!digits) return '';
        return new Intl.NumberFormat('id-ID').format(Number(digits));
    };

    const handleChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const numeric = rawValue ? Number(rawValue) : 0;
        if (onChange) {
            onChange(numeric);
        }
    };

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-xs font-semibold text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-semibold text-xs">
                    Rp
                </div>
                <input
                    type="text"
                    value={formatDisplay(value)}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`block w-full pl-9 pr-3 py-2 text-sm text-right font-mono bg-white border rounded-md text-gray-900 focus:outline-hidden focus:ring-1 transition-colors ${
                        errorMessage
                            ? 'border-red-400 focus:border-red-600 focus:ring-red-600'
                            : 'border-gray-300 focus:border-blue-600 focus:ring-blue-600'
                    } disabled:bg-gray-50 disabled:text-gray-500`}
                />
            </div>
            {errorMessage ? (
                <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
            ) : helperText ? (
                <p className="text-xs text-gray-500">{helperText}</p>
            ) : null}
        </div>
    );
};

export default MoneyInput;
