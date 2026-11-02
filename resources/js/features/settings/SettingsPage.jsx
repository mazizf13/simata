import React from 'react';
import ContentContainer from '../../components/ContentContainer';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { IconSettings } from '@tabler/icons-react';

export const SettingsPage = () => {
    return (
        <ContentContainer>
            <PageHeader
                title="Pengaturan Sistem"
                subtitle="Manajemen akun pengguna, master kecamatan, akun anggaran, dan audit log"
            />
            <EmptyState
                icon={IconSettings}
                title="Modul Pengaturan & Audit Log"
                description="Konfigurasi parameter sistem, batas penugasan (10 tugas / Rp 4 juta), serta riwayat audit transaksi."
            />
        </ContentContainer>
    );
};

export default SettingsPage;
