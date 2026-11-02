import React from 'react';
import ContentContainer from '../../components/ContentContainer';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { IconFileText } from '@tabler/icons-react';

export const SpksPage = () => {
    return (
        <ContentContainer>
            <PageHeader
                title="Data Kontrak & SPK"
                subtitle="Pencatatan nomor SPK, masa kontrak, dan pengelompokan penugasan mitra"
            />
            <EmptyState
                icon={IconFileText}
                title="Modul Pengelolaan Data SPK"
                description="Pengelolaan metadata SPK per mitra dan keterhubungan dengan detail penugasan disiapkan untuk Phase 4."
            />
        </ContentContainer>
    );
};

export default SpksPage;
