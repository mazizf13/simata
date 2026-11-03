import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ContentContainer,
    PageHeader,
    DataTable,
    StatusBadge,
    ConfirmDialog,
    CustomSelect,
} from '../../components';
import { Button, TextField } from '@idds/react';
import {
    IconPlus,
    IconEdit,
    IconTrash,
    IconSearch,
    IconReceiptTax,
} from '@tabler/icons-react';
import masterDataService from '../../services/masterDataService';
import { BudgetAccountModal } from '../settings/BudgetAccountModal';

export const BudgetAccountsPage = () => {
    const queryClient = useQueryClient();

    // Filters and pagination state
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [perPage, setPerPage] = useState(15);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [deactivateDialog, setDeactivateDialog] = useState({
        open: false,
        account: null,
    });

    // Fetch budget accounts
    const {
        data: accountsResponse,
        isLoading,
    } = useQuery({
        queryKey: ['budget-accounts', { page, search, selectedStatus, perPage }],
        queryFn: async () => {
            const params = {
                page,
                per_page: perPage,
                search: search.trim() || undefined,
                is_active: selectedStatus !== '' ? selectedStatus : undefined,
            };
            return await masterDataService.getBudgetAccounts(params);
        },
        placeholderData: (prev) => prev,
    });

    const accountsList = accountsResponse?.data || [];
    const meta = accountsResponse?.meta || { current_page: 1, last_page: 1, total: 0, per_page: 15 };

    // Mutations
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

    // Columns
    const columns = [
        {
            key: 'code',
            header: 'Kode Akun (MAK)',
            render: (row) => (
                <div className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 inline-block">
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
                        <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{row.description}</div>
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

    return (
        <ContentContainer>
            <PageHeader
                title="Daftar Akun Anggaran (MAK)"
                subtitle="Kode akun pembebanan anggaran DIPA untuk survei dan kegiatan statistik BPS Kabupaten Mojokerto."
                actions={
                    <Button
                        hierarchy="primary"
                        size="md"
                        prefixIcon={<IconPlus size={16} />}
                        onClick={handleOpenCreateAccount}
                    >
                        Tambah Akun
                    </Button>
                }
            />

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                        <TextField
                            placeholder="Cari kode akun MAK atau nama anggaran..."
                            value={search}
                            onChange={(val) => {
                                setSearch(val);
                                setPage(1);
                            }}
                            prefixIcon={<IconSearch size={16} className="text-gray-400" />}
                        />
                    </div>
                    <div>
                        <CustomSelect
                            value={selectedStatus}
                            onChange={(val) => {
                                setSelectedStatus(val);
                                setPage(1);
                            }}
                            options={[
                                { value: '', label: 'Semua Status' },
                                { value: '1', label: 'Aktif' },
                                { value: '0', label: 'Nonaktif' },
                            ]}
                            placeholder="Status Keaktifan"
                        />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={accountsList}
                isLoading={isLoading}
                emptyTitle="Belum Ada Akun Anggaran"
                emptyDescription="Klik 'Tambah Akun' untuk mendaftarkan kode akun anggaran DIPA baru."
                pagination={{
                    currentPage: meta.current_page,
                    totalPages: meta.last_page,
                    totalItems: meta.total,
                    perPage: meta.per_page,
                    onPageChange: (newPage) => setPage(newPage),
                }}
            />

            {/* Modal Tambah/Edit */}
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

            {/* Dialog Konfirmasi Nonaktifkan */}
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
        </ContentContainer>
    );
};

export default BudgetAccountsPage;
