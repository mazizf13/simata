import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    IconHome,
    IconClipboardList,
    IconUsers,
    IconBriefcase,
    IconListCheck,
    IconFileText,
    IconReportAnalytics,
    IconSettings,
    IconReceiptTax,
    IconFileCertificate,
    IconBook,
    IconDatabase,
    IconChevronDown,
    IconChevronRight,
    IconX,
} from '@tabler/icons-react';

export const Sidebar = ({ isOpen, onClose }) => {
    const { hasAnyRole } = useAuth();
    const location = useLocation();

    // Data Master submenu items (ordered by initial setup sequence: MAK -> Tim -> Tugas -> Mitra)
    const masterItems = [
        {
            label: 'Akun Anggaran (MAK)',
            to: '/app/budget-accounts',
            icon: IconReceiptTax,
            show: hasAnyRole(['super_admin', 'admin']),
        },
        {
            label: 'Master Tim & Operator',
            to: '/app/teams',
            icon: IconBriefcase,
            show: hasAnyRole(['super_admin', 'admin']),
        },
        {
            label: 'Master Tugas',
            to: '/app/tasks',
            icon: IconListCheck,
            show: hasAnyRole(['super_admin', 'admin', 'operator_tim']),
        },
        {
            label: 'Data Mitra',
            to: '/app/mitras',
            icon: IconUsers,
            show: hasAnyRole(['super_admin', 'admin', 'operator_tim']),
        },
    ];

    const visibleMasterItems = masterItems.filter((item) => item.show);
    const isMasterRouteActive = visibleMasterItems.some((item) =>
        location.pathname.startsWith(item.to)
    );

    // Collapsible state for Data Master, automatically open if current route is within master
    const [isMasterOpen, setIsMasterOpen] = useState(isMasterRouteActive);

    useEffect(() => {
        if (isMasterRouteActive) {
            setIsMasterOpen(true);
        }
    }, [isMasterRouteActive]);

    // Operational workflow items (ordered by natural execution flow: Penugasan -> SPK -> BAST)
    const operationalItems = [
        {
            label: 'Penugasan Mitra',
            to: '/app/assignments',
            icon: IconClipboardList,
            show: true,
        },
        {
            label: 'Dokumen SPK',
            to: '/app/spks',
            icon: IconFileText,
            show: hasAnyRole(['super_admin', 'admin', 'operator_tim', 'pimpinan']),
        },
        {
            label: 'Dokumen BAST',
            to: '/app/basts',
            icon: IconFileCertificate,
            show: hasAnyRole(['super_admin', 'admin', 'operator_tim', 'pimpinan']),
        },
    ];

    const sidebarContent = (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* Header Brand */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-blue-700 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-xs">
                        BPS
                    </div>
                    <div>
                        <div className="text-base font-bold text-gray-900 leading-tight tracking-tight">
                            SIMATA
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                            BPS Kab. Mojokerto (3516)
                        </div>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Tutup menu navigasi"
                    >
                        <IconX size={20} />
                    </button>
                )}
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
                {/* 1. Dashboard */}
                <div>
                    <NavLink
                        to="/app/dashboard"
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-blue-50 text-blue-800 font-semibold border-r-2 border-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <IconHome size={19} stroke={1.8} />
                        <span>Dashboard</span>
                    </NavLink>
                </div>

                {/* 2. Alur Operasional (Penugasan -> SPK -> BAST) */}
                <div>
                    <div className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Alur Operasional
                    </div>
                    <div className="space-y-0.5">
                        {operationalItems
                            .filter((item) => item.show)
                            .map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-blue-50 text-blue-800 font-semibold border-r-2 border-blue-700'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`
                                        }
                                    >
                                        <Icon size={19} stroke={1.8} />
                                        <span>{item.label}</span>
                                    </NavLink>
                                );
                            })}
                    </div>
                </div>

                {/* 3. Data Master (Collapsible Submenu: MAK, Tim, Tugas, Mitra) */}
                {visibleMasterItems.length > 0 && (
                    <div>
                        <div className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Data Master
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={() => setIsMasterOpen((prev) => !prev)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isMasterRouteActive
                                        ? 'text-blue-900 font-semibold bg-gray-50'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <IconDatabase size={19} stroke={1.8} />
                                    <span>Master Data</span>
                                </div>
                                <div className="text-gray-400">
                                    {isMasterOpen ? (
                                        <IconChevronDown size={16} />
                                    ) : (
                                        <IconChevronRight size={16} />
                                    )}
                                </div>
                            </button>

                            {/* Nested Submenu Items */}
                            {isMasterOpen && (
                                <div className="ml-5 pl-2.5 my-1 border-l-2 border-gray-100 space-y-0.5">
                                    {visibleMasterItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <NavLink
                                                key={item.to}
                                                to={item.to}
                                                onClick={onClose}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                                        isActive
                                                            ? 'bg-blue-50 text-blue-800 font-bold border-r-2 border-blue-700'
                                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                    }`
                                                }
                                            >
                                                <Icon size={16} stroke={1.8} />
                                                <span>{item.label}</span>
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. Monitoring & Rekapitulasi */}
                <div>
                    <div className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Laporan
                    </div>
                    <div>
                        <NavLink
                            to="/app/reports"
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-800 font-semibold border-r-2 border-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <IconReportAnalytics size={19} stroke={1.8} />
                            <span>Rekapitulasi</span>
                        </NavLink>
                    </div>
                </div>

                {/* 5. Sistem & Bantuan */}
                <div>
                    <div className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Sistem & Bantuan
                    </div>
                    <div className="space-y-0.5">
                        <NavLink
                            to="/app/tutorial"
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-800 font-semibold border-r-2 border-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <IconBook size={19} stroke={1.8} />
                            <span>Panduan Alur</span>
                        </NavLink>

                        {hasAnyRole(['super_admin', 'admin']) && (
                            <NavLink
                                to="/app/settings"
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-800 font-semibold border-r-2 border-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <IconSettings size={19} stroke={1.8} />
                                <span>Pengaturan</span>
                            </NavLink>
                        )}
                    </div>
                </div>
            </nav>

            {/* Footer / Context Info */}
            <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                <div className="px-2 py-1.5 text-xs text-gray-500 flex items-center justify-between">
                    <span>Sistem Internal</span>
                    <span className="font-mono text-gray-400">v1.0-MVP</span>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop fixed sidebar */}
            <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
                {sidebarContent}
            </aside>

            {/* Mobile / tablet drawer overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-40 lg:hidden flex">
                    <div
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity"
                        onClick={onClose}
                    />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-50">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
