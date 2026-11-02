import api from './api';

export const reportService = {
    /**
     * Get dashboard summary analytics.
     */
    getDashboard: async (params = {}) => {
        return await api.get('/dashboard', { params });
    },

    /**
     * Get paginated monthly recap per mitra.
     */
    getMonthlyMitraRecap: async (params = {}) => {
        return await api.get('/reports/monthly', { params });
    },

    /**
     * Get team recap for the period.
     */
    getTeamRecap: async (params = {}) => {
        return await api.get('/reports/teams', { params });
    },

    /**
     * Get drill-down hierarchy for a specific team.
     */
    getTeamDrilldown: async (teamId, params = {}) => {
        return await api.get(`/reports/teams/${teamId}/drilldown`, { params });
    },

    /**
     * Get calendar assignments.
     */
    getCalendar: async (params = {}) => {
        return await api.get('/reports/calendar', { params });
    },

    /**
     * Get Kanban assignments.
     */
    getKanban: async (params = {}) => {
        return await api.get('/reports/kanban', { params });
    },

    /**
     * Build export download URLs.
     */
    getExportMonthlyUrl: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return `/api/exports/monthly?${query}`;
    },

    getExportTeamsUrl: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return `/api/exports/teams?${query}`;
    },

    getExportAssignmentsUrl: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return `/api/exports/assignments?${query}`;
    },
};

export default reportService;
