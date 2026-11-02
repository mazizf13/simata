import React from 'react';
import ContentContainer from '../../components/ContentContainer';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { IconUsers } from '@tabler/icons-react';

export const MitrasPage = () => {
    return (
        <ContentContainer>
            <PageHeader
                title="Data Mitra Statistik"
                subtitle="Master data identitas mitra statistik BPS Kabupaten Mojokerto"
            />
            <EmptyState
                icon={IconUsers}
                title="Modul Master Mitra"
                description="Pengelolaan profil mitra, validasi kecamatan 3516, dan riwayat penugasan disiapkan untuk implementasi Phase 2 (Master Data)."
            />
        </ContentContainer>
    );
};

export default MitrasPage;
