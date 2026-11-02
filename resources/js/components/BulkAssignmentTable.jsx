import React from 'react';
import { IconTrash, IconCheck, IconX, IconUserPlus } from '@tabler/icons-react';

export const BulkAssignmentTable = ({
    items = [],
    availableMitras = [],
    onAddItem,
    onRemoveItem,
    onUpdateItem,
    simulation = [],
    unit = 'Dokumen',
    disabled = false,
}) => {
    const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

    // Index simulation by mitra_id for fast lookup
    const simMap = {};
    simulation.forEach((s) => {
        simMap[s.mitra_id] = s;
    });

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-800">
                    Daftar Mitra yang Ditugaskan ({items.length} Orang)
                </span>
                <div className="flex gap-2">
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                onAddItem(Number(e.target.value));
                                e.target.value = '';
                            }
                        }}
                        disabled={disabled}
                        className="text-xs h-8 px-2.5 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">+ Tambah Mitra ke Alokasi...</option>
                        {availableMitras
                            .filter((m) => !items.some((it) => it.mitra_id === m.id))
                            .map((m) => (
                                <option key={m.id} value={m.id}>
                                    [{m.mitra_code}] {m.name}
                                </option>
                            ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                        <tr>
                            <th className="py-2.5 px-3">Mitra Statistik</th>
                            <th className="py-2.5 px-3 w-28">Volume ({unit})</th>
                            <th className="py-2.5 px-3 w-36">Harga Satuan (Rp)</th>
                            <th className="py-2.5 px-3 w-36">Total Nilai</th>
                            <th className="py-2.5 px-3">Status Validasi Batas</th>
                            <th className="py-2.5 px-3 text-right w-16">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-6 text-center text-gray-400 italic">
                                    Belum ada mitra yang ditambahkan. Gunakan dropdown di atas untuk memilih mitra penugasan.
                                </td>
                            </tr>
                        ) : (
                            items.map((item, idx) => {
                                const sim = simMap[item.mitra_id];
                                const totalVal = Math.round(Number(item.volume || 0) * Number(item.unit_price || 0));

                                return (
                                    <tr key={item.mitra_id} className="hover:bg-gray-50/70">
                                        <td className="py-2.5 px-3 font-medium text-gray-900">
                                            <div>{item.mitra_name || `Mitra #${item.mitra_id}`}</div>
                                            <div className="text-[11px] font-mono text-gray-500">{item.mitra_code}</div>
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={item.volume}
                                                onChange={(e) => onUpdateItem(idx, 'volume', e.target.value)}
                                                disabled={disabled}
                                                className="w-full h-8 px-2 text-xs bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <input
                                                type="number"
                                                min="0"
                                                step="1000"
                                                value={item.unit_price}
                                                onChange={(e) => onUpdateItem(idx, 'unit_price', e.target.value)}
                                                disabled={disabled}
                                                className="w-full h-8 px-2 text-xs bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="py-2.5 px-3 font-mono font-medium text-gray-900">
                                            {formatRp(totalVal)}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            {sim ? (
                                                sim.allowed ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                        <IconCheck size={12} />
                                                        Lolos ({sim.projected_tasks}/10 tgs)
                                                    </span>
                                                ) : (
                                                    <div className="space-y-0.5">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-red-50 text-red-800 border border-red-200">
                                                            <IconX size={12} />
                                                            Batas Terlampaui
                                                        </span>
                                                        <div className="text-[10px] text-red-600 line-clamp-1" title={sim.reason}>
                                                            {sim.reason}
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <span className="text-[11px] text-gray-400 italic">Menunggu simulasi...</span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => onRemoveItem(idx)}
                                                disabled={disabled}
                                                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                                title="Hapus dari alokasi"
                                            >
                                                <IconTrash size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BulkAssignmentTable;
