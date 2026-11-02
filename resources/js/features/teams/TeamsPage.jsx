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

export const TeamsPage = () => {
    const [search, setSearch] = useState('');

    const columns = [
        { key: 'code', header: 'Kode Tim' },
        { key: 'name', header: 'Nama Tim' },
        { key: 'description', header: 'Deskripsi / Bidang Statistik' },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row.status || 'active'} />,
        },
    ];

    // Seeded initial teams for illustration
    const initialTeams = [
        { id: 1, code: 'PROD', name: 'Produksi', description: 'Tim Statistik Produksi', status: 'active' },
        { id: 2, code: 'SOS', name: 'Sosial', description: 'Tim Statistik Sosial', status: 'active' },
        { id: 3, code: 'TANI', name: 'Pertanian', description: 'Tim Statistik Pertanian', status: 'active' },
        { id: 4, code: 'DIST', name: 'Distribusi', description: 'Tim Statistik Distribusi dan Jasa', status: 'active' },
        { id: 5, code: 'IPDS', name: 'IPDS', description: 'Tim Integrasi Pengolahan dan Diseminasi Statistik', status: 'active' },
    ];

    const filteredTeams = initialTeams.filter(
        (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ContentContainer>
            <PageHeader
                title="Master Tim Statistik"
                subtitle="Daftar tim penanggung jawab kegiatan sensus dan survei BPS Kabupaten Mojokerto"
                actions={
                    <Button
                        hierarchy="primary"
                        size="md"
                        prefixIcon={<IconPlus size={16} />}
                        disabled={true}
                    >
                        Tambah Tim
                    </Button>
                }
            />

            <TableToolbar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari tim atau kode..."
            />

            <DataTable
                columns={columns}
                data={filteredTeams}
                isLoading={false}
                emptyTitle="Tim Tidak Ditemukan"
                emptyDescription="Tidak ada tim statistik yang sesuai dengan kata kunci pencarian."
            />
        </ContentContainer>
    );
};

export default TeamsPage;
