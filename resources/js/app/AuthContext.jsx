import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { initCsrf } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verify session on initial mount
    const checkAuth = async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.success && res.data?.user) {
                setUser(res.data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password, remember = false) => {
        await initCsrf();
        const res = await api.post('/auth/login', { email, password, remember });
        if (res.success && res.data?.user) {
            setUser(res.data.user);
            return res.data.user;
        }
        throw new Error(res.message || 'Gagal login.');
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.warn('Logout API error:', e);
        } finally {
            setUser(null);
        }
    };

    const hasRole = (role) => {
        if (!user || !user.roles) return false;
        if (user.roles.some((r) => r.name === 'super_admin')) return true;
        return user.roles.some((r) => r.name === role);
    };

    const hasAnyRole = (roles = []) => {
        if (!user || !user.roles) return false;
        if (user.roles.some((r) => r.name === 'super_admin')) return true;
        return roles.some((role) => user.roles.some((r) => r.name === role));
    };

    const belongsToTeam = (teamId) => {
        if (!user || !user.teams) return false;
        if (hasAnyRole(['super_admin', 'admin', 'pimpinan'])) return true;
        return user.teams.some((t) => t.id === Number(teamId));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                hasRole,
                hasAnyRole,
                belongsToTeam,
                refetchUser: checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
