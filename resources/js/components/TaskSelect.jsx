import React from 'react';
import Combobox from './Combobox';
import { IconClipboardCheck } from '@tabler/icons-react';

export const TaskSelect = ({
    value,
    onChange,
    tasks = [],
    disabled = false,
    error = null,
    label = 'Pilih Kegiatan Survei *',
    placeholder = '-- Cari dan Pilih Kegiatan Survei / Sensus --',
}) => {
    const filterTask = (task, searchLower) => {
        const name = (task.name || '').toLowerCase();
        const code = (task.code || '').toLowerCase();
        const team = (task.team?.name || '').toLowerCase();
        return name.includes(searchLower) || code.includes(searchLower) || team.includes(searchLower);
    };

    const renderOption = (task) => {
        const rateFormatted = Number(task.default_rate || 0).toLocaleString('id-ID');
        return (
            <div className="py-0.5">
                <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900 truncate">
                        {task.name}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
                        {task.code || '-'}
                    </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>
                        Tarif: <strong className="text-emerald-700">Rp {rateFormatted}</strong> / {task.default_unit || 'dokumen'}
                    </span>
                    {task.team && (
                        <span className="text-gray-400">
                            Tim {task.team.name}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const renderValue = (task) => {
        return (
            <div className="flex items-center justify-between gap-2 truncate">
                <div className="flex items-center gap-2 truncate">
                    <IconClipboardCheck size={16} className="text-blue-700 shrink-0" />
                    <span className="font-semibold text-gray-900 truncate">
                        {task.name}
                    </span>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
                    {task.code || '-'}
                </span>
            </div>
        );
    };

    return (
        <Combobox
            label={label}
            value={value}
            onChange={onChange}
            options={tasks}
            placeholder={placeholder}
            searchPlaceholder="Ketik nama kegiatan survei atau kode..."
            emptyMessage="Kegiatan tidak ditemukan."
            disabled={disabled}
            error={error}
            filterFn={filterTask}
            renderOption={renderOption}
            renderValue={renderValue}
            getOptionLabel={(t) => `${t.name} [${t.code || ''}]`}
            getOptionValue={(t) => t.id}
        />
    );
};

export default TaskSelect;
