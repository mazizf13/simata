import React from 'react';
import { IconCash, IconCalendar, IconBuildingBank } from '@tabler/icons-react';
import { formatDateRange, formatRupiah } from '../utils/formatters';

export const AssignmentSummary = ({
    volume = 0,
    unit = 'Dokumen',
    unitPrice = 0,
    startDate = '',
    endDate = '',
    budgetAccountCode = '',
}) => {
    const totalValue = Math.round(Number(volume || 0) * Number(unitPrice || 0));

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Ringkasan Perjanjian Kerja & Nilai Honor
                </span>
                <span className="text-xs font-mono bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                    Kalkulasi Otomatis Backend
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div>
                    <span className="text-xs text-gray-500 block">Beban & Tarif Satuan</span>
                    <span className="text-sm font-medium text-gray-900 mt-0.5 block">
                        {volume} {unit} × {formatRupiah(unitPrice)}
                    </span>
                </div>

                <div>
                    <span className="text-xs text-gray-500 block">Jadwal Pelaksanaan</span>
                    <span className="text-sm font-medium text-gray-900 mt-0.5 flex items-center gap-1">
                        <IconCalendar size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate">{formatDateRange(startDate, endDate)}</span>
                    </span>
                </div>

                <div>
                    <span className="text-xs text-gray-500 block">Akun Anggaran (MAK)</span>
                    <span className="text-xs font-mono font-medium text-gray-900 mt-0.5 flex items-center gap-1">
                        <IconBuildingBank size={14} className="text-gray-400" />
                        {budgetAccountCode || 'Standar DIPA BPS'}
                    </span>
                </div>
            </div>

            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Total Nilai Perjanjian:</span>
                <div className="text-right">
                    <span className="text-lg font-bold text-blue-900 font-mono">
                        {formatRupiah(totalValue)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AssignmentSummary;
