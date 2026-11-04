import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ContentContainer,
    PageHeader,
    FormSection,
    CardContainer,
    DataTable,
    StatusBadge,
    ConfirmDialog,
    MoneyInput,
} from '../../components';
import { Button, TextField, Toggle } from '@idds/react';
import {
    IconUsers,
    IconMapPin,
    IconAdjustments,
    IconPlus,
    IconEdit,
    IconUserCheck,
    IconUserX,
    IconSearch,
    IconShield,
} from '@tabler/icons-react';
import userService from '../../services/userService';
import masterDataService from '../../services/masterDataService';
import UserModal from './UserModal';

export const SettingsPage = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('users');

    // Users state
    const [userPage, setUserPage] = useState(1);
    const [userSearch, setUserSearch] = useState('');
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [toggleStatusDialog, setToggleStatusDialog] = useState({
        open: false,
        user: null,
    });

    // Fetch users
    const {
        data: usersResponse,
        isLoading: usersLoading,
    } = useQuery({
        queryKey: ['users', { page: userPage, search: userSearch }],
        queryFn: async () => {
            return await userService.getUsers({ page: userPage, search: userSearch, per_page: 15 });
        },
    });

    const usersList = usersResponse?.data || [];
    const usersMeta = usersResponse?.meta || { current_page: 1, last_page: 1, total: 0 };

    // Fetch roles
    const { data: rolesResponse } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            return await userService.getRoles();
        },
    });
    const rolesList = rolesResponse?.data || [];

    // Fetch active teams
    const { data: teamsData } = useQuery({
        queryKey: ['teams', 'active'],
        queryFn: async () => {
            const res = await masterDataService.getActiveTeams();
            return res?.data || [];
        },
    });
    const teamsList = Array.isArray(teamsData) ? teamsData : (teamsData?.data || []);

    // Fetch districts (18 official districts)
    const {
        data: districtsResponse,
        isLoading: districtsLoading,
    } = useQuery({
        queryKey: ['districts', 'all'],
        queryFn: async () => {
            return await masterDataService.getDistricts({ per_page: 30 });
        },
    });
    const districtsList = districtsResponse?.data || [];

    // User mutations
    const createUserMutation = useMutation({
        mutationFn: (data) => userService.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setUserModalOpen(false);
            setSelectedUser(null);
        },
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }) => userService.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setUserModalOpen(false);
            setSelectedUser(null);
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id) => userService.toggleUserStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setToggleStatusDialog({ open: false, user: null });
        },
    });

    const handleOpenCreateUser = () => {
        setSelectedUser(null);
        setUserModalOpen(true);
    };

    const handleOpenEditUser = (user) => {
        setSelectedUser(user);
        setUserModalOpen(true);
    };

    const handleUserSubmit = async (formData) => {
        if (selectedUser) {
            return await updateUserMutation.mutateAsync({
                id: selectedUser.id,
                data: formData,
            });
        } else {
            return await createUserMutation.mutateAsync(formData);
        }
    };

    const handleConfirmToggleStatus = async () => {
        if (!toggleStatusDialog.user) return;
        await toggleStatusMutation.mutateAsync(toggleStatusDialog.user.id);
    };

    // Columns for Users Table
    const userColumns = [
        {
            key: 'name',
            header: 'Nama Pegawai & Email',
            render: (row) => (
                <div>
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                        {row.name}
                        {row.primary_role === 'super_admin' && (
                            <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-1.5 py-0.5 rounded">
                                Super
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{row.email}</div>
                </div>
            ),
        },
        {
            key: 'phone',
            header: 'Kontak WhatsApp / HP',
            render: (row) => (
                <span className="text-xs font-mono text-gray-600">
                    {row.phone || '-'}
                </span>
            ),
        },
        {
            key: 'roles',
            header: 'Peran / Hak Akses',
            render: (row) => {
                if (!row.roles || row.roles.length === 0) {
                    return <span className="text-xs text-gray-400 italic">Belum ada peran</span>;
                }
                return (
                    <div className="flex flex-wrap gap-1">
                        {row.roles.map((r) => {
                            let badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
                            if (r.name === 'super_admin') badgeClass = 'bg-purple-100 text-purple-800 border-purple-200';
                            if (r.name === 'pimpinan') badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
                            if (r.name === 'operator_tim') badgeClass = 'bg-teal-100 text-teal-800 border-teal-200';

                            return (
                                <span
                                    key={r.id}
                                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badgeClass}`}
                                >
                                    {r.label || r.display_name || r.name}
                                </span>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            key: 'teams',
            header: 'Tim Ditugaskan',
            render: (row) => {
                if (!row.teams || row.teams.length === 0) {
                    return <span className="text-xs text-gray-400">-</span>;
                }
                return (
                    <div className="flex flex-wrap gap-1">
                        {row.teams.map((t) => (
                            <span
                                key={t.id}
                                className="text-[10px] font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200"
                            >
                                {t.code}
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            key: 'is_active',
            header: 'Status Akun',
            render: (row) => (
                <StatusBadge status={row.is_active ? 'active' : 'inactive'} />
            ),
        },
        {
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (row) => (
                <div className="flex items-center justify-end gap-1.5">
                    <button
                        type="button"
                        onClick={() => handleOpenEditUser(row)}
                        className="p-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="Ubah Data Akun"
                    >
                        <IconEdit size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setToggleStatusDialog({ open: true, user: row })}
                        className={`p-1.5 rounded transition-colors ${
                            row.is_active
                                ? 'text-gray-500 hover:text-red-700 hover:bg-red-50'
                                : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={row.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                    >
                        {row.is_active ? <IconUserX size={16} /> : <IconUserCheck size={16} />}
                    </button>
                </div>
            ),
        },
    ];

    // Columns for Districts
    const districtColumns = [
        {
            key: 'code',
            header: 'Kode Wilayah BPS',
            render: (row) => (
                <div className="font-mono text-xs font-semibold text-blue-900 bg-blue-50 px-2 py-1 rounded border border-blue-200 inline-block">
                    {row.code}
                </div>
            ),
        },
        {
            key: 'name',
            header: 'Nama Kecamatan',
            render: (row) => <span className="font-medium text-gray-900">{row.name}</span>,
        },
        {
            key: 'regency',
            header: 'Kabupaten / Kota',
            render: () => <span className="text-sm text-gray-700">Kabupaten Mojokerto (3516)</span>,
        },
        {
            key: 'status',
            header: 'Status Wilayah',
            render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} />,
        },
    ];

    return (
        <ContentContainer>
            <PageHeader
                title="Pengaturan Sistem & Hak Akses"
                subtitle="Pengelolaan akun pegawai pengguna SIMATA, referensi wilayah kecamatan BPS Mojokerto, dan batas kebijakan"
            />

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6 bg-white rounded-t-lg px-4 pt-2 shadow-xs">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-all ${
                            activeTab === 'users'
                                ? 'border-blue-700 text-blue-800 font-semibold bg-blue-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                        }`}
                    >
                        <IconUsers size={16} />
                        Pengguna & Hak Akses
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('districts')}
                        className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-all ${
                            activeTab === 'districts'
                                ? 'border-blue-700 text-blue-800 font-semibold bg-blue-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                        }`}
                    >
                        <IconMapPin size={16} />
                        18 Kecamatan Resmi (3516)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('limits')}
                        className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-all ${
                            activeTab === 'limits'
                                ? 'border-blue-700 text-blue-800 font-semibold bg-blue-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                        }`}
                    >
                        <IconAdjustments size={16} />
                        Batas Bulanan & Kebijakan
                    </button>
                </div>
            </div>

            {/* Tab 1: Pengguna & Hak Akses */}
            {activeTab === 'users' && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 border border-gray-200 rounded-lg shadow-xs">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">
                                Daftar Pengguna Pegawai BPS
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Akun pegawai terdaftar yang memiliki hak akses login dan dapat ditetapkan sebagai operator tim kerja.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                hierarchy="primary"
                                size="sm"
                                prefixIcon={<IconPlus size={16} />}
                                onClick={handleOpenCreateUser}
                            >
                                Tambah Akun Pegawai
                            </Button>
                        </div>
                    </div>

                    {/* Search filter */}
                    <div className="bg-white p-3 border border-gray-200 rounded-lg flex items-center gap-2 max-w-md">
                        <IconSearch size={18} className="text-gray-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama, email, atau no. telepon..."
                            value={userSearch}
                            onChange={(e) => {
                                setUserSearch(e.target.value);
                                setUserPage(1);
                            }}
                            className="w-full text-xs bg-transparent border-none focus:outline-none text-gray-800"
                        />
                    </div>

                    <DataTable
                        columns={userColumns}
                        data={usersList}
                        isLoading={usersLoading}
                        emptyTitle="Belum Ada Pengguna Terdaftar"
                        emptyDescription="Klik 'Tambah Akun Pegawai' untuk mendaftarkan akun pegawai BPS baru."
                        pagination={{
                            currentPage: usersMeta.current_page,
                            totalPages: usersMeta.last_page,
                            totalItems: usersMeta.total,
                            perPage: usersMeta.per_page,
                            onPageChange: (newPage) => setUserPage(newPage),
                        }}
                    />

                    <UserModal
                        isOpen={userModalOpen}
                        onClose={() => {
                            setUserModalOpen(false);
                            setSelectedUser(null);
                        }}
                        user={selectedUser}
                        roles={rolesList}
                        teams={teamsList}
                        onSubmit={handleUserSubmit}
                        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
                    />

                    <ConfirmDialog
                        open={toggleStatusDialog.open}
                        onClose={() => setToggleStatusDialog({ open: false, user: null })}
                        onConfirm={handleConfirmToggleStatus}
                        title={
                            toggleStatusDialog.user?.is_active
                                ? 'Nonaktifkan Akun Pegawai'
                                : 'Aktifkan Akun Pegawai'
                        }
                        description={`Apakah Anda yakin ingin ${
                            toggleStatusDialog.user?.is_active ? 'menonaktifkan' : 'mengaktifkan kembali'
                        } akun "${toggleStatusDialog.user?.name || ''}" (${
                            toggleStatusDialog.user?.email || ''
                        })?`}
                        confirmText={
                            toggleStatusDialog.user?.is_active
                                ? 'Ya, Nonaktifkan'
                                : 'Ya, Aktifkan'
                        }
                        cancelText="Batal"
                        danger={toggleStatusDialog.user?.is_active}
                        isLoading={toggleStatusMutation.isPending}
                    />
                </div>
            )}

            {/* Tab 2: Referensi Kecamatan */}
            {activeTab === 'districts' && (
                <div className="space-y-4">
                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xs">
                        <h2 className="text-sm font-bold text-gray-900">
                            18 Kecamatan Resmi Kabupaten Mojokerto (Wilayah 3516)
                        </h2>
                        <p className="text-xs text-gray-500">
                            Referensi master wilayah resmi BPS Kabupaten Mojokerto berdasarkan master wilayah BPS.
                        </p>
                    </div>

                    <DataTable
                        columns={districtColumns}
                        data={districtsList}
                        isLoading={districtsLoading}
                        emptyTitle="Data Kecamatan Belum Dimuat"
                        emptyDescription="Data referensi 18 kecamatan resmi Kabupaten Mojokerto dimuat melalui seeder database."
                    />
                </div>
            )}

            {/* Tab 3: Batas Bulanan & Validasi */}
            {activeTab === 'limits' && (
                <div className="max-w-3xl space-y-6">
                    <FormSection
                        title="Batas Bulanan Penugasan Mitra"
                        description="Parameter pembatasan transaksi penugasan dan honor bulanan per mitra (Operator Logika: OR)."
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Maksimal Jumlah Penugasan / Bulan
                                </label>
                                <input
                                    type="text"
                                    value="10"
                                    disabled={true}
                                    className="w-full h-10 px-3 py-2 text-sm bg-gray-100 text-gray-700 font-mono border border-gray-200 rounded-md cursor-not-allowed"
                                />
                                <p className="mt-1 text-xs text-gray-500">Standar resmi BPS Mojokerto: 10 penugasan</p>
                            </div>

                            <div>
                                <MoneyInput
                                    label="Maksimal Total Honor / Bulan"
                                    value={4000000}
                                    disabled={true}
                                    helperText="Standar resmi BPS Mojokerto: Rp 4.000.000"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <Toggle
                                label="Izinkan Override Batas oleh Pimpinan (Default: Dinonaktifkan)"
                                checked={false}
                                onChange={() => {}}
                                disabled={true}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Sesuai aturan bisnis MVP, tidak ada mekanisme override batas penugasan untuk mencegah pelanggaran kuota DIPA.
                            </p>
                        </div>
                    </FormSection>

                    <CardContainer
                        title="Ketentuan Validasi Penugasan (Phase 3 Acuan)"
                        subtitle="Kaidah aturan bisnis yang akan divalidasi pada backend"
                    >
                        <ul className="text-xs text-gray-700 space-y-2 list-disc list-inside">
                            <li>Validasi dilakukan di sisi backend (Form Request & Transaction Locks).</li>
                            <li>Kalkulasi berbasis akumulasi bulan kalender penugasan mitra yang berjalan.</li>
                            <li>Kombinasi batas: Jika akumulasi tugas &gt; 10 ATAU akumulasi honor &gt; Rp 4.000.000, transaksi ditolak.</li>
                            <li>Tugas atau tim nonaktif tidak dapat dipilih saat pembuatan penugasan baru.</li>
                        </ul>
                    </CardContainer>
                </div>
            )}
        </ContentContainer>
    );
};

export default SettingsPage;
