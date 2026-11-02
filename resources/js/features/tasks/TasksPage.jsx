import React from 'react';
import ContentContainer from '../../components/ContentContainer';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { IconListCheck } from '@tabler/icons-react';

export const TasksPage = () => {
    return (
        <ContentContainer>
            <PageHeader
                title="Master Tugas & Kegiatan"
                subtitle="Katalog kegiatan survei/sensus, satuan pekerjaan, dan tarif standar"
            />
            <EmptyState
                icon={IconListCheck}
                title="Modul Master Tugas"
                description="Katalog survei, satuan default, tarif snapshot, dan akun anggaran penanggung jawab disiapkan untuk Phase 2."
            />
        </ContentContainer>
    );
};

export default TasksPage;
