import React, { useState, useEffect } from 'react';
import { Modal, Button, TextField } from '@idds/react';
import {
    FormSection,
    MoneyInput,
    AssignmentSummary,
    AssignmentLimitIndicator,
    TeamSelect,
    TaskSelect,
    MitraSelect,
} from '../../components';
import assignmentService from '../../services/assignmentService';

export const AssignmentFormModal = ({
    isOpen,
    onClose,
    assignment = null,
    teams = [],
    tasks = [],
    mitras = [],
    budgetAccounts = [],
    onSubmit,
    isLoading = false,
}) => {
    const isEdit = Boolean(assignment);

    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [formData, setFormData] = useState({
        mitra_id: '',
        task_id: '',
        budget_account_id: '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date().toISOString().slice(0, 10),
        volume: 1,
        unit: 'Dokumen',
        unit_price: 0,
        status: 'draft',
        notes: '',
    });

    const [errors, setErrors] = useState({});
    const [simulation, setSimulation] = useState(null);
    const [simLoading, setSimLoading] = useState(false);

    // Initialize or reset form data
    useEffect(() => {
        if (assignment) {
            const taskObj = tasks.find((t) => t.id === assignment.task_id);
            setSelectedTeamId(taskObj?.team_id || '');
            setFormData({
                mitra_id: assignment.mitra_id || '',
                task_id: assignment.task_id || '',
                budget_account_id: assignment.budget_account_id || '',
                start_date: assignment.start_date || new Date().toISOString().slice(0, 10),
                end_date: assignment.end_date || new Date().toISOString().slice(0, 10),
                volume: assignment.volume || 1,
                unit: assignment.unit_snapshot || assignment.task?.default_unit || 'Dokumen',
                unit_price: assignment.unit_price || assignment.task?.default_rate || 0,
                status: assignment.status?.value || 'draft',
                notes: assignment.notes || '',
            });
        } else {
            setSelectedTeamId('');
            setFormData({
                mitra_id: mitras.length > 0 ? mitras[0].id : '',
                task_id: tasks.length > 0 ? tasks[0].id : '',
                budget_account_id: '',
                start_date: new Date().toISOString().slice(0, 10),
                end_date: new Date().toISOString().slice(0, 10),
                volume: 1,
                unit: 'Dokumen',
                unit_price: 50000,
                status: 'draft',
                notes: '',
            });
        }
        setErrors({});
        setSimulation(null);
    }, [assignment, isOpen, tasks, mitras]);

    // When task changes, update default unit, unit_price, budget_account, and team
    const handleTaskChange = (taskId) => {
        const tId = Number(taskId);
        const taskObj = tasks.find((t) => t.id === tId);

        setFormData((prev) => ({
            ...prev,
            task_id: taskId,
            unit: taskObj?.default_unit || prev.unit,
            unit_price: taskObj?.default_rate || prev.unit_price,
            budget_account_id: taskObj?.default_budget_account_id || prev.budget_account_id,
        }));

        if (taskObj?.team_id) {
            setSelectedTeamId(taskObj.team_id);
        }

        if (errors.task_id) setErrors((prev) => ({ ...prev, task_id: null }));
    };

    // Filter tasks by selected team
    const filteredTasks = selectedTeamId
        ? tasks.filter((t) => Number(t.team_id) === Number(selectedTeamId))
        : tasks;

    // Real-time limit simulation check
    useEffect(() => {
        if (!formData.mitra_id || !formData.start_date || Number(formData.volume) <= 0) {
            setSimulation(null);
            return;
        }

        let cancelled = false;
        setSimLoading(true);

        const timer = setTimeout(async () => {
            try {
                const res = await assignmentService.simulateLimit({
                    mitra_id: formData.mitra_id,
                    start_date: formData.start_date,
                    volume: formData.volume,
                    unit_price: formData.unit_price,
                    exclude_assignment_id: assignment?.id || null,
                });

                if (!cancelled) {
                    setSimulation(res.data);
                    setSimLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setSimLoading(false);
                }
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [formData.mitra_id, formData.start_date, formData.volume, formData.unit_price, assignment]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const newErrors = {};
        if (!formData.task_id) newErrors.task_id = 'Kegiatan survei wajib dipilih.';
        if (!formData.mitra_id) newErrors.mitra_id = 'Mitra statistik wajib dipilih.';
        if (!formData.start_date) newErrors.start_date = 'Tanggal mulai wajib diisi.';
        if (!formData.end_date) newErrors.end_date = 'Tanggal selesai wajib diisi.';
        if (Number(formData.volume) <= 0) newErrors.volume = 'Volume harus lebih besar dari nol.';
        if (Number(formData.unit_price) < 0) newErrors.unit_price = 'Tarif tidak boleh bernilai negatif.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await onSubmit(formData);
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

    const selectedAccount = budgetAccounts.find((a) => Number(a.id) === Number(formData.budget_account_id));

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            size="lg"
            title={isEdit ? 'Ubah Data Penugasan Mitra' : 'Tambah Penugasan Mitra Baru'}
        >
            <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="max-h-[72vh] overflow-y-auto px-1 py-2 space-y-5">
                    {/* Urutan 1 & 2: Tim & Kegiatan */}
                    <FormSection
                        title="1. Kegiatan & Tim Penanggung Jawab"
                        description="Pilih tim kerja teknis dan katalog survei BPS."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TeamSelect
                                label="Tim Kerja Penanggung Jawab"
                                value={selectedTeamId}
                                onChange={(val) => {
                                    setSelectedTeamId(val);
                                    // if current task does not match new team, clear task
                                    const curr = tasks.find((t) => Number(t.id) === Number(formData.task_id));
                                    if (curr && val && Number(curr.team_id) !== Number(val)) {
                                        setFormData((p) => ({ ...p, task_id: '' }));
                                    }
                                }}
                                teams={teams}
                                disabled={isLoading}
                            />

                            <TaskSelect
                                label="Katalog Kegiatan Survei *"
                                value={formData.task_id}
                                onChange={handleTaskChange}
                                tasks={filteredTasks}
                                disabled={isLoading}
                                error={errors.task_id}
                            />
                        </div>
                    </FormSection>

                    {/* Urutan 3: Mitra */}
                    <FormSection
                        title="2. Mitra Statistik"
                        description="Pilih mitra yang akan dibebankan tanggung jawab tugas ini."
                    >
                        <MitraSelect
                            label="Mitra Statistik Penugasan *"
                            value={formData.mitra_id}
                            onChange={(val) => setFormData((p) => ({ ...p, mitra_id: val }))}
                            mitras={mitras}
                            disabled={isLoading}
                            error={errors.mitra_id}
                        />
                    </FormSection>

                    {/* Urutan 4: Tanggal Mulai & Selesai */}
                    <FormSection
                        title="3. Jadwal Pelaksanaan"
                        description="Bulan pembebanan honor ditentukan oleh tanggal mulai penugasan."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Mulai *
                                </label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))}
                                    className={`w-full h-10 px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.start_date ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled={isLoading}
                                />
                                {errors.start_date && (
                                    <p className="text-xs text-red-600 mt-1">{errors.start_date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Selesai *
                                </label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))}
                                    className={`w-full h-10 px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.end_date ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled={isLoading}
                                />
                                {errors.end_date && (
                                    <p className="text-xs text-red-600 mt-1">{errors.end_date}</p>
                                )}
                            </div>
                        </div>
                    </FormSection>

                    {/* Urutan 5, 6, 7: Volume, Satuan, Harga Satuan */}
                    <FormSection
                        title="4. Volume & Tarif Honor"
                        description="Kuantitas beban tugas dan tarif satuan yang disepakati."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Volume Tugas *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={formData.volume}
                                    onChange={(e) => setFormData((p) => ({ ...p, volume: e.target.value }))}
                                    className={`w-full h-10 px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.volume ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled={isLoading}
                                />
                                {errors.volume && (
                                    <p className="text-xs text-red-600 mt-1">{errors.volume}</p>
                                )}
                            </div>

                            <div>
                                <TextField
                                    label="Satuan Beban"
                                    value={formData.unit}
                                    onChange={(val) => setFormData((p) => ({ ...p, unit: val }))}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <MoneyInput
                                    label="Harga Satuan (Rp) *"
                                    value={formData.unit_price}
                                    onChange={(val) => setFormData((p) => ({ ...p, unit_price: val }))}
                                    disabled={isLoading}
                                />
                                {errors.unit_price && (
                                    <p className="text-xs text-red-600 mt-1">{errors.unit_price}</p>
                                )}
                            </div>
                        </div>

                        {/* Urutan 8: Akun Anggaran */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Akun Anggaran Beban (MAK / DIPA)
                            </label>
                            <select
                                value={formData.budget_account_id}
                                onChange={(e) => setFormData((p) => ({ ...p, budget_account_id: e.target.value }))}
                                className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading}
                            >
                                <option value="">-- Gunakan Akun Anggaran Default Kegiatan --</option>
                                {budgetAccounts.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.code} — {a.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </FormSection>

                    {/* Urutan 9: Ringkasan Nilai */}
                    <AssignmentSummary
                        volume={formData.volume}
                        unit={formData.unit}
                        unitPrice={formData.unit_price}
                        startDate={formData.start_date}
                        endDate={formData.end_date}
                        budgetAccountCode={selectedAccount?.code}
                    />

                    {/* Urutan 10: Validasi Batas Real-Time */}
                    <AssignmentLimitIndicator
                        simulation={simulation}
                        isLoading={simLoading}
                    />

                    {errors.limits && (
                        <div className="p-3 bg-red-50 border border-red-300 rounded text-xs text-red-700 font-medium">
                            {errors.limits}
                        </div>
                    )}
                </div>

                {/* Urutan 11: Tombol Simpan */}
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
                        disabled={isLoading || (simulation && !simulation.allowed)}
                    >
                        {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Penugasan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AssignmentFormModal;
