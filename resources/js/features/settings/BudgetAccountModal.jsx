import React, { useState, useEffect } from 'react';
import { Modal, Button, TextField, TextArea } from '@idds/react';

export const BudgetAccountModal = ({
    isOpen,
    onClose,
    account = null,
    onSubmit,
    isLoading = false,
}) => {
    const isEdit = Boolean(account);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        is_active: true,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (account) {
            setFormData({
                code: account.code || '',
                name: account.name || '',
                description: account.description || '',
                is_active: typeof account.is_active === 'boolean' ? account.is_active : true,
            });
        } else {
            setFormData({
                code: '',
                name: '',
                description: '',
                is_active: true,
            });
        }
        setErrors({});
    }, [account, isOpen]);

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
        if (!formData.code.trim()) newErrors.code = 'Kode akun anggaran wajib diisi.';
        if (!formData.name.trim()) newErrors.name = 'Nama akun anggaran wajib diisi.';

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
            title={isEdit ? 'Ubah Akun Anggaran (MAK)' : 'Tambah Akun Anggaran Baru'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="py-2 space-y-4">
                <div>
                    <TextField
                        label="Kode Akun Anggaran (MAK) *"
                        placeholder="Contoh: 8130.BMA.007.005.521213"
                        value={formData.code}
                        onChange={(val) => handleChange('code', val)}
                        status={errors.code ? 'error' : 'neutral'}
                        statusMessage={errors.code}
                        disabled={isLoading}
                    />
                    <span className="text-xs text-gray-500 mt-1 block">
                        Format kode alokasi DIPA resmi BPS (harus tetap berupa teks/string).
                    </span>
                </div>

                <div>
                    <TextField
                        label="Nama Akun Anggaran *"
                        placeholder="Contoh: Honor Pengolahan Data Produksi"
                        value={formData.name}
                        onChange={(val) => handleChange('name', val)}
                        status={errors.name ? 'error' : 'neutral'}
                        statusMessage={errors.name}
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <TextArea
                        label="Deskripsi / Catatan Pembebanan"
                        placeholder="Keterangan alokasi pagu DIPA atau rincian kegiatan terkait..."
                        value={formData.description}
                        onChange={(val) => handleChange('description', val)}
                        rows={3}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input
                        type="checkbox"
                        id="account-is-active"
                        checked={formData.is_active}
                        onChange={(e) => handleChange('is_active', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <label htmlFor="account-is-active" className="text-sm font-medium text-gray-800">
                        Status Aktif
                    </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
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
                        {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Akun'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default BudgetAccountModal;
