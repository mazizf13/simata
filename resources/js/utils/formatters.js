/**
 * Format numeric value to Indonesian Rupiah representation (e.g. Rp 4.000.000)
 *
 * @param {number|string} value
 * @returns {string}
 */
export const formatRupiah = (value) => {
    if (value === null || value === undefined || value === '') return 'Rp 0';
    const num = Number(value);
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

/**
 * Format ISO date string to Indonesian formal date (e.g. 24 September 2026)
 *
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateIndo = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);
};

export const formatDate = formatDateIndo;

/**
 * Format date range into readable Indonesian string (e.g. 1 Mei 2026 s/d 31 Mei 2026)
 *
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @returns {string}
 */
export const formatDateRange = (startDate, endDate) => {
    if (!startDate && !endDate) return '-';
    if (startDate && !endDate) return formatDateIndo(startDate);
    if (!startDate && endDate) return `s/d ${formatDateIndo(endDate)}`;
    return `${formatDateIndo(startDate)} s/d ${formatDateIndo(endDate)}`;
};

/**
 * Get readable label for system roles
 *
 * @param {string} role
 * @returns {string}
 */
export const getRoleLabel = (role) => {
    const roles = {
        super_admin: 'Super Admin',
        admin: 'Admin',
        operator_tim: 'Operator Tim',
        pimpinan: 'Pimpinan',
    };
    return roles[role] || role || '-';
};

/**
 * Format a Date or date string to local YYYY-MM-DD string without UTC timezone shift.
 *
 * @param {Date|string} [date]
 * @returns {string}
 */
export const formatLocalDate = (date = new Date()) => {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
