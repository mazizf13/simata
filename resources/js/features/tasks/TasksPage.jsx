import React, { useState } from 'react';
import {
    ContentContainer,
    PageHeader,
    TableToolbar,
    DataTable,
    StatusBadge,
} from '../../components';
import { Button } from '@idds/react';
import { IconPlus } from '@tabler/icons-react';

export const TasksPage = () => {
    const [search, setSearch] = useState('');

    const columns = [
        { key: 'code', header: 'Kode Tugas' },
        { key: 'name', header: 'Nama Kegiatan / Survei' },
        { key: 'team_name', header: 'Tim Penanggung Jawab' },
        { key: 'default_unit', header: 'Satuan Standar' },
        { key: 'default_rate', header: 'Tarif Standar (Rp)', align: 'right' },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row.status || 'active'} />,
        },
    ];

    return (
        <ContentContainer>
            <PageHeader
                title="Master Tugas & Kegiatan"
                subtitle="Katalog kegiatan survei/sensus, satuan pekerjaan, dan tarif standar"
                actions={
                    <Button
                        hierarchy="primary"
                        size="md"
                        prefixIcon={<IconPlus size={16} />}
                        disabled={true}
                    >
                        Tambah Tugas
                    </Button>
                }
            />

            <TableToolbar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari kegiatan survei..."
            />

            <DataTable
                columns={columns}
                data={[]}
                isLoading={false}
                emptyTitle="Belum Ada Katalog Tugas"
                emptyDescription="Katalog survei, satuan default, tarif snapshot, dan akun anggaran penanggung jawab disiapkan untuk Phase 2 (Master Data)."
            />
        </ContentContainer>
    );
};

export default TasksPage;
