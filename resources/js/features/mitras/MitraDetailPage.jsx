import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ContentContainer,
    PageHeader,
    CardContainer,
    StatusBadge,
    LoadingState,
    ErrorState,
    EmptyState,
} from '../../components';
import { Button } from '@idds/react';
import {
    IconArrowLeft,
    IconUser,
    IconCalendarTime,
    IconCash,
    IconFileText,
    IconMapPin,
    IconPhone,
    IconMail,
    IconBriefcase,
} from '@tabler/icons-react';
import masterDataService from '../../services/masterDataService';

export const MitraDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');

    const {
        data: mitraResponse,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['mitra', id],
        queryFn: async () => {
            return await masterDataService.getMitra(id);
        },
    });

    const mitra = mitraResponse?.data;

    if (isLoading) {
        return (
            <ContentContainer>
                <LoadingState message="Memuat detail profil mitra statistik..." />
            </ContentContainer>
        );
    }

    if (isError || !mitra) {
        return (
            <ContentContainer>
                <ErrorState
                    title="Gagal Memuat Data Mitra"
                    message="Data mitra statistik tidak ditemukan atau telah dihapus."
                    onRetry={refetch}
                />
            </ContentContainer>
        );
    }

    const tabs = [
        { id: 'info', label: 'Informasi Profil', icon: <IconUser size={16} /> },
        { id: 'assignments', label: 'Riwayat Penugasan', icon: <IconCalendarTime size={16} /> },
        { id: 'honor', label: 'Rekap Honor', icon: <IconCash size={16} /> },
        { id: 'spk', label: 'Dokumen SPK', icon: <IconFileText size={16} /> },
    ];

    return (
        <ContentContainer>
            <div className="mb-4">
                <Button
                    hierarchy="secondary"
                    size="sm"
                    prefixIcon={<IconArrowLeft size={16} />}
                    onClick={() => navigate('/app/mitras')}
                >
                    Kembali ke Daftar Mitra
                </Button>
            </div>

            <PageHeader
                title={mitra.name}
                subtitle={`Kode Identitas: ${mitra.mitra_code}`}
                actions={<StatusBadge status={mitra.status} />}
            />

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6 bg-white rounded-t-lg px-4 pt-2 shadow-xs">
                <div className="flex gap-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-all ${
                                    isActive
                                        ? 'border-blue-700 text-blue-800 font-semibold bg-blue-50/50'
                                        : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Contents */}
            {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <CardContainer
                            title="Data Pokok Mitra"
                            subtitle="Rincian informasi identitas administrasi mitra"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                                        Kode Mitra
                                    </span>
                                    <span className="text-sm font-mono font-medium text-gray-900 mt-1 block">
                                        {mitra.mitra_code}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                                        Nama Lengkap
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 mt-1 block">
                                        {mitra.name}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                                        Kecamatan Tugas (Mojokerto 3516)
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-1.5">
                                        <IconMapPin size={16} className="text-gray-400" />
                                        {mitra.district
                                            ? `[${mitra.district.code}] ${mitra.district.name}`
                                            : '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                                        Pekerjaan / Profesi
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-1.5">
                                        <IconBriefcase size={16} className="text-gray-400" />
                                        {mitra.occupation || '-'}
                                    </span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                                        Alamat Domisili Lengkap
                                    </span>
                                    <span className="text-sm text-gray-900 mt-1 block">
                                        {mitra.address}
                                    </span>
                                </div>
                            </div>
                        </CardContainer>

                        <CardContainer
                            title="Catatan Administrasi"
                            subtitle="Catatan rekam jejak atau evaluasi petugas"
                        >
                            <div className="py-2">
                                {mitra.notes ? (
                                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                        {mitra.notes}
                                    </p>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">
                                        Tidak ada catatan administrasi tambahan.
                                    </span>
                                )}
                            </div>
                        </CardContainer>
                    </div>

                    <div className="space-y-6">
                        <CardContainer title="Kontak & Komunikasi">
                            <div className="space-y-4 py-2">
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                                        Nomor Telepon / WA
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
                                        <IconPhone size={16} className="text-emerald-600" />
                                        {mitra.phone}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                                        Alamat Email
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
                                        <IconMail size={16} className="text-blue-600" />
                                        {mitra.email || '-'}
                                    </span>
                                </div>
                            </div>
                        </CardContainer>

                        <CardContainer title="Informasi Sistem">
                            <div className="space-y-3 py-2 text-xs text-gray-600">
                                <div>
                                    <span className="text-gray-400 block">Status:</span>
                                    <StatusBadge status={mitra.status} />
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Terdaftar pada:</span>
                                    <span className="font-medium text-gray-800">
                                        {mitra.created_at || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Terakhir diperbarui:</span>
                                    <span className="font-medium text-gray-800">
                                        {mitra.updated_at || '-'}
                                    </span>
                                </div>
                            </div>
                        </CardContainer>
                    </div>
                </div>
            )}

            {activeTab === 'assignments' && (
                <CardContainer>
                    <EmptyState
                        title="Belum Ada Riwayat Penugasan"
                        description="Mitra ini belum memiliki riwayat penugasan kegiatan survei. Modul Penugasan Mitra dan Alokasi Beban Tugas akan diaktifkan pada Phase 3."
                    />
                </CardContainer>
            )}

            {activeTab === 'honor' && (
                <CardContainer>
                    <EmptyState
                        title="Belum Ada Rekap Honor"
                        description="Akumulasi penerimaan honor bulanan mitra akan dikalkulasi otomatis dan ditampilkan di sini saat penugasan survei berjalan (Phase 3)."
                    />
                </CardContainer>
            )}

            {activeTab === 'spk' && (
                <CardContainer>
                    <EmptyState
                        title="Belum Ada Dokumen SPK"
                        description="Daftar surat perintah kerja (SPK) yang mengikat tugas mitra akan dikelola pada modul dokumen SPK di Phase 4."
                    />
                </CardContainer>
            )}
        </ContentContainer>
    );
};

export default MitraDetailPage;
