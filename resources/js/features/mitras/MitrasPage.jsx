import React, { useState } from 'react';
import {
    ContentContainer,
    PageHeader,
    TableToolbar,
    DataTable,
    StatusBadge,
} from '../../components';
import { Button } from '@idds/react';
import { IconUserPlus, IconFileSpreadsheet } from '@tabler/icons-react';

export const MitrasPage = () => {
    const [search, setSearch] = useState('');

    const columns = [
        { key: 'mitra_code', header: 'Kode Mitra' },
        { key: 'name', header: 'Nama Lengkap' },
        { key: 'district', header: 'Kecamatan (3516)' },
        { key: 'phone', header: 'No. Kontak' },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} />,
        },
    ];

    return (
        <ContentContainer>
            <PageHeader
                title="Data Mitra Statistik"
                subtitle="Master data terpusat mitra statistik BPS Kabupaten Mojokerto"
                actions={
                    <Button
                        hierarchy="primary"
                        size="md"
                        prefixIcon={<IconUserPlus size={16} />}
                        disabled={true}
                    >
                        Tambah Mitra
                    </Button>
                }
            />

            <TableToolbar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari berdasarkan nama mitra atau kode..."
                actions={
                    <Button
                        hierarchy="secondary"
                        size="sm"
                        prefixIcon={<IconFileSpreadsheet size={16} />}
                        disabled={true}
                    >
                        Import Excel
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={[]}
                isLoading={false}
                emptyTitle="Belum Ada Data Mitra"
                emptyDescription="Master profil mitra, pencarian nama/kode, filter 18 kecamatan, dan histori penugasan disiapkan untuk implementasi Phase 2 (Master Data)."
            />
        </ContentContainer>
    );
};

export default MitrasPage;
