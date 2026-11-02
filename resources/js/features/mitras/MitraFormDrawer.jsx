import React, { useState, useEffect } from 'react';
import { Drawer, Button, TextField, TextArea } from '@idds/react';
import { FormSection } from '../../components';

export const MitraFormDrawer = ({
    isOpen,
    onClose,
    mitra = null,
    districts = [],
    onSubmit,
    isLoading = false,
}) => {
    const isEdit = Boolean(mitra);

    const [formData, setFormData] = useState({
        mitra_code: '',
        name: '',
        address: '',
        district_id: '',
        phone: '',
        email: '',
        occupation: '',
        status: 'active',
        notes: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (mitra) {
            setFormData({
                mitra_code: mitra.mitra_code || '',
                name: mitra.name || '',
                address: mitra.address || '',
                district_id: mitra.district_id || mitra.district?.id || '',
                phone: mitra.phone || '',
                email: mitra.email || '',
                occupation: mitra.occupation || '',
                status: mitra.status || 'active',
                notes: mitra.notes || '',
            });
        } else {
            setFormData({
                mitra_code: '',
                name: '',
                address: '',
                district_id: districts.length > 0 ? districts[0].id : '',
                phone: '',
                email: '',
                occupation: '',
                status: 'active',
                notes: '',
            });
        }
        setErrors({});
    }, [mitra, isOpen, districts]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Frontend baseline validation
        const newErrors = {};
        if (!formData.mitra_code.trim()) newErrors.mitra_code = 'Kode mitra wajib diisi.';
        if (!formData.name.trim()) newErrors.name = 'Nama lengkap mitra wajib diisi.';
        if (!formData.address.trim()) newErrors.address = 'Alamat domisili wajib diisi.';
        if (!formData.district_id) newErrors.district_id = 'Kecamatan wajib dipilih.';
        if (!formData.phone.trim()) newErrors.phone = 'Nomor kontak / HP wajib diisi.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await onSubmit(formData);
        } catch (err) {
            if (err.errors) {
                // Laravel validation errors mapping
                const mapped = {};
                Object.keys(err.errors).forEach((key) => {
                    mapped[key] = err.errors[key][0];
                });
                setErrors(mapped);
            }
        }
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            position="right"
            width="xl"
            title={isEdit ? 'Ubah Data Mitra Statistik' : 'Tambah Mitra Statistik Baru'}
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    <FormSection
                        title="Identitas & Kode Mitra"
                        description="Kode mitra bersifat unik untuk penatausahaan dan identifikasi administrasi resmi BPS."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <TextField
                                    label="Kode Mitra *"
                                    placeholder="Contoh: 3516-2026-001"
                                    value={formData.mitra_code}
                                    onChange={(val) => handleChange('mitra_code', val)}
                                    status={errors.mitra_code ? 'error' : 'neutral'}
                                    statusMessage={errors.mitra_code}
                                    disabled={isLoading}
                                />
                                <span className="text-xs text-gray-500 mt-1 block">
                                    Format seragam kode identitas mitra Kabupaten Mojokerto.
                                </span>
                            </div>
                            <div>
                                <TextField
                                    label="Nama Lengkap *"
                                    placeholder="Nama lengkap sesuai KTP"
                                    value={formData.name}
                                    onChange={(val) => handleChange('name', val)}
                                    status={errors.name ? 'error' : 'neutral'}
                                    statusMessage={errors.name}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </FormSection>

                    <FormSection
                        title="Wilayah Tugas & Kontak"
                        description="Kecamatan domisili tugas dan jalur komunikasi resmi."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kecamatan Domisili (Wilayah 3516) *
                                </label>
                                <select
                                    value={formData.district_id}
                                    onChange={(e) => handleChange('district_id', e.target.value)}
                                    className={`w-full h-10 px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.district_id ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled={isLoading}
                                >
                                    <option value="">-- Pilih Kecamatan --</option>
                                    {districts.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            [{d.code}] {d.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.district_id && (
                                    <p className="text-xs text-red-600 mt-1">{errors.district_id}</p>
                                )}
                            </div>

                            <div>
                                <TextField
                                    label="No. Telepon / WhatsApp *"
                                    placeholder="081234567890"
                                    value={formData.phone}
                                    onChange={(val) => handleChange('phone', val)}
                                    status={errors.phone ? 'error' : 'neutral'}
                                    statusMessage={errors.phone}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <TextField
                                    label="Alamat Email"
                                    placeholder="nama@email.com"
                                    value={formData.email}
                                    onChange={(val) => handleChange('email', val)}
                                    status={errors.email ? 'error' : 'neutral'}
                                    statusMessage={errors.email}
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <TextField
                                    label="Pekerjaan / Profesi Utama"
                                    placeholder="Contoh: Wiraswasta, Mahasiswa, Petani"
                                    value={formData.occupation}
                                    onChange={(val) => handleChange('occupation', val)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <TextArea
                                label="Alamat Domisili Lengkap *"
                                placeholder="Dusun, RT/RW, Desa/Kelurahan..."
                                value={formData.address}
                                onChange={(val) => handleChange('address', val)}
                                status={errors.address ? 'error' : 'neutral'}
                                statusMessage={errors.address}
                                rows={3}
                                disabled={isLoading}
                            />
                        </div>
                    </FormSection>

                    <FormSection
                        title="Status & Catatan Tambahan"
                        description="Status keaktifan mitra dan rekam jejak administrasi."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status Keaktifan
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                >
                                    <option value="active">Aktif (Tersedia untuk Penugasan)</option>
                                    <option value="inactive">Nonaktif (Tidak Ditugaskan)</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <TextArea
                                label="Catatan Administrasi"
                                placeholder="Catatan kualifikasi, pengalaman survei sebelumnya, atau informasi penting lainnya..."
                                value={formData.notes}
                                onChange={(val) => handleChange('notes', val)}
                                rows={2}
                                disabled={isLoading}
                            />
                        </div>
                    </FormSection>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
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
                        {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Mitra'}
                    </Button>
                </div>
            </form>
        </Drawer>
    );
};

export default MitraFormDrawer;
