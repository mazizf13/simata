import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button, TextField, PasswordInput, Checkbox, Alert } from '@idds/react';
import { IconLock } from '@tabler/icons-react';

export const LoginPage = () => {
    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // If already logged in, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/app/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!email.trim()) {
            setErrorMessage('Email wajib diisi.');
            return;
        }

        if (!password) {
            setErrorMessage('Password wajib diisi.');
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password, remember);
            navigate('/app/dashboard');
        } catch (err) {
            setErrorMessage(err.message || 'Gagal login. Periksa email dan kata sandi Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Institutional Header */}
                <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-lg bg-blue-700 flex items-center justify-center text-white font-extrabold text-xl tracking-wider shadow-md">
                        BPS
                    </div>
                </div>
                <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
                    SIMATA
                </h2>
                <p className="mt-1 text-center text-sm text-gray-600">
                    Sistem Manajemen Mitra & Penugasan BPS Kabupaten Mojokerto
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 rounded-lg sm:px-8">
                    {errorMessage && (
                        <div className="mb-6">
                            <Alert
                                state="destructive"
                                title="Login Gagal"
                                description={errorMessage}
                            />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <TextField
                                label="Alamat Email Kedinasan"
                                placeholder="nama@bpsmojokerto.id"
                                value={email}
                                onChange={(val) => setEmail(val)}
                                status={errorMessage ? 'error' : 'neutral'}
                                showClearButton={true}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <PasswordInput
                                label="Kata Sandi"
                                placeholder="Masukkan kata sandi akun"
                                value={password}
                                onChange={(val) => setPassword(val)}
                                status={errorMessage ? 'error' : 'neutral'}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <Checkbox
                                label="Ingat saya di perangkat ini"
                                checked={remember}
                                onChange={(checked) => setRemember(checked)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="pt-2">
                            <Button
                                hierarchy="primary"
                                size="lg"
                                className="w-full justify-center !py-2.5"
                                disabled={isLoading}
                                prefixIcon={<IconLock size={18} />}
                            >
                                {isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Aplikasi administrasi internal terproteksi. Setiap aktivitas login dicatat pada audit log sistem.
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center text-xs text-gray-400">
                    &copy; 2026 Badan Pusat Statistik Kabupaten Mojokerto (Kode Wilayah 3516)
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
