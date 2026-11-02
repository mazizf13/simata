import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@idds/react';
import {
    FormSection,
    TeamSelect,
    TaskSelect,
    BulkAssignmentTable,
} from '../../components';
import { IconUsers, IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import assignmentService from '../../services/assignmentService';

export const BulkAssignmentModal = ({
    isOpen,
    onClose,
    teams = [],
    tasks = [],
    mitras = [],
    budgetAccounts = [],
    onSubmit,
    isLoading = false,
}) => {
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [taskId, setTaskId] = useState('');
    const [budgetAccountId, setBudgetAccountId] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
    const [mitraAssignments, setMitraAssignments] = useState([]);
    const [simulation, setSimulation] = useState(null);
    const [simLoading, setSimLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Reset on modal open
    useEffect(() => {
        if (isOpen) {
            setSelectedTeamId('');
            const firstTask = tasks.length > 0 ? tasks[0] : null;
            setTaskId(firstTask ? firstTask.id : '');
            setBudgetAccountId('');
            setStartDate(new Date().toISOString().slice(0, 10));
            setEndDate(new Date().toISOString().slice(0, 10));
            setMitraAssignments([]);
            setSimulation(null);
            setErrors({});
        }
    }, [isOpen, tasks]);

    const filteredTasks = selectedTeamId
        ? tasks.filter((t) => Number(t.team_id) === Number(selectedTeamId))
        : tasks;

    const currentTask = tasks.find((t) => Number(t.id) === Number(taskId));

    const handleTaskChange = (newTaskId) => {
        setTaskId(newTaskId);
        const tObj = tasks.find((t) => Number(t.id) === Number(newTaskId));
        if (tObj) {
            if (tObj.team_id) setSelectedTeamId(tObj.team_id);
            if (tObj.default_budget_account_id) setBudgetAccountId(tObj.default_budget_account_id);
            // Update default unit price on existing rows if they match previous default
            setMitraAssignments((prev) =>
                prev.map((item) => ({
                    ...item,
                    unit_price: tObj.default_rate || item.unit_price,
                }))
            );
        }
    };

    const handleAddMitra = (mitraId) => {
        const m = mitras.find((x) => x.id === mitraId);
        if (!m) return;

        setMitraAssignments((prev) => [
            ...prev,
            {
                mitra_id: m.id,
                mitra_name: m.name,
                mitra_code: m.mitra_code,
                volume: 1,
                unit_price: currentTask?.default_rate || 50000,
                notes: '',
            },
        ]);
    };

    const handleRemoveMitra = (index) => {
        setMitraAssignments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpdateMitra = (index, field, value) => {
        setMitraAssignments((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    // Run simulation whenever task, dates, or mitra items change
    useEffect(() => {
        if (!taskId || !startDate || mitraAssignments.length === 0) {
            setSimulation(null);
            return;
        }

        let cancelled = false;
        setSimLoading(true);

        const timer = setTimeout(async () => {
            try {
                const res = await assignmentService.simulateBulk({
                    task_id: taskId,
                    start_date: startDate,
                    end_date: endDate,
                    mitra_assignments: mitraAssignments,
                });

                if (!cancelled) {
                    setSimulation(res.data);
                    setSimLoading(false);
                }
            } catch (err) {
                if (!cancelled) setSimLoading(false);
            }
        }, 350);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [taskId, startDate, endDate, mitraAssignments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!taskId) {
            setErrors({ task_id: 'Kegiatan survei wajib dipilih.' });
            return;
        }
        if (mitraAssignments.length === 0) {
            setErrors({ mitras: 'Pilih minimal satu mitra untuk penugasan kolektif.' });
            return;
        }

        try {
            await onSubmit({
                task_id: taskId,
                start_date: startDate,
                end_date: endDate,
                budget_account_id: budgetAccountId || null,
                status: 'approved',
                mitra_assignments: mitraAssignments,
            });
        } catch (err) {
            if (err.errors) {
                const mapped = {};
                Object.keys(err.errors).forEach((key) => {
                    mapped[key] = err.errors[key][0];
                });
                setErrors(mapped);
            }
        }
    };

    const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            size="xl"
            title="Penugasan Kolektif Mitra (Bulk Assignment)"
        >
            <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="max-h-[72vh] overflow-y-auto px-1 py-2 space-y-5">
                    {/* Kegiatan & Parameter Global */}
                    <FormSection
                        title="1. Penentuan Kegiatan & Jadwal Pelaksanaan"
                        description="Pilih satu kegiatan yang akan dialokasikan kepada banyak mitra."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TeamSelect
                                label="Tim Kerja Penanggung Jawab"
                                value={selectedTeamId}
                                onChange={(val) => {
                                    setSelectedTeamId(val);
                                    const curr = tasks.find((t) => Number(t.id) === Number(taskId));
                                    if (curr && val && Number(curr.team_id) !== Number(val)) {
                                        setTaskId('');
                                    }
                                }}
                                teams={teams}
                                disabled={isLoading}
                            />

                            <TaskSelect
                                label="Katalog Kegiatan Survei *"
                                value={taskId}
                                onChange={handleTaskChange}
                                tasks={filteredTasks}
                                disabled={isLoading}
                                error={errors.task_id}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Mulai *
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Selesai *
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Akun Anggaran (MAK)
                                </label>
                                <select
                                    value={budgetAccountId}
                                    onChange={(e) => setBudgetAccountId(e.target.value)}
                                    className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                >
                                    <option value="">-- Akun Default Kegiatan --</option>
                                    {budgetAccounts.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.code} — {a.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </FormSection>

                    {/* Alokasi Mitra & Volume */}
                    <FormSection
                        title="2. Alokasi Beban Tugas Mitra"
                        description="Tambahkan mitra, atur beban kuantitas, dan periksa simulasi batas."
                    >
                        <BulkAssignmentTable
                            items={mitraAssignments}
                            availableMitras={mitras}
                            onAddItem={handleAddMitra}
                            onRemoveItem={handleRemoveMitra}
                            onUpdateItem={handleUpdateMitra}
                            simulation={simulation?.simulation || []}
                            unit={currentTask?.default_unit || 'Dokumen'}
                            disabled={isLoading}
                        />

                        {errors.mitras && (
                            <p className="text-xs text-red-600 mt-2 font-medium">{errors.mitras}</p>
                        )}
                    </FormSection>

                    {/* Ringkasan Simulasi Kolektif */}
                    {simulation && (
                        <div
                            className={`p-4 rounded-lg border text-sm ${
                                simulation.all_passed
                                    ? 'bg-emerald-50/70 border-emerald-200'
                                    : 'bg-amber-50/70 border-amber-200'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 font-semibold">
                                    {simulation.all_passed ? (
                                        <>
                                            <IconCircleCheck size={18} className="text-emerald-700" />
                                            <span className="text-emerald-900">
                                                Seluruh {simulation.total_mitras} Mitra Lolos Batas Validasi
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <IconAlertTriangle size={18} className="text-amber-700" />
                                            <span className="text-amber-900">
                                                Sebagian Mitra Mengalami Pelanggaran Batas Kuota
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 block">Total Estimasi Honor:</span>
                                    <span className="text-base font-bold text-gray-900 font-mono">
                                        {formatRp(simulation.total_estimated_value)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-200 bg-white flex items-center justify-end gap-3">
                    <Button
                        hierarchy="secondary"
                        size="md"
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        hierarchy="primary"
                        size="md"
                        type="submit"
                        disabled={isLoading || mitraAssignments.length === 0}
                    >
                        {isLoading ? 'Memproses Penugasan...' : `Simpan ${mitraAssignments.length} Penugasan`}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default BulkAssignmentModal;
