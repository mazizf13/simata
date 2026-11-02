import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getRoleLabel } from '../../utils/formatters';
import {
    ContentContainer,
    PageHeader,
    CardContainer,
    StatusBadge,
} from '../../components';
import {
    IconInfoCircle,
    IconClipboardList,
    IconUsers,
    IconShieldCheck,
} from '@tabler/icons-react';

export const DashboardPage = () => {
    const { user } = useAuth();
    const primaryRole = user?.roles?.[0]?.name;
    const teamName = user?.teams?.[0]?.name;

    return (
        <ContentContainer>
            <PageHeader
                title="Dashboard Administrasi"
                subtitle="Selamat datang di SIMATA — Sistem Manajemen Mitra BPS Kabupaten Mojokerto"
            />

            {/* User Session Banner via CardContainer */}
            <CardContainer className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-gray-500 font-medium">Pengguna Aktif:</div>
                        <div className="text-lg font-bold text-gray-900 mt-0.5">{user?.name}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                            <span>Peran: <strong className="text-gray-700">{getRoleLabel(primaryRole)}</strong></span>
                            {teamName && (
                                <>
                                    <span>•</span>
                                    <span>Tim: <strong className="text-gray-700">{teamName}</strong></span>
                                </>
                            )}
                            <span>•</span>
                            <span>Kode Wilayah: <strong className="text-gray-700">3516 (Kab. Mojokerto)</strong></span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded shrink-0">
                        <IconShieldCheck size={16} />
                        <span>Sesi Terotentikasi Aman</span>
                    </div>
                </div>
            </CardContainer>

            {/* Information Notice */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-5 mb-6">
                <div className="flex gap-3">
                    <IconInfoCircle size={22} className="text-blue-700 shrink-0 mt-0.5" />
                    <div>
                        <h2 className="text-sm font-bold text-blue-900">
                            Fondasi Sistem SIMATA & Arsitektur Reusable Telah Aktif
                        </h2>
                        <p className="mt-1 text-xs text-blue-800 leading-relaxed max-w-3xl">
                            Arsitektur Single Monorepo (Laravel + React + IDDS) telah menggunakan Repository Pattern di backend dan Reusable UI Components di frontend. Seluruh komponen tabel, formulir, status badge, dan dialog telah distandarisasi untuk kelancaran implementasi master data dan transaksi penugasan.
                        </p>
                    </div>
                </div>
            </div>

            {/* Architectural Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CardContainer
                    title="Master Data Mitra & Wilayah"
                    subtitle="Relasi data terpusat mitra dan kecamatan 3516"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                            <IconUsers size={22} />
                        </div>
                        <div className="text-xs text-gray-600 leading-relaxed">
                            Mencegah duplikasi data mitra dan menampung riwayat pekerjaan tanpa menambah kolom horizontal.
                        </div>
                    </div>
                </CardContainer>

                <CardContainer
                    title="Assignment & Limit Engine"
                    subtitle="Pengendalian kuota 10 tugas / Rp 4.000.000"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                            <IconClipboardList size={22} />
                        </div>
                        <div className="text-xs text-gray-600 leading-relaxed">
                            Validasi batas otomatis berbasis tanggal mulai pekerjaan menggunakan transaksi database atomik dan penguncian baris.
                        </div>
                    </div>
                </CardContainer>
            </div>
        </ContentContainer>
    );
};

export default DashboardPage;
