import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, Button, TextField, TextArea } from '@idds/react';
import { IconRefresh, IconFileCertificate } from '@tabler/icons-react';
import { FormSection, CustomDatePicker, CustomSelect } from '../../components';
import { bastService } from '../../services/bastService';
import { spkService } from '../../services/spkService';
import { formatLocalDate } from '../../utils/formatters';

export const BastFormModal = ({
    isOpen,
    onClose,
    bast = null,
    spk = null,
    onSubmit,
    isLoading = false,
}) => {
    const isEdit = Boolean(bast);

    // Fetch SPKs for standalone creation if SPK is not pre-provided
    const { data: spksResponse } = useQuery({
        queryKey: ['spks', 'available-for-bast'],
        queryFn: async () => {
            const res = await spkService.getSpks({ per_page: 100 });
            return res.data || [];
        },
        enabled: isOpen && !spk && !bast,
    });

    const availableSpks = spksResponse || [];

    const [formData, setFormData] = useState({
        spk_id: '',
        bast_number: '',
        bast_date: formatLocalDate(),
        notes: '',
    });

    const [errors, setErrors] = useState({});
    const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);

    const fetchAutoNumber = useCallback(async (targetDate) => {
        try {
            setIsGeneratingNumber(true);
            const res = await bastService.getNextNumber(targetDate || formatLocalDate());
            const generated = res?.data?.bast_number || res?.bast_number;
            if (generated) {
                setFormData((prev) => ({ ...prev, bast_number: generated }));
            }
        } catch (err) {
            console.warn('Gagal generate nomor BAST otomatis:', err);
        } finally {
            setIsGeneratingNumber(false);
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        if (bast) {
            setFormData({
                spk_id: bast.spk_id || '',
                bast_number: bast.bast_number || '',
                bast_date: bast.bast_date || formatLocalDate(),
                notes: bast.notes || '',
            });
        } else {
            const targetSpkId = spk ? spk.id : '';
            const initialDate = spk?.period_end || formatLocalDate();

            setFormData({
                spk_id: targetSpkId,
                bast_number: '',
                bast_date: initialDate,
                notes: 'Pekerjaan lapangan telah diselesaikan dengan baik dan lengkap sesuai target.',
            });

            // Otomatis generate nomor BAST
            fetchAutoNumber(initialDate);
        }
        setErrors({});
    }, [bast, isOpen, spk]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }

        if (field === 'bast_date' && !isEdit && value) {
            fetchAutoNumber(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const newErrors = {};
        if (!formData.spk_id) {
            newErrors.spk_id = 'Surat Perjanjian Kerja (SPK) wajib dipilih.';
        }
        if (!formData.bast_number.trim()) {
            newErrors.bast_number = 'Nomor BAST wajib diisi.';
        }
        if (!formData.bast_date) {
            newErrors.bast_date = 'Tanggal BAST wajib diisi.';
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
                    general: err.message || err.response?.data?.message || 'Terjadi kesalahan sistem.',
                });
            }
        }
    };

    return (
        <Modal
            open={isOpen}
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Ubah Berita Acara Serah Terima (BAST)' : 'Buat Berita Acara Serah Terima (BAST) Baru'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {errors.general && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
                        {errors.general}
                    </div>
                )}

                <div className="space-y-5 max-h-[72vh] overflow-y-auto px-1 pb-44">
                    <FormSection
                        title="Identitas BAST & Rujukan SPK"
                        description="BAST mengikat rujukan Perjanjian Kerja dan bukti fisik penyerahan volume pekerjaan."
                    >
                        {/* Pilihan SPK */}
                        {spk ? (
                            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                                <IconFileCertificate className="text-blue-700 shrink-0 mt-0.5" size={20} />
                                <div className="text-sm">
                                    <span className="font-semibold text-blue-950 block">
                                        Rujukan SPK: {spk.spk_number}
                                    </span>
                                    <span className="text-blue-800 text-xs block mt-0.5">
                                        Mitra: {spk.mitra?.name || '-'} | Periode: {spk.period_start} s.d. {spk.period_end}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <CustomSelect
                                    label="Pilih Surat Perjanjian Kerja (SPK) *"
                                    value={formData.spk_id}
                                    onChange={(val) => handleChange('spk_id', val)}
                                    placeholder="-- Pilih SPK Terkait --"
                                    options={[
                                        { value: '', label: '-- Pilih SPK Terkait --' },
                                        ...availableSpks.map((s) => ({
                                            value: s.id,
                                            label: `${s.spk_number} - ${s.mitra?.name || 'Mitra'}`,
                                            badge: typeof s.status === 'object' ? s.status?.label : s.status,
                                        })),
                                    ]}
                                    error={errors.spk_id}
                                    disabled={isLoading || isEdit}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {/* Nomor BAST */}
                            <div>
                                <div className="flex items-center justify-between mb-1 h-5">
                                    <label className="text-sm font-medium text-gray-700">
                                        Nomor BAST <span className="text-red-500">*</span>
                                    </label>
                                    {!isEdit && (
                                        <button
                                            type="button"
                                            onClick={() => fetchAutoNumber(formData.bast_date)}
                                            disabled={isLoading || isGeneratingNumber}
                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 disabled:opacity-50"
                                            title="Generate ulang nomor BAST otomatis"
                                        >
                                            <IconRefresh size={13} className={isGeneratingNumber ? 'animate-spin' : ''} />
                                            <span>{isGeneratingNumber ? 'Membuat...' : 'Buat Otomatis'}</span>
                                        </button>
                                    )}
                                </div>
                                <TextField
                                    placeholder="Contoh: 001/3516/BAST.1/XI/2026"
                                    value={formData.bast_number}
                                    onChange={(val) => handleChange('bast_number', val)}
                                    status={errors.bast_number ? 'error' : 'neutral'}
                                    statusMessage={errors.bast_number}
                                    disabled={isLoading || isGeneratingNumber}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Format baku: <code>001/3516/BAST.N/Bulan/Tahun</code> (urut mulai dari 1 per bulan).
                                </p>
                            </div>

                            {/* Tanggal BAST */}
                            <div>
                                <div className="flex items-center mb-1 h-5">
                                    <label className="text-sm font-medium text-gray-700">
                                        Tanggal BAST <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                <CustomDatePicker
                                    value={formData.bast_date}
                                    onChange={(val) => handleChange('bast_date', val)}
                                    placeholder="Pilih tanggal serah terima..."
                                    error={errors.bast_date}
                                    disabled={isLoading}
                                    direction="down"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Biasanya tanggal hari kerja akhir pelaksanaan survei.
                                </p>
                            </div>
                        </div>

                        {/* Catatan / Keterangan Penyerahan */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Catatan Hasil Pemeriksaan / Keterangan Penyerahan
                            </label>
                            <TextArea
                                placeholder="Contoh: Seluruh dokumen survei telah diterima dalam kondisi lengkap dan telah melalui verifikasi ketua tim."
                                value={formData.notes}
                                onChange={(val) => handleChange('notes', val)}
                                rows={3}
                                disabled={isLoading}
                            />
                        </div>
                    </FormSection>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat BAST'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default BastFormModal;
