import React from 'react';
import { IconAlertTriangle, IconCircleCheck, IconInfoCircle } from '@tabler/icons-react';

export const AssignmentLimitIndicator = ({
    simulation = null,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-500 flex items-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                Mengecek batas kuota penugasan dan honor bulanan...
            </div>
        );
    }

    if (!simulation) {
        return (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-500 flex items-center gap-2">
                <IconInfoCircle size={16} className="text-gray-400" />
                Pilih mitra dan tanggal mulai untuk melihat simulasi kuota penugasan bulanan.
            </div>
        );
    }

    const {
        allowed,
        period_label,
        current_tasks = 0,
        current_honor = 0,
        projected_tasks = 0,
        projected_honor = 0,
        task_limit_exceeded = false,
        honor_limit_exceeded = false,
        reason,
    } = simulation;

    const maxTasks = 10;
    const maxHonor = 4000000;

    const taskPercentage = Math.min(100, Math.round((projected_tasks / maxTasks) * 100));
    const honorPercentage = Math.min(100, Math.round((projected_honor / maxHonor) * 100));

    const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

    return (
        <div
            className={`p-4 rounded-lg border text-sm transition-all ${
                allowed
                    ? 'bg-blue-50/50 border-blue-200'
                    : 'bg-red-50 border-red-200'
            }`}
        >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200/60">
                <div className="flex items-center gap-2 font-semibold">
                    {allowed ? (
                        <>
                            <IconCircleCheck size={18} className="text-emerald-600" />
                            <span className="text-gray-800">Batas Kuota {period_label}: Sesuai</span>
                        </>
                    ) : (
                        <>
                            <IconAlertTriangle size={18} className="text-red-600" />
                            <span className="text-red-800">Peringatan: Batas Kuota Terlampaui</span>
                        </>
                    )}
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600 font-medium">
                    Aturan Batas: OR
                </span>
            </div>

            {/* Error Message if Exceeded */}
            {!allowed && reason && (
                <div className="mb-3 p-2.5 bg-red-100/70 border border-red-300 rounded text-xs text-red-800 font-medium leading-relaxed">
                    {reason}
                </div>
            )}

            {/* Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Tasks Limit */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-gray-700">
                        <span className="font-medium">Jumlah Tugas Bulan Ini:</span>
                        <span className={task_limit_exceeded ? 'text-red-700 font-bold' : 'text-gray-900 font-semibold'}>
                            {current_tasks} → {projected_tasks} / {maxTasks} tugas
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-2 rounded-full transition-all ${
                                task_limit_exceeded ? 'bg-red-600' : taskPercentage >= 80 ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${taskPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Honor Limit */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-gray-700">
                        <span className="font-medium">Total Honor Bulan Ini:</span>
                        <span className={honor_limit_exceeded ? 'text-red-700 font-bold' : 'text-gray-900 font-semibold'}>
                            {formatRp(current_honor)} → {formatRp(projected_honor)}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-2 rounded-full transition-all ${
                                honor_limit_exceeded ? 'bg-red-600' : honorPercentage >= 80 ? 'bg-amber-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${honorPercentage}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentLimitIndicator;
