import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, TextField, TextArea } from '@idds/react';
import { FormSection, MoneyInput, CustomSelect } from '../../components';
import { IconSparkles, IconRefresh } from '@tabler/icons-react';
import { masterDataService } from '../../services/masterDataService';

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
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);

    const fetchAutoCode = useCallback(async (targetTeamId) => {
        if (!targetTeamId) return;
        try {
            setIsGeneratingCode(true);
            const res = await masterDataService.getNextTaskCode(targetTeamId);
            const generated = res?.data?.code || res?.code;
            if (generated) {
                setFormData((prev) => ({ ...prev, code: generated }));
            }
        } catch (err) {
            console.warn('Gagal mengambil kode kegiatan otomatis:', err);
            const selectedTeam = teams.find((t) => Number(t.id) === Number(targetTeamId));
            const teamCode = selectedTeam ? selectedTeam.code.toUpperCase() : 'BPS';
            const year = new Date().getFullYear();
            setFormData((prev) => ({ ...prev, code: `SURV-${teamCode}-${year}-01` }));
        } finally {
            setIsGeneratingCode(false);
        }
    }, [teams]);

    useEffect(() => {
        if (!isOpen) return;

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
            const defaultTeamId = teams.length > 0 ? teams[0].id : '';
            setFormData({
                code: '',
                name: '',
                team_id: defaultTeamId,
                default_unit: 'Dokumen',
                default_rate: 50000,
                default_budget_account_id: budgetAccounts.length > 0 ? budgetAccounts[0].id : '',
                description: '',
                is_active: true,
            });

            // Otomatis buat kode kegiatan per tim yang dipilih
            if (defaultTeamId) {
                fetchAutoCode(defaultTeamId);
            }
        }
        setErrors({});
    }, [task, isOpen]); // Hanya dijalankan saat modal dibuka atau task diedit

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }

        // Jika mengubah tim kerja pada form baru, perbarui kode kegiatan otomatis per tim
        if (field === 'team_id' && !isEdit && value) {
            fetchAutoCode(value);
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
                <div className="max-h-[72vh] overflow-y-auto px-1 py-2 pb-44 space-y-5">
                    <FormSection
                        title="Identitas Kegiatan"
                        description="Kode dan nama survei/kegiatan statistik BPS."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-1 h-5">
                                    <label className="text-sm font-medium text-gray-700">
                                        Kode Kegiatan <span className="text-red-500">*</span>
                                    </label>
                                    {!isEdit && (
                                        <button
                                            type="button"
                                            onClick={() => fetchAutoCode(formData.team_id)}
                                            disabled={isLoading || isGeneratingCode}
                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 disabled:opacity-50"
                                            title="Buat kode kegiatan otomatis per tim"
                                        >
                                            <IconRefresh size={13} className={isGeneratingCode ? 'animate-spin' : ''} />
                                            <span>{isGeneratingCode ? 'Membuat...' : 'Buat Otomatis'}</span>
                                        </button>
                                    )}
                                </div>
                                <TextField
                                    placeholder="Contoh: SURV-PROD-2026-01"
                                    value={formData.code}
                                    onChange={(val) => handleChange('code', val.toUpperCase())}
                                    status={errors.code ? 'error' : 'neutral'}
                                    statusMessage={errors.code}
                                    disabled={isLoading || isGeneratingCode}
                                />
                            </div>
                            <div>
                                <div className="flex items-center mb-1 h-5">
                                    <label className="text-sm font-medium text-gray-700">
                                        Nama Kegiatan <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                <TextField
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
                            <CustomSelect
                                label="Tim Kerja Penanggung Jawab *"
                                value={formData.team_id}
                                onChange={(val) => handleChange('team_id', val)}
                                placeholder="-- Pilih Tim Kerja --"
                                options={[
                                    { value: '', label: '-- Pilih Tim Kerja --' },
                                    ...teams.map((t) => ({
                                        value: t.id,
                                        label: `[${t.code}] ${t.name}`,
                                        badge: t.code,
                                    })),
                                ]}
                                error={errors.team_id}
                                disabled={isLoading}
                            />
                        </div>
                    </FormSection>

                    <FormSection
                        title="Satuan & Tarif Standar"
                        description="Beban target dan estimasi honor satuan default."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <CustomSelect
                                    label="Satuan Beban Tugas *"
                                    value={formData.default_unit}
                                    onChange={(val) => handleChange('default_unit', val)}
                                    placeholder="-- Pilih Satuan Beban --"
                                    options={[
                                        { value: 'Dokumen', label: 'Dokumen' },
                                        { value: 'Rumah Tangga', label: 'Rumah Tangga' },
                                        { value: 'Responden', label: 'Responden' },
                                        { value: 'Blok Sensus', label: 'Blok Sensus' },
                                        { value: 'Perusahaan', label: 'Perusahaan' },
                                        { value: 'Paket', label: 'Paket' },
                                        { value: 'Desa', label: 'Desa / Kelurahan' },
                                        { value: 'Kecamatan', label: 'Kecamatan' },
                                        { value: 'SLS', label: 'Satuan Lingkungan Setempat (SLS)' },
                                    ]}
                                    error={errors.default_unit}
                                    disabled={isLoading}
                                />
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
                            <CustomSelect
                                label="Akun Anggaran Beban (MAK / Akun)"
                                value={formData.default_budget_account_id}
                                onChange={(val) => handleChange('default_budget_account_id', val)}
                                placeholder="-- Tanpa Akun Anggaran Default --"
                                options={[
                                    { value: '', label: '-- Tanpa Akun Anggaran Default --' },
                                    ...budgetAccounts.map((a) => ({
                                        value: a.id,
                                        label: `${a.code} — ${a.name}`,
                                        badge: a.code,
                                    })),
                                ]}
                                disabled={isLoading}
                            />
                        </div>
                    </FormSection>

                    <FormSection
                        title="Status & Deskripsi"
                        description="Status keaktifan katalog kegiatan survei."
                    >
                        <div className="mb-4">
                            <CustomSelect
                                label="Status Keaktifan Kegiatan *"
                                value={formData.is_active ? 1 : 0}
                                onChange={(val) => handleChange('is_active', Number(val) === 1)}
                                options={[
                                    { value: 1, label: 'Aktif (Tersedia untuk pembuatan penugasan baru)', badge: 'Aktif' },
                                    { value: 0, label: 'Nonaktif (Tidak dapat dipilih dalam penugasan)', badge: 'Nonaktif' },
                                ]}
                                disabled={isLoading}
                            />
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
