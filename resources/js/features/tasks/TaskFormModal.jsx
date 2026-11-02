import React, { useState, useEffect } from 'react';
import { Modal, Button, TextField, TextArea } from '@idds/react';
import { FormSection, MoneyInput } from '../../components';

export const TaskFormModal = ({
    isOpen,
    onClose,
    task = null,
    teams = [],
    budgetAccounts = [],
    onSubmit,
    isLoading = false,
}) => {
    const isEdit = Boolean(task);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        team_id: '',
        default_unit: 'Dokumen',
        default_rate: 0,
        default_budget_account_id: '',
        description: '',
        is_active: true,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (task) {
            setFormData({
                code: task.code || '',
                name: task.name || '',
                team_id: task.team_id || task.team?.id || '',
                default_unit: task.default_unit || 'Dokumen',
                default_rate: task.default_rate || 0,
                default_budget_account_id: task.default_budget_account_id || task.default_budget_account?.id || '',
                description: task.description || '',
                is_active: typeof task.is_active === 'boolean' ? task.is_active : true,
            });
        } else {
            setFormData({
                code: '',
                name: '',
                team_id: teams.length > 0 ? teams[0].id : '',
                default_unit: 'Dokumen',
                default_rate: 50000,
                default_budget_account_id: budgetAccounts.length > 0 ? budgetAccounts[0].id : '',
                description: '',
                is_active: true,
            });
        }
        setErrors({});
    }, [task, isOpen, teams, budgetAccounts]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const newErrors = {};
        if (!formData.code.trim()) newErrors.code = 'Kode kegiatan survei wajib diisi.';
        if (!formData.name.trim()) newErrors.name = 'Nama kegiatan survei wajib diisi.';
        if (!formData.team_id) newErrors.team_id = 'Tim penanggung jawab wajib dipilih.';
        if (!formData.default_unit.trim()) newErrors.default_unit = 'Satuan default wajib diisi.';
        if (Number(formData.default_rate) < 0) newErrors.default_rate = 'Tarif tidak boleh bernilai negatif.';

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

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            size="lg"
            title={isEdit ? 'Ubah Katalog Kegiatan Survei' : 'Tambah Kegiatan Survei Baru'}
        >
            <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="max-h-[72vh] overflow-y-auto px-1 py-2 space-y-5">
                    <FormSection
                        title="Identitas Kegiatan"
                        description="Kode dan nama survei/kegiatan statistik BPS."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <TextField
                                    label="Kode Kegiatan *"
                                    placeholder="Contoh: SURV-PROD-2026-01"
                                    value={formData.code}
                                    onChange={(val) => handleChange('code', val)}
                                    status={errors.code ? 'error' : 'neutral'}
                                    statusMessage={errors.code}
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <TextField
                                    label="Nama Kegiatan *"
                                    placeholder="Contoh: Survei Ubinan Padi Subround 1"
                                    value={formData.name}
                                    onChange={(val) => handleChange('name', val)}
                                    status={errors.name ? 'error' : 'neutral'}
                                    statusMessage={errors.name}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tim Kerja Penanggung Jawab *
                            </label>
                            <select
                                value={formData.team_id}
                                onChange={(e) => handleChange('team_id', e.target.value)}
                                className={`w-full h-10 px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.team_id ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isLoading}
                            >
                                <option value="">-- Pilih Tim Kerja --</option>
                                {teams.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        [{t.code}] {t.name}
                                    </option>
                                ))}
                            </select>
                            {errors.team_id && (
                                <p className="text-xs text-red-600 mt-1">{errors.team_id}</p>
                            )}
                        </div>
                    </FormSection>

                    <FormSection
                        title="Satuan & Tarif Standar"
                        description="Beban target dan estimasi honor satuan default."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Satuan Beban Tugas *
                                </label>
                                <input
                                    type="text"
                                    list="unit-suggestions"
                                    value={formData.default_unit}
                                    onChange={(e) => handleChange('default_unit', e.target.value)}
                                    placeholder="Contoh: Dokumen, Rumah Tangga..."
                                    className={`w-full h-10 px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.default_unit ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled={isLoading}
                                />
                                <datalist id="unit-suggestions">
                                    <option value="Dokumen" />
                                    <option value="Rumah Tangga" />
                                    <option value="Responden" />
                                    <option value="Blok Sensus" />
                                    <option value="Perusahaan" />
                                    <option value="Paket" />
                                </datalist>
                                {errors.default_unit && (
                                    <p className="text-xs text-red-600 mt-1">{errors.default_unit}</p>
                                )}
                            </div>

                            <div>
                                <MoneyInput
                                    label="Tarif Satuan Standar (Rp) *"
                                    value={formData.default_rate}
                                    onChange={(val) => handleChange('default_rate', val)}
                                    disabled={isLoading}
                                />
                                {errors.default_rate && (
                                    <p className="text-xs text-red-600 mt-1">{errors.default_rate}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Akun Anggaran Beban (MAK / Akun)
                            </label>
                            <select
                                value={formData.default_budget_account_id}
                                onChange={(e) => handleChange('default_budget_account_id', e.target.value)}
                                className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading}
                            >
                                <option value="">-- Tanpa Akun Anggaran Default --</option>
                                {budgetAccounts.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.code} — {a.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </FormSection>

                    <FormSection
                        title="Status & Deskripsi"
                        description="Status keaktifan katalog kegiatan survei."
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                id="task-is-active"
                                checked={formData.is_active}
                                onChange={(e) => handleChange('is_active', e.target.checked)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                            <label htmlFor="task-is-active" className="text-sm font-medium text-gray-800">
                                Aktif (Tersedia untuk pembuatan penugasan baru)
                            </label>
                        </div>

                        <TextArea
                            label="Deskripsi & Cakupan Kegiatan"
                            placeholder="Tujuan survei, cakupan responden, jadwal pelaksanaan..."
                            value={formData.description}
                            onChange={(val) => handleChange('description', val)}
                            rows={3}
                            disabled={isLoading}
                        />
                    </FormSection>
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
                        disabled={isLoading}
                    >
                        {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TaskFormModal;
