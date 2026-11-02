import React, { useState } from 'react';
import {
    ContentContainer,
    PageHeader,
    TableToolbar,
    DataTable,
    StatusBadge,
} from '../../components';
import { Button } from '@idds/react';
import { IconFilePlus } from '@tabler/icons-react';

export const SpksPage = () => {
    const [search, setSearch] = useState('');

    const columns = [
        { key: 'spk_number', header: 'Nomor SPK' },
        { key: 'mitra_name', header: 'Nama Mitra' },
        { key: 'contract_date', header: 'Tanggal Kontrak' },
        { key: 'period', header: 'Masa Kontrak' },
        { key: 'total_assignments', header: 'Jml Tugas', align: 'center' },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row.status || 'active'} />,
        },
    ];

    return (
        <ContentContainer>
            <PageHeader
                title="Data Kontrak & SPK"
                subtitle="Pencatatan nomor SPK, masa kontrak, dan pengelompokan penugasan mitra"
                actions={
                    <Button
                        hierarchy="primary"
                        size="md"
                        prefixIcon={<IconFilePlus size={16} />}
                        disabled={true}
                    >
                        Buat SPK Baru
                    </Button>
                }
            />

            <TableToolbar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari nomor SPK atau nama mitra..."
            />

            <DataTable
                columns={columns}
                data={[]}
                isLoading={false}
                emptyTitle="Belum Ada Rekaman SPK"
                emptyDescription="Pengelolaan metadata SPK per mitra dan keterhubungan dengan detail penugasan disiapkan untuk Phase 4 (SPK Data Management)."
            />
        </ContentContainer>
    );
};

export default SpksPage;
