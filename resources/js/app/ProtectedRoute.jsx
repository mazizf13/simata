import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingState from '../components/LoadingState';
import ContentContainer from '../components/ContentContainer';
import ErrorState from '../components/ErrorState';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { isAuthenticated, isLoading, hasAnyRole } = useAuth();

    if (isLoading) {
        return <LoadingState message="Memverifikasi hak akses..." fullScreen={true} />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
        return (
            <ContentContainer>
                <ErrorState
                    title="Akses Ditolak (403 Forbidden)"
                    message="Akun Anda tidak memiliki wewenang administratif untuk membuka menu ini."
                />
            </ContentContainer>
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
