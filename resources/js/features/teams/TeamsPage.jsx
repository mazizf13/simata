import React from 'react';
import ContentContainer from '../../components/ContentContainer';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { IconBriefcase } from '@tabler/icons-react';

export const TeamsPage = () => {
    return (
        <ContentContainer>
            <PageHeader
                title="Master Tim Statistik"
                subtitle="Daftar tim penanggung jawab kegiatan sensus dan survei"
            />
            <EmptyState
                icon={IconBriefcase}
                title="Modul Master Tim"
                description="Pengelolaan tim statistik (Produksi, Sosial, Pertanian, Distribusi, IPDS) dan alokasi operator disiapkan untuk Phase 2."
            />
        </ContentContainer>
    );
};

export default TeamsPage;
