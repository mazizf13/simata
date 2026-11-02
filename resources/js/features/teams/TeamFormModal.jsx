import React, { useState, useEffect } from 'react';
import { Modal, Button, TextField, TextArea } from '@idds/react';

export const TeamFormModal = ({
    isOpen,
    onClose,
    team = null,
    onSubmit,
    isLoading = false,
}) => {
    const isEdit = Boolean(team);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        is_active: true,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (team) {
            setFormData({
                code: team.code || '',
                name: team.name || '',
                description: team.description || '',
                is_active: typeof team.is_active === 'boolean' ? team.is_active : true,
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
    }, [team, isOpen]);

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
        if (!formData.code.trim()) newErrors.code = 'Kode tim wajib diisi.';
        if (!formData.name.trim()) newErrors.name = 'Nama tim kerja wajib diisi.';

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
            title={isEdit ? 'Ubah Data Tim Kerja' : 'Tambah Tim Kerja Baru'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="py-2 space-y-4">
                <div>
                    <TextField
                        label="Kode Tim *"
                        placeholder="Contoh: PROD, SOS, IPDS"
                        value={formData.code}
                        onChange={(val) => handleChange('code', val.toUpperCase())}
                        status={errors.code ? 'error' : 'neutral'}
                        statusMessage={errors.code}
                        disabled={isLoading}
                    />
                    <span className="text-xs text-gray-500 mt-1 block">
                        Singkatan/kode identitas unit kerja.
                    </span>
                </div>

                <div>
                    <TextField
                        label="Nama Tim Kerja *"
                        placeholder="Contoh: Tim Statistik Produksi"
                        value={formData.name}
                        onChange={(val) => handleChange('name', val)}
                        status={errors.name ? 'error' : 'neutral'}
                        statusMessage={errors.name}
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <TextArea
                        label="Deskripsi / Fungsi Tim"
                        placeholder="Ruang lingkup survei dan tanggung jawab tugas tim..."
                        value={formData.description}
                        onChange={(val) => handleChange('description', val)}
                        rows={3}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input
                        type="checkbox"
                        id="team-is-active"
                        checked={formData.is_active}
                        onChange={(e) => handleChange('is_active', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <label htmlFor="team-is-active" className="text-sm font-medium text-gray-800">
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
                        {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Tim'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TeamFormModal;
