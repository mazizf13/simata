import React from 'react';
import { NavLink } from 'react-router-dom';
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
    IconX,
} from '@tabler/icons-react';

export const Sidebar = ({ isOpen, onClose }) => {
    const { user, hasAnyRole } = useAuth();

    const navItems = [
        {
            label: 'Dashboard',
            to: '/app/dashboard',
            icon: IconHome,
            show: true,
        },
        {
            label: 'Penugasan',
            to: '/app/assignments',
            icon: IconClipboardList,
            show: true,
        },
        {
            label: 'Data Mitra',
            to: '/app/mitras',
            icon: IconUsers,
            show: hasAnyRole(['super_admin', 'admin', 'operator_tim']),
        },
        {
            label: 'Master Tugas',
            to: '/app/tasks',
            icon: IconListCheck,
            show: hasAnyRole(['super_admin', 'admin', 'operator_tim']),
        },
        {
            label: 'Master Tim',
            to: '/app/teams',
            icon: IconBriefcase,
            show: hasAnyRole(['super_admin', 'admin']),
        },
        {
            label: 'SPK',
            to: '/app/spks',
            icon: IconFileText,
            show: hasAnyRole(['super_admin', 'admin', 'operator_tim', 'pimpinan']),
        },
        {
            label: 'Rekapitulasi',
            to: '/app/reports',
            icon: IconReportAnalytics,
            show: true,
        },
        {
            label: 'Pengaturan',
            to: '/app/settings',
            icon: IconSettings,
            show: hasAnyRole(['super_admin', 'admin']),
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
                        className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        aria-label="Tutup menu navigasi"
                    >
                        <IconX size={20} />
                    </button>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Navigasi Utama
                </div>
                {navItems
                    .filter((item) => item.show)
                    .map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
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
