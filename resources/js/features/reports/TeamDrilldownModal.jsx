import React from 'react';
import { Modal, Button } from '@idds/react';
import { useQuery } from '@tanstack/react-query';
import reportService from '../../services/reportService';
import { formatRupiah, formatDateRange } from '../../utils/formatters';
import { LoadingState, EmptyState } from '../../components';
import { Link } from 'react-router-dom';

export const TeamDrilldownModal = ({
    isOpen,
    onClose,
    team = null,
    year,
    month,
}) => {
    const {
        data: drilldownResponse,
        isLoading,
    } = useQuery({
        queryKey: ['team-drilldown', team?.team_id, year, month],
        queryFn: async () => {
            const res = await reportService.getTeamDrilldown(team.team_id, { year, month });
            return res.data;
        },
        enabled: Boolean(isOpen && team?.team_id),
    });

    const drilldown = drilldownResponse?.data;
    const tasks = drilldown?.tasks || [];
    const summary = drilldown?.summary;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Rincian Beban Kerja: ${team?.team_name || ''}`}
            size="xl"
        >
            <div className="space-y-4">
                {/* Header Summary Bar */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                        <span className="font-semibold text-blue-900">Tim:</span> {team?.team_name} ({team?.team_code})
                    </div>
                    <div>
                        <span className="font-semibold text-blue-900">Jumlah Kegiatan:</span> {summary?.tasks_count || 0}
                    </div>
                    <div>
                        <span className="font-semibold text-blue-900">Mitra Terlibat:</span> {summary?.mitras_count || 0} orang
                    </div>
                    <div>
                        <span className="font-semibold text-blue-900">Total Tugas:</span> {summary?.assignments_count || 0}
                    </div>
                    <div>
                        <span className="font-semibold text-blue-900">Total Honor:</span>{' '}
                        <strong className="text-blue-950 font-mono">{summary?.formatted_total_honor || 'Rp 0'}</strong>
                    </div>
                </div>

                {isLoading ? (
                    <LoadingState message="Memuat hierarki kegiatan dan rincian penugasan mitra..." />
                ) : tasks.length === 0 ? (
                    <EmptyState
                        title="Tidak Ada Kegiatan Aktif"
                        description="Belum ada penugasan yang tercatat untuk tim ini pada periode yang dipilih."
                    />
                ) : (
                    <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                        {tasks.map((t) => (
                            <div
                                key={t.task_id}
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs"
                            >
                                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <span className="font-bold text-gray-900 text-sm">
                                            {t.task_name}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            ({t.task_code}) • Tarif Satuan: {formatRupiah(t.default_rate)} / {t.unit}
                                        </span>
                                    </div>
                                    <div className="text-xs font-semibold text-gray-700">
                                        {t.assignments_count} penugasan • Total: {formatRupiah(t.total_honor)}
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-100 text-xs">
                                        <thead className="bg-gray-50/50 text-gray-500">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Nama Mitra</th>
                                                <th className="px-3 py-2 text-left">Kecamatan</th>
                                                <th className="px-3 py-2 text-left">Jangka Waktu</th>
                                                <th className="px-3 py-2 text-center">Volume</th>
                                                <th className="px-3 py-2 text-right">Tarif</th>
                                                <th className="px-3 py-2 text-right">Total Honor</th>
                                                <th className="px-3 py-2 text-left">Akun MAK</th>
                                                <th className="px-3 py-2 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {t.assignments.map((a) => (
                                                <tr key={a.id} className="hover:bg-gray-50/60">
                                                    <td className="px-3 py-2">
                                                        <Link
                                                            to={`/app/mitras/${a.mitra_id}`}
                                                            className="font-medium text-blue-700 hover:underline"
                                                            target="_blank"
                                                        >
                                                            {a.mitra_name}
                                                        </Link>
                                                        <div className="text-[10px] text-gray-400">
                                                            {a.mitra_code}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-600">
                                                        {a.mitra_district}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                                                        {formatDateRange(a.start_date, a.end_date)}
                                                    </td>
                                                    <td className="px-3 py-2 text-center font-medium">
                                                        {a.volume} {a.unit}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-gray-600">
                                                        {formatRupiah(a.unit_price)}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-bold text-gray-900 font-mono">
                                                        {formatRupiah(a.total_value)}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-500 font-mono text-[11px]">
                                                        {a.budget_account}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <Link
                                                            to={`/app/assignments/${a.id}`}
                                                            className="text-blue-700 hover:underline font-medium"
                                                            target="_blank"
                                                        >
                                                            Lihat
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-3 border-t border-gray-200 flex justify-end">
                    <Button hierarchy="secondary" size="md" onClick={onClose}>
                        Tutup
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default TeamDrilldownModal;
