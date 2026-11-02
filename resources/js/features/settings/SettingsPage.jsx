import React, { useState } from 'react';
import {
    ContentContainer,
    PageHeader,
    FormSection,
    CardContainer,
    MoneyInput,
} from '../../components';
import { Button, TextField, Toggle } from '@idds/react';
import { IconDeviceFloppy } from '@tabler/icons-react';

export const SettingsPage = () => {
    const [maxTasks, setMaxTasks] = useState('10');
    const [maxHonor, setMaxHonor] = useState(4000000);
    const [allowOverride, setAllowOverride] = useState(false);

    return (
        <ContentContainer>
            <PageHeader
                title="Pengaturan Sistem"
                subtitle="Konfigurasi parameter operasional, batas bulanan, dan kebijakan validasi penugasan"
            />

            <div className="max-w-3xl">
                <FormSection
                    title="Batas Bulanan Penugasan Mitra"
                    description="Parameter pembatasan transaksi penugasan dan honor bulanan per mitra (Operator Logika: OR)."
                    actions={
                        <Button
                            hierarchy="primary"
                            size="md"
                            prefixIcon={<IconDeviceFloppy size={16} />}
                            disabled={true}
                        >
                            Simpan Perubahan
                        </Button>
                    }
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TextField
                            label="Maksimal Jumlah Penugasan / Bulan"
                            value={maxTasks}
                            onChange={(val) => setMaxTasks(val)}
                            disabled={true}
                            helperText="Standar resmi BPS Mojokerto: 10 penugasan"
                        />

                        <MoneyInput
                            label="Maksimal Total Honor / Bulan"
                            value={maxHonor}
                            onChange={(val) => setMaxHonor(val)}
                            disabled={true}
                            helperText="Standar resmi BPS Mojokerto: Rp 4.000.000"
                        />
                    </div>

                    <div className="pt-2">
                        <Toggle
                            label="Izinkan Override Batas oleh Pimpinan (Default: Dinonaktifkan)"
                            checked={allowOverride}
                            onChange={(checked) => setAllowOverride(checked)}
                            disabled={true}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Sesuai aturan bisnis MVP, tidak ada mekanisme override batas penugasan untuk mencegah pelanggaran kuota DIPA.
                        </p>
                    </div>
                </FormSection>

                <CardContainer
                    title="Informasi Wilayah & Master Referensi"
                    subtitle="Kode Wilayah Kerja BPS"
                >
                    <div className="text-sm text-gray-700 space-y-2">
                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                            <span className="text-gray-500">Provinsi</span>
                            <span className="font-semibold">Jawa Timur (35)</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                            <span className="text-gray-500">Kabupaten</span>
                            <span className="font-semibold">Kabupaten Mojokerto (3516)</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                            <span className="text-gray-500">Jumlah Kecamatan</span>
                            <span className="font-semibold">18 Kecamatan Resmi</span>
                        </div>
                    </div>
                </CardContainer>
            </div>
        </ContentContainer>
    );
};

export default SettingsPage;
