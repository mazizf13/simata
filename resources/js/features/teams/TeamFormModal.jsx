import React, { useState, useEffect } from 'react';
import { Modal, Button, TextField, TextArea } from '@idds/react';

export const TeamFormModal = ({
    isOpen,
    onClose,
    team = null,
    users = [],
    onSubmit,
    isLoading = false,
}) => {
    const isEdit = Boolean(team);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        is_active: true,
        user_ids: [],
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (team) {
            setFormData({
                code: team.code || '',
                name: team.name || '',
                description: team.description || '',
                is_active: typeof team.is_active === 'boolean' ? team.is_active : true,
                user_ids: Array.isArray(team.users) ? team.users.map((u) => u.id) : [],
            });
        } else {
            setFormData({
                code: '',
                name: '',
                description: '',
                is_active: true,
                user_ids: [],
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
            size="lg"
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
                        rows={2}
                        disabled={isLoading}
                    />
                </div>

                {/* Pengguna / Operator Tim */}
                <div className="border border-gray-200 rounded-lg p-3.5 bg-gray-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-xs font-semibold text-gray-800 block">
                                Pengguna Operator Tim ({formData.user_ids.length} dipilih)
                            </label>
                            <span className="text-[11px] text-gray-500">
                                Tetapkan akun pegawai BPS sebagai penanggung jawab / operator tim ini
                            </span>
                        </div>
                    </div>
                    <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-100 bg-white p-2 rounded-md border border-gray-200">
                        {users.length === 0 ? (
                            <p className="text-xs text-gray-400 italic py-3 text-center">
                                Tidak ada data pengguna pegawai yang aktif.
                            </p>
                        ) : (
                            users.map((u) => {
                                const isChecked = formData.user_ids.includes(u.id);
                                return (
                                    <label
                                        key={u.id}
                                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                            isChecked ? 'bg-blue-50/80 border border-blue-200' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const next = e.target.checked
                                                        ? [...formData.user_ids, u.id]
                                                        : formData.user_ids.filter((id) => id !== u.id);
                                                    handleChange('user_ids', next);
                                                }}
                                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                disabled={isLoading}
                                            />
                                            <div>
                                                <div className="text-xs font-semibold text-gray-900">{u.name}</div>
                                                <div className="text-[11px] text-gray-500">{u.email}</div>
                                            </div>
                                        </div>
                                        {u.roles && u.roles.length > 0 && (
                                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                                                {u.roles.map((r) => r.label || r.name).join(', ')}
                                            </span>
                                        )}
                                    </label>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
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
