import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, Button, TextField, TextArea } from '@idds/react';
import { FormSection, MitraSelect, CustomDatePicker } from '../../components';
import { masterDataService } from '../../services/masterDataService';
import { formatLocalDate } from '../../utils/formatters';

export const SpkFormModal = ({
    isOpen,
    onClose,
    spk = null,
    onSubmit,
    isLoading = false,
    initialMitraId = null,
    mitras = null,
}) => {
    const isEdit = Boolean(spk);

    // Fetch active mitras if not provided or empty
    const { data: fetchedMitras = [] } = useQuery({
        queryKey: ['mitras', 'all-active'],
        queryFn: async () => {
            const res = await masterDataService.getMitras({ per_page: 200, status: 'active' });
            return res.data || [];
        },
        enabled: isOpen && (!mitras || mitras.length === 0),
    });

    const mitrasList = mitras && mitras.length > 0 ? mitras : fetchedMitras;

    const availableMitras = useMemo(() => {
        if (spk?.mitra && !mitrasList.some((m) => m.id === spk.mitra.id)) {
            return [spk.mitra, ...mitrasList];
        }
        return mitrasList;
    }, [mitrasList, spk]);

    const [formData, setFormData] = useState({
        mitra_id: '',
        spk_number: '',
        contract_date: formatLocalDate(),
        period_start: '',
        period_end: '',
        occupation: 'Mitra Statistik',
        position: 'Pencacah Lapangan',
        work_address: 'Kabupaten Mojokerto',
        notes: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (spk) {
            setFormData({
                mitra_id: spk.mitra_id || '',
                spk_number: spk.spk_number || '',
                contract_date: spk.contract_date || formatLocalDate(),
                period_start: spk.period_start || '',
                period_end: spk.period_end || '',
                occupation: spk.occupation || 'Mitra Statistik',
                position: spk.position || '',
                work_address: spk.work_address || 'Kabupaten Mojokerto',
                notes: spk.notes || '',
            });
        } else {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const firstDay = `${year}-${month}-01`;
            const lastDay = formatLocalDate(new Date(year, today.getMonth() + 1, 0));

            setFormData({
                mitra_id: initialMitraId || '',
                spk_number: '',
                contract_date: formatLocalDate(),
                period_start: firstDay,
                period_end: lastDay,
                occupation: 'Mitra Statistik',
                position: 'Pencacah Lapangan',
                work_address: 'Kabupaten Mojokerto',
                notes: '',
            });
        }
        setErrors({});
    }, [spk, isOpen, initialMitraId]);

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
        if (!formData.mitra_id) {
            newErrors.mitra_id = 'Mitra statistik wajib dipilih';
        }
        if (!formData.spk_number.trim()) {
            newErrors.spk_number = 'Nomor SPK wajib diisi';
        }
        if (!formData.contract_date) {
            newErrors.contract_date = 'Tanggal SPK wajib diisi';
        }
        if (!formData.period_start) {
            newErrors.period_start = 'Tanggal awal periode kontrak wajib diisi';
        }
        if (!formData.period_end) {
            newErrors.period_end = 'Tanggal akhir periode kontrak wajib diisi';
        } else if (formData.period_start && formData.period_end < formData.period_start) {
            newErrors.period_end = 'Tanggal akhir tidak boleh lebih awal dari tanggal awal';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await onSubmit(formData);
        } catch (err) {
            if (err.errors) {
                setErrors(err.errors);
            } else if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({
                    general: err.message || err.response?.data?.message || 'Terjadi kesalahan sistem',
                });
            }
        }
    };

    return (
        <Modal
            open={isOpen}
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Ubah Surat Perjanjian Kerja (SPK)' : 'Buat Surat Perjanjian Kerja (SPK) Baru'}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
                        {errors.general}
                    </div>
                )}

                <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 pb-44">
                    {/* Section 1: Mitra & Nomor SPK */}
                    <FormSection
                        title="Informasi Mitra & Nomor Kontrak"
                        description="Pastikan nomor SPK unik dan mitra berstatus aktif di database."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <MitraSelect
                                    label="Pilih Mitra Statistik *"
                                    value={formData.mitra_id}
                                    onChange={(val) => handleChange('mitra_id', val)}
                                    disabled={isLoading || (isEdit && spk?.tasks_count > 0)}
                                    error={errors.mitra_id}
                                    mitras={availableMitras}
                                />
                            </div>

                            <div>
                                <TextField
                                    label="Nomor SPK *"
                                    placeholder="Contoh: 015/SPK/3516/2026"
                                    value={formData.spk_number}
                                    onChange={(val) => handleChange('spk_number', val)}
                                    status={errors.spk_number ? 'error' : 'neutral'}
                                    statusMessage={errors.spk_number}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <CustomDatePicker
                                    label="Tanggal SPK *"
                                    value={formData.contract_date}
                                    onChange={(val) => handleChange('contract_date', val)}
                                    placeholder="Pilih tanggal SPK..."
                                    error={errors.contract_date}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <CustomDatePicker
                                    label="Periode Mulai *"
                                    value={formData.period_start}
                                    onChange={(val) => handleChange('period_start', val)}
                                    placeholder="Pilih tanggal mulai..."
                                    error={errors.period_start}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <CustomDatePicker
                                    label="Periode Selesai *"
                                    value={formData.period_end}
                                    onChange={(val) => handleChange('period_end', val)}
                                    placeholder="Pilih tanggal selesai..."
                                    minDate={formData.period_start}
                                    error={errors.period_end}
                                    disabled={isLoading}
                                    align="right"
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* Section 2: Detail Pekerjaan */}
                    <FormSection
                        title="Ketentuan Perjanjian Kerja"
                        description="Identitas jabatan dan wilayah kerja dalam klausul kontrak."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <TextField
                                    label="Pekerjaan / Jabatan"
                                    placeholder="Contoh: Pencacah Lapangan / Petugas Editing"
                                    value={formData.position}
                                    onChange={(val) => handleChange('position', val)}
                                    status={errors.position ? 'error' : 'neutral'}
                                    statusMessage={errors.position}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <TextField
                                    label="Kategori / Klasifikasi"
                                    placeholder="Contoh: Mitra Statistik"
                                    value={formData.occupation}
                                    onChange={(val) => handleChange('occupation', val)}
                                    status={errors.occupation ? 'error' : 'neutral'}
                                    statusMessage={errors.occupation}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <TextField
                                label="Wilayah / Alamat Kerja"
                                placeholder="Contoh: Kabupaten Mojokerto / Kecamatan Jatirejo"
                                value={formData.work_address}
                                onChange={(val) => handleChange('work_address', val)}
                                status={errors.work_address ? 'error' : 'neutral'}
                                statusMessage={errors.work_address}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="mt-4">
                            <TextArea
                                label="Catatan Tambahan"
                                placeholder="Keterangan khusus kontrak atau klausul administrasi..."
                                value={formData.notes}
                                onChange={(val) => handleChange('notes', val)}
                                rows={2}
                                disabled={isLoading}
                            />
                        </div>
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
                        {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat SPK'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default SpkFormModal;
