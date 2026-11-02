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
    IconBuildingBank,
    IconMapPin,
    IconAdjustments,
    IconPlus,
    IconEdit,
    IconTrash,
} from '@tabler/icons-react';
import masterDataService from '../../services/masterDataService';
import BudgetAccountModal from './BudgetAccountModal';

export const SettingsPage = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('budget_accounts');

    // Budget Accounts state
    const [accountPage, setAccountPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [deactivateDialog, setDeactivateDialog] = useState({
        open: false,
        account: null,
    });

    // Fetch budget accounts
    const {
        data: accountsResponse,
        isLoading: accountsLoading,
    } = useQuery({
        queryKey: ['budget-accounts', { page: accountPage }],
        queryFn: async () => {
            return await masterDataService.getBudgetAccounts({ page: accountPage, per_page: 15 });
        },
    });

    const accountsList = accountsResponse?.data || [];
    const accountsMeta = accountsResponse?.meta || { current_page: 1, last_page: 1, total: 0 };

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

    // Budget Account mutations
    const createAccountMutation = useMutation({
        mutationFn: (data) => masterDataService.createBudgetAccount(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budget-accounts'] });
            setModalOpen(false);
            setSelectedAccount(null);
        },
    });

    const updateAccountMutation = useMutation({
        mutationFn: ({ id, data }) => masterDataService.updateBudgetAccount(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budget-accounts'] });
            setModalOpen(false);
            setSelectedAccount(null);
        },
    });

    const deactivateAccountMutation = useMutation({
        mutationFn: (id) => masterDataService.deactivateBudgetAccount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budget-accounts'] });
            setDeactivateDialog({ open: false, account: null });
        },
    });

    const handleOpenCreateAccount = () => {
        setSelectedAccount(null);
        setModalOpen(true);
    };

    const handleOpenEditAccount = (account) => {
        setSelectedAccount(account);
        setModalOpen(true);
    };

    const handleAccountSubmit = async (formData) => {
        if (selectedAccount) {
            return await updateAccountMutation.mutateAsync({
                id: selectedAccount.id,
                data: formData,
            });
        } else {
            return await createAccountMutation.mutateAsync(formData);
        }
    };

    const handleConfirmDeactivateAccount = async () => {
        if (!deactivateDialog.account) return;
        await deactivateAccountMutation.mutateAsync(deactivateDialog.account.id);
    };

    // Columns for Budget Accounts
    const accountColumns = [
        {
            key: 'code',
            header: 'Kode Akun (MAK)',
            render: (row) => (
                <div className="font-mono text-xs font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200 inline-block">
                    {row.code}
                </div>
            ),
        },
        {
            key: 'name',
            header: 'Nama Akun Anggaran',
            render: (row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.name}</div>
                    {row.description && (
                        <div className="text-xs text-gray-500 line-clamp-1">{row.description}</div>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} />,
        },
        {
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (row) => (
                <div className="flex items-center justify-end gap-1.5">
                    <button
                        type="button"
                        onClick={() => handleOpenEditAccount(row)}
                        className="p-1.5 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                        title="Ubah Akun"
                    >
                        <IconEdit size={16} />
                    </button>
                    {row.is_active && (
                        <button
                            type="button"
                            onClick={() => setDeactivateDialog({ open: true, account: row })}
                            className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Nonaktifkan Akun"
                        >
                            <IconTrash size={16} />
                        </button>
                    )}
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
                title="Pengaturan & Master Referensi"
                subtitle="Penatausahaan akun anggaran DIPA, wilayah kecamatan resmi BPS Kabupaten Mojokerto, dan batas operasional"
            />

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6 bg-white rounded-t-lg px-4 pt-2 shadow-xs">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('budget_accounts')}
                        className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-all ${
                            activeTab === 'budget_accounts'
                                ? 'border-blue-700 text-blue-800 font-semibold bg-blue-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                        }`}
                    >
                        <IconBuildingBank size={16} />
                        Akun Anggaran (MAK)
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

            {/* Tab 1: Akun Anggaran */}
            {activeTab === 'budget_accounts' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-4 border border-gray-200 rounded-lg shadow-xs">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">Daftar Akun Anggaran (MAK)</h2>
                            <p className="text-xs text-gray-500">
                                Kode akun pembebanan anggaran DIPA untuk survei dan kegiatan statistik.
                            </p>
                        </div>
                        <Button
                            hierarchy="primary"
                            size="sm"
                            prefixIcon={<IconPlus size={16} />}
                            onClick={handleOpenCreateAccount}
                        >
                            Tambah Akun
                        </Button>
                    </div>

                    <DataTable
                        columns={accountColumns}
                        data={accountsList}
                        isLoading={accountsLoading}
                        emptyTitle="Belum Ada Akun Anggaran"
                        emptyDescription="Klik 'Tambah Akun' untuk mendaftarkan kode akun anggaran DIPA baru."
                        pagination={{
                            currentPage: accountsMeta.current_page,
                            totalPages: accountsMeta.last_page,
                            totalItems: accountsMeta.total,
                            perPage: accountsMeta.per_page,
                            onPageChange: (newPage) => setAccountPage(newPage),
                        }}
                    />

                    <BudgetAccountModal
                        isOpen={modalOpen}
                        onClose={() => {
                            setModalOpen(false);
                            setSelectedAccount(null);
                        }}
                        account={selectedAccount}
                        onSubmit={handleAccountSubmit}
                        isLoading={createAccountMutation.isPending || updateAccountMutation.isPending}
                    />

                    <ConfirmDialog
                        open={deactivateDialog.open}
                        onClose={() => setDeactivateDialog({ open: false, account: null })}
                        onConfirm={handleConfirmDeactivateAccount}
                        title="Konfirmasi Nonaktifkan Akun Anggaran"
                        description={`Apakah Anda yakin ingin menonaktifkan akun anggaran "${
                            deactivateDialog.account?.name || ''
                        }" (${deactivateDialog.account?.code || ''})?`}
                        confirmText="Ya, Nonaktifkan"
                        cancelText="Batal"
                        danger={true}
                        isLoading={deactivateAccountMutation.isPending}
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
