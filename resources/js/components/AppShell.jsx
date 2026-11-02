import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export const AppShell = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Left Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Right Main Flow */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header onOpenSidebar={() => setSidebarOpen(true)} />

                <main className="flex-1 pb-12">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppShell;
