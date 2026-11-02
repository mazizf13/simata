import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getRoleLabel } from '../../utils/formatters';
import ContentContainer from '../../components/ContentContainer';
import PageHeader from '../../components/PageHeader';
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

            {/* User Session Banner */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-gray-500 font-medium">Pengguna Aktif:</div>
                        <div className="text-lg font-bold text-gray-900 mt-0.5">{user?.name}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
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
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded">
                        <IconShieldCheck size={16} />
                        <span>Sesi Terotentikasi Aman</span>
                    </div>
                </div>
            </div>

            {/* Information Notice */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-5">
                <div className="flex gap-3">
                    <IconInfoCircle size={22} className="text-blue-700 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-bold text-blue-900">
                            Fondasi Sistem SIMATA (Phase 1) Telah Aktif
                        </h3>
                        <p className="mt-1 text-xs text-blue-800 leading-relaxed max-w-3xl">
                            Arsitektur Single Monorepo (Laravel + React + IDDS) telah terkonfigurasi. Autentikasi sesi cookie Sanctum, Role-Based Access Control (RBAC), serta struktur navigasi antarmuka institusional telah terpasang. Modul master data mitra dan tugas akan diintegrasikan pada tahap berikutnya sesuai urutan rencana pengembangan.
                        </p>
                    </div>
                </div>
            </div>

            {/* Architectural Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-blue-50 text-blue-700 flex items-center justify-center">
                            <IconUsers size={20} />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-900">Master Data Mitra</div>
                            <div className="text-xs text-gray-500">Struktur relasi terpusat mitra dan kecamatan 3516</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-blue-50 text-blue-700 flex items-center justify-center">
                            <IconClipboardList size={20} />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-900">Assignment Engine</div>
                            <div className="text-xs text-gray-500">Batas bulanan (maks 10 tugas atau Rp 4 juta) dengan row locking</div>
                        </div>
                    </div>
                </div>
            </div>
        </ContentContainer>
    );
};

export default DashboardPage;
