import React from 'react';
import ContentContainer from '../../components/ContentContainer';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { IconReportAnalytics } from '@tabler/icons-react';

export const ReportsPage = () => {
    return (
        <ContentContainer>
            <PageHeader
                title="Rekapitulasi & Laporan"
                subtitle="Rekap honor bulanan per mitra, per tim, dan monitoring batas kuota"
            />
            <EmptyState
                icon={IconReportAnalytics}
                title="Modul Rekapitulasi & Export"
                description="Tabel rekap honor bulanan, pembebanan berdasarkan tanggal mulai, dan ekspor ke format Excel disiapkan untuk Phase 5."
            />
        </ContentContainer>
    );
};

export default ReportsPage;
