import React, { useState, useEffect } from 'react';
import { Modal, Button, TextField } from '@idds/react';

export const UserModal = ({
    isOpen,
    onClose,
    user = null,
    roles = [],
    teams = [],
    onSubmit,
    isLoading = false,
}) => {
    const isEdit = Boolean(user);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role_ids: [],
        team_ids: [],
        is_active: true,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                phone: user.phone || '',
                role_ids: Array.isArray(user.roles) ? user.roles.map((r) => r.id) : [],
                team_ids: Array.isArray(user.teams) ? user.teams.map((t) => t.id) : [],
                is_active: typeof user.is_active === 'boolean' ? user.is_active : true,
            });
        } else {
            // Default select operator_tim if available, or first role
            const defaultRole = roles.find((r) => r.name === 'operator_tim') || roles[0];
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                role_ids: defaultRole ? [defaultRole.id] : [],
                team_ids: [],
                is_active: true,
            });
        }
        setErrors({});
    }, [user, isOpen, roles]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleRoleToggle = (roleId) => {
        setFormData((prev) => {
            const current = prev.role_ids;
            const next = current.includes(roleId)
                ? current.filter((id) => id !== roleId)
                : [...current, roleId];
            return { ...prev, role_ids: next };
        });
        if (errors.role_ids) setErrors((prev) => ({ ...prev, role_ids: null }));
    };

    const handleTeamToggle = (teamId) => {
        setFormData((prev) => {
            const current = prev.team_ids;
            const next = current.includes(teamId)
                ? current.filter((id) => id !== teamId)
                : [...current, teamId];
            return { ...prev, team_ids: next };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Nama lengkap pegawai wajib diisi.';
        if (!formData.email.trim()) newErrors.email = 'Email akun wajib diisi.';
        if (!isEdit && !formData.password.trim()) newErrors.password = 'Password akun wajib diisi.';
        if (formData.password && formData.password.length < 8) {
            newErrors.password = 'Password minimal harus 8 karakter.';
        }
        if (formData.role_ids.length === 0) {
            newErrors.role_ids = 'Pilih minimal satu peran (role) untuk akun ini.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || null,
            role_ids: formData.role_ids,
            team_ids: formData.team_ids,
            is_active: formData.is_active,
        };

        if (formData.password) {
            payload.password = formData.password;
        }

        try {
            await onSubmit(payload);
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
            title={isEdit ? 'Ubah Data Akun Pegawai' : 'Tambah Akun Pegawai Baru'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="py-2 space-y-4">
                {/* Nama Lengkap */}
                <div>
                    <TextField
                        label="Nama Lengkap Pegawai *"
                        placeholder="Contoh: Budi Prasetyo, S.Tr.Stat."
                        value={formData.name}
                        onChange={(val) => handleChange('name', val)}
                        status={errors.name ? 'error' : 'neutral'}
                        statusMessage={errors.name}
                        disabled={isLoading}
                    />
                </div>

                {/* Email & Telepon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <TextField
                            label="Alamat Email Kedinasan *"
                            placeholder="Contoh: budi.prasetyo@bpsmojokerto.id"
                            type="email"
                            value={formData.email}
                            onChange={(val) => handleChange('email', val)}
                            status={errors.email ? 'error' : 'neutral'}
                            statusMessage={errors.email}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <TextField
                            label="Nomor WhatsApp / HP"
                            placeholder="Contoh: 081234567890"
                            value={formData.phone}
                            onChange={(val) => handleChange('phone', val)}
                            status={errors.phone ? 'error' : 'neutral'}
                            statusMessage={errors.phone}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <TextField
                        label={isEdit ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Akun *'}
                        placeholder={isEdit ? '•••••••• (Biarkan kosong jika tetap)' : 'Minimal 8 karakter'}
                        type="password"
                        value={formData.password}
                        onChange={(val) => handleChange('password', val)}
                        status={errors.password ? 'error' : 'neutral'}
                        statusMessage={errors.password}
                        disabled={isLoading}
                    />
                </div>

                {/* Role / Peran */}
                <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                        Hak Akses / Peran Akun (Role) *
                    </label>
                    {errors.role_ids && (
                        <p className="text-xs text-red-600 mb-2">{errors.role_ids}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {roles.map((r) => {
                            const isSelected = formData.role_ids.includes(r.id);
                            return (
                                <label
                                    key={r.id}
                                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                        isSelected
                                            ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500/20'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleRoleToggle(r.id)}
                                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-0.5"
                                        disabled={isLoading}
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">
                                            {r.display_name || r.name}
                                        </div>
                                        {r.description && (
                                            <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                                {r.description}
                                            </div>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Tim Kerja BPS (Optional Assignment) */}
                {teams.length > 0 && (
                    <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                            Unit / Tim Kerja Penugasan (Khusus Operator Tim)
                        </label>
                        <span className="text-[11px] text-gray-500 block mb-2">
                            Pilih tim kerja teknis di mana pegawai ini bertindak sebagai penanggung jawab/operator.
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {teams.map((t) => {
                                const isChecked = formData.team_ids.includes(t.id);
                                return (
                                    <button
                                        type="button"
                                        key={t.id}
                                        onClick={() => handleTeamToggle(t.id)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                                            isChecked
                                                ? 'bg-blue-600 text-white border-blue-700'
                                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                        }`}
                                    >
                                        {t.code} - {t.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Status Aktif */}
                <div className="flex items-center gap-2 pt-2">
                    <input
                        type="checkbox"
                        id="user-is-active"
                        checked={formData.is_active}
                        onChange={(e) => handleChange('is_active', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <label htmlFor="user-is-active" className="text-sm font-medium text-gray-800">
                        Status Akun Aktif (Dapat Login ke SIMATA)
                    </label>
                </div>

                {/* Form Actions */}
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
                        {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Akun'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default UserModal;
