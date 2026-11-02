import React, { useState } from 'react';
import {
    ContentContainer,
    PageHeader,
    TableToolbar,
    DataTable,
    StatusBadge,
} from '../../components';
import { Button } from '@idds/react';
import { IconDownload } from '@tabler/icons-react';

export const ReportsPage = () => {
    const [search, setSearch] = useState('');

    const columns = [
        { key: 'mitra_name', header: 'Nama Mitra' },
        { key: 'district', header: 'Kecamatan' },
        { key: 'task_count', header: 'Jumlah Tugas', align: 'center' },
        { key: 'total_honor', header: 'Total Honor (Rp)', align: 'right' },
        { key: 'remaining_tasks', header: 'Sisa Kuota Tugas', align: 'center' },
        { key: 'remaining_honor', header: 'Sisa Kuota Honor (Rp)', align: 'right' },
        {
            key: 'limit_status',
            header: 'Status Batas',
            render: (row) => <StatusBadge status={row.limit_status || 'active'} />,
        },
    ];

    return (
        <ContentContainer>
            <PageHeader
                title="Rekapitulasi & Laporan"
                subtitle="Rekapitulasi honor bulanan per mitra, per tim, dan monitoring batas kuota BPS Kabupaten Mojokerto"
                actions={
                    <Button
                        hierarchy="secondary"
                        size="md"
                        prefixIcon={<IconDownload size={16} />}
                        disabled={true}
                    >
                        Export Excel Rekap
                    </Button>
                }
            />

            <TableToolbar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari mitra dalam rekapitulasi..."
            />

            <DataTable
                columns={columns}
                data={[]}
                isLoading={false}
                emptyTitle="Belum Ada Rekapitulasi"
                emptyDescription="Tabel rekapitulasi bulanan berdasarkan tanggal mulai penugasan dan ekspor Excel disiapkan untuk Phase 5 (Monitoring & Reports)."
            />
        </ContentContainer>
    );
};

export default ReportsPage;
