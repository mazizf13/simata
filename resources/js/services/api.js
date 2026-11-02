import axios from 'axios';

/**
 * Standard Axios API client configured for Laravel Sanctum cookie session.
 */
const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

/**
 * Request Sanctum CSRF cookie before making stateful POST/PUT requests.
 */
export const initCsrf = async () => {
    try {
        await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
    } catch (e) {
        console.warn('Gagal memuat cookie CSRF Sanctum:', e);
    }
};

/**
 * Global response interceptor for consistent error extraction.
 */
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const errorData = error.response?.data || {
            success: false,
            message: error.message || 'Terjadi galat pada jaringan.',
        };
        return Promise.reject(errorData);
    }
);

export default api;
