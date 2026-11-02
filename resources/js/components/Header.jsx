import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getRoleLabel } from '../utils/formatters';
import { ConfirmDialog } from './ConfirmDialog';
import {
    IconMenu2,
    IconLogout,
    IconUser,
    IconCalendar,
} from '@tabler/icons-react';

export const Header = ({ onOpenSidebar }) => {
    const { user, logout } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleConfirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } finally {
            setIsLoggingOut(false);
            setShowLogoutConfirm(false);
        }
    };

    const currentRole = user?.roles?.[0]?.name;
    const currentTeam = user?.teams?.[0]?.name;

    return (
        <>
            <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
                {/* Left: Mobile Toggle & Quick Context */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onOpenSidebar}
                        className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        aria-label="Buka menu"
                    >
                        <IconMenu2 size={20} />
                    </button>

                    <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-gray-50 border border-gray-200/70 text-xs font-medium text-gray-600">
                        <IconCalendar size={14} className="text-gray-400" />
                        <span>Periode: <strong>November 2026</strong></span>
                    </div>
                </div>

                {/* Right: User Profile & Logout Action */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 pr-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold flex items-center justify-center text-xs border border-blue-200">
                            {user?.name ? user.name.charAt(0).toUpperCase() : <IconUser size={16} />}
                        </div>
                        <div className="hidden md:block text-left">
                            <div className="text-sm font-semibold text-gray-800 leading-tight">
                                {user?.name || 'Pengguna SIMATA'}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                <span className="inline-block px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 font-medium text-[11px]">
                                    {getRoleLabel(currentRole)}
                                </span>
                                {currentTeam && (
                                    <span className="text-gray-400 font-normal">
                                        • Tim {currentTeam}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="h-5 w-px bg-gray-200" />

                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        title="Keluar dari sistem"
                    >
                        <IconLogout size={16} />
                        <span className="hidden sm:inline">Keluar</span>
                    </button>
                </div>
            </header>

            <ConfirmDialog
                open={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleConfirmLogout}
                title="Konfirmasi Keluar Sesi"
                description="Apakah Anda yakin ingin keluar dari sistem SIMATA? Seluruh pekerjaan yang belum disimpan dapat hilang."
                confirmText="Keluar"
                cancelText="Tetap Masuk"
                danger={true}
                isLoading={isLoggingOut}
            />
        </>
    );
};

export default Header;
