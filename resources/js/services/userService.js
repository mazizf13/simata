import api, { initCsrf } from './api';

export const userService = {
    getUsers: async (params = {}) => {
        return await api.get('/users', { params });
    },

    getRoles: async () => {
        return await api.get('/users/roles');
    },

    getUser: async (id) => {
        return await api.get(`/users/${id}`);
    },

    createUser: async (data) => {
        await initCsrf();
        return await api.post('/users', data);
    },

    updateUser: async (id, data) => {
        await initCsrf();
        return await api.put(`/users/${id}`, data);
    },

    toggleUserStatus: async (id) => {
        await initCsrf();
        return await api.post(`/users/${id}/deactivate`);
    },
};

export default userService;
