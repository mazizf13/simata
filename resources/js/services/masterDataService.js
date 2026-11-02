import api, { initCsrf } from './api';

export const masterDataService = {
    // === MITRA ===
    getMitras: async (params = {}) => {
        return await api.get('/mitras', { params });
    },
    getMitra: async (id) => {
        return await api.get(`/mitras/${id}`);
    },
    createMitra: async (data) => {
        await initCsrf();
        return await api.post('/mitras', data);
    },
    updateMitra: async (id, data) => {
        await initCsrf();
        return await api.put(`/mitras/${id}`, data);
    },
    deactivateMitra: async (id) => {
        await initCsrf();
        return await api.delete(`/mitras/${id}`);
    },

    // === TASKS (KEGIATAN SURVEI) ===
    getTasks: async (params = {}) => {
        return await api.get('/tasks', { params });
    },
    getActiveTasks: async (teamId = null) => {
        const params = teamId ? { team_id: teamId } : {};
        return await api.get('/tasks/active', { params });
    },
    getTask: async (id) => {
        return await api.get(`/tasks/${id}`);
    },
    createTask: async (data) => {
        await initCsrf();
        return await api.post('/tasks', data);
    },
    updateTask: async (id, data) => {
        await initCsrf();
        return await api.put(`/tasks/${id}`, data);
    },
    deactivateTask: async (id) => {
        await initCsrf();
        return await api.delete(`/tasks/${id}`);
    },

    // === TEAMS ===
    getTeams: async () => {
        return await api.get('/teams');
    },
    getActiveTeams: async () => {
        return await api.get('/teams/active');
    },
    getTeam: async (id) => {
        return await api.get(`/teams/${id}`);
    },
    createTeam: async (data) => {
        await initCsrf();
        return await api.post('/teams', data);
    },
    updateTeam: async (id, data) => {
        await initCsrf();
        return await api.put(`/teams/${id}`, data);
    },
    deactivateTeam: async (id) => {
        await initCsrf();
        return await api.delete(`/teams/${id}`);
    },

    // === BUDGET ACCOUNTS ===
    getBudgetAccounts: async (params = {}) => {
        return await api.get('/budget-accounts', { params });
    },
    getActiveBudgetAccounts: async () => {
        return await api.get('/budget-accounts/active');
    },
    getBudgetAccount: async (id) => {
        return await api.get(`/budget-accounts/${id}`);
    },
    createBudgetAccount: async (data) => {
        await initCsrf();
        return await api.post('/budget-accounts', data);
    },
    updateBudgetAccount: async (id, data) => {
        await initCsrf();
        return await api.put(`/budget-accounts/${id}`, data);
    },
    deactivateBudgetAccount: async (id) => {
        await initCsrf();
        return await api.delete(`/budget-accounts/${id}`);
    },

    // === DISTRICTS ===
    getDistricts: async (params = {}) => {
        return await api.get('/districts', { params });
    },
    getActiveDistricts: async () => {
        return await api.get('/districts/active');
    },
    getDistrict: async (id) => {
        return await api.get(`/districts/${id}`);
    },
};

export default masterDataService;
