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
        <div className={`flex flex-col ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-semibold text-xs">
                    Rp
                </div>
                <input
                    type="text"
                    value={formatDisplay(value)}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`block w-full h-10 pl-10 pr-3 py-2 text-sm text-right font-mono bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                        errorMessage
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    } disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                />
            </div>
            {errorMessage ? (
                <p className="text-xs text-red-600 font-medium mt-1">{errorMessage}</p>
            ) : helperText ? (
                <p className="text-xs text-gray-500 mt-1">{helperText}</p>
            ) : null}
        </div>
    );
};

export default MoneyInput;
