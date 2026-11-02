import api, { initCsrf } from './api';

export const assignmentService = {
    /**
     * Get paginated assignments with filtering.
     */
    getAssignments: async (params = {}) => {
        return await api.get('/assignments', { params });
    },

    /**
     * Get single assignment detail with snapshots and relations.
     */
    getAssignment: async (id) => {
        return await api.get(`/assignments/${id}`);
    },

    /**
     * Create single assignment.
     */
    createAssignment: async (data) => {
        await initCsrf();
        return await api.post('/assignments', data);
    },

    /**
     * Update assignment.
     */
    updateAssignment: async (id, data) => {
        await initCsrf();
        return await api.put(`/assignments/${id}`, data);
    },

    /**
     * Simulate single limit validation in real time.
     */
    simulateLimit: async (data) => {
        await initCsrf();
        return await api.post('/assignments/simulate-limit', data);
    },

    /**
     * Bulk create assignments.
     */
    bulkCreate: async (data) => {
        await initCsrf();
        return await api.post('/assignments/bulk', data);
    },

    /**
     * Simulate bulk assignment validation before saving.
     */
    simulateBulk: async (data) => {
        await initCsrf();
        return await api.post('/assignments/bulk-simulate', data);
    },

    /**
     * Submit draft for approval.
     */
    submitForApproval: async (id) => {
        await initCsrf();
        return await api.post(`/assignments/${id}/submit`);
    },

    /**
     * Approve assignment.
     */
    approveAssignment: async (id) => {
        await initCsrf();
        return await api.post(`/assignments/${id}/approve`);
    },

    /**
     * Activate approved assignment.
     */
    activateAssignment: async (id) => {
        await initCsrf();
        return await api.post(`/assignments/${id}/activate`);
    },

    /**
     * Complete active assignment.
     */
    completeAssignment: async (id) => {
        await initCsrf();
        return await api.post(`/assignments/${id}/complete`);
    },

    /**
     * Cancel assignment with mandatory reason.
     */
    cancelAssignment: async (id, reason) => {
        await initCsrf();
        return await api.post(`/assignments/${id}/cancel`, { reason });
    },

    /**
     * Get monthly quota and honor summary for a mitra.
     */
    getMitraHonorSummary: async (mitraId, year, month) => {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        return await api.get(`/mitras/${mitraId}/honor-summary`, { params });
    },

    /**
     * Get yearly honor breakdown for a mitra.
     */
    getMitraHonorBreakdown: async (mitraId, year) => {
        const params = year ? { year } : {};
        return await api.get(`/mitras/${mitraId}/honor-breakdown`, { params });
    },
};

export default assignmentService;
