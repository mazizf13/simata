import React from 'react';
import ContentContainer from '../../components/ContentContainer';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { IconClipboardList } from '@tabler/icons-react';

export const AssignmentsPage = () => {
    return (
        <ContentContainer>
            <PageHeader
                title="Penugasan Mitra"
                subtitle="Daftar, monitoring, dan pengelolaan penugasan pekerjaan sensus dan survei"
            />
            <EmptyState
                icon={IconClipboardList}
                title="Modul Penugasan Mitra"
                description="Modul transaksi penugasan, simulasi kuota/honor, dan bulk assignment disiapkan untuk implementasi Phase 3 (Assignment Engine)."
            />
        </ContentContainer>
    );
};

export default AssignmentsPage;
