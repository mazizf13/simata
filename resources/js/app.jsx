import './bootstrap';

// INA Digital Design System Styles MUST be imported first
import '@idds/react/index.css';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider, ConfirmationProvider } from '@idds/react';

import { AuthProvider } from './app/AuthContext';
import AppRouter from './app/router';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 1000 * 60 * 5, // 5 menit
        },
    },
});

const rootElement = document.getElementById('root');

if (rootElement) {
    createRoot(rootElement).render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <ToastProvider>
                    <ConfirmationProvider>
                        <AuthProvider>
                            <BrowserRouter>
                                <AppRouter />
                            </BrowserRouter>
                        </AuthProvider>
                    </ConfirmationProvider>
                </ToastProvider>
            </QueryClientProvider>
        </React.StrictMode>
    );
}
