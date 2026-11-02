import React, { useState } from 'react';
import {
    ContentContainer,
    PageHeader,
    TableToolbar,
    DataTable,
    StatusBadge,
} from '../../components';
import { Button } from '@idds/react';
import { IconPlus, IconDownload } from '@tabler/icons-react';

export const AssignmentsPage = () => {
    const [search, setSearch] = useState('');

    const columns = [
        { key: 'code', header: 'Kode' },
        { key: 'mitra_name', header: 'Nama Mitra' },
        { key: 'task_name', header: 'Uraian Kegiatan' },
        { key: 'team_name', header: 'Tim Penanggung Jawab' },
        { key: 'start_date', header: 'Tgl Mulai' },
        { key: 'total_value', header: 'Nilai Honor', align: 'right' },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} />,
        },
    ];

    return (
        <ContentContainer>
            <PageHeader
                title="Penugasan Mitra"
                subtitle="Daftar, monitoring, dan pengelolaan penugasan pekerjaan sensus dan survei"
                actions={
                    <Button
                        hierarchy="primary"
                        size="md"
                        prefixIcon={<IconPlus size={16} />}
                        disabled={true}
                    >
                        Tambah Penugasan
                    </Button>
                }
            />

            <TableToolbar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari penugasan, nama mitra, kegiatan..."
                actions={
                    <Button
                        hierarchy="secondary"
                        size="sm"
                        prefixIcon={<IconDownload size={16} />}
                        disabled={true}
                    >
                        Export
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={[]}
                isLoading={false}
                emptyTitle="Belum Ada Penugasan"
                emptyDescription="Modul transaksi penugasan, validasi kuota 10 tugas / Rp 4 juta, dan bulk assignment disiapkan untuk implementasi Phase 3 (Assignment Engine)."
            />
        </ContentContainer>
    );
};

export default AssignmentsPage;
