import axios from 'axios';
import api, { initCsrf } from './api';

export const spkService = {
    /**
     * Get paginated SPK list with filtering.
     */
    getSpks: async (params = {}) => {
        return await api.get('/spks', { params });
    },

    /**
     * Get single SPK detail with attached tasks and relations.
     */
    getSpk: async (id) => {
        return await api.get(`/spks/${id}`);
    },

    /**
     * Get auto-generated next SPK number for a specific contract date.
     */
    getNextNumber: async (date = null) => {
        return await api.get('/spks/next-number', { params: date ? { date } : {} });
    },

    /**
     * Create new SPK.
     */
    createSpk: async (data) => {
        await initCsrf();
        return await api.post('/spks', data);
    },

    /**
     * Update draft or active SPK.
     */
    updateSpk: async (id, data) => {
        await initCsrf();
        return await api.put(`/spks/${id}`, data);
    },

    /**
     * Activate SPK (draft -> active).
     */
    activateSpk: async (id) => {
        await initCsrf();
        return await api.post(`/spks/${id}/activate`);
    },

    /**
     * Complete SPK (active -> completed).
     */
    completeSpk: async (id) => {
        await initCsrf();
        return await api.post(`/spks/${id}/complete`);
    },

    /**
     * Cancel SPK with reason.
     */
    cancelSpk: async (id, reason) => {
        await initCsrf();
        return await api.post(`/spks/${id}/cancel`, { reason });
    },

    /**
     * Attach task assignments to an SPK.
     */
    attachAssignments: async (id, assignmentIds) => {
        await initCsrf();
        return await api.post(`/spks/${id}/attach-assignments`, { assignment_ids: assignmentIds });
    },

    /**
     * Detach an assignment from an SPK.
     */
    detachAssignment: async (id, assignmentId) => {
        await initCsrf();
        return await api.post(`/spks/${id}/detach-assignment/${assignmentId}`);
    },

    /**
     * Get all SPKs belonging to a mitra.
     */
    getMitraSpks: async (mitraId, params = {}) => {
        return await api.get(`/mitras/${mitraId}/spks`, { params });
    },

    /**
     * Generate or regenerate SPK Word document.
     */
    generateDocument: async (id) => {
        await initCsrf();
        return await api.post(`/spks/${id}/generate-document`);
    },

    /**
     * Download SPK Word document with clean formatted name.
     */
    downloadDocument: async (id, fallbackFilename = null) => {
        const response = await axios.get(`/api/spks/${id}/download-document`, {
            responseType: 'blob',
            withCredentials: true,
        });

        let filename = fallbackFilename || `SPK_Dokumen_${id}.docx`;
        const disposition = response.headers?.['content-disposition'];
        if (disposition) {
            const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match && match[1]) {
                filename = match[1].replace(/['"]/g, '');
            }
        }

        const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);

        // Jika server mengembalikan response error JSON dalam format blob
        if (blob.type === 'application/json') {
            const errorText = await blob.text();
            try {
                const errJson = JSON.parse(errorText);
                throw new Error(errJson.message || 'Gagal mengunduh dokumen SPK.');
            } catch (parseErr) {
                throw new Error(parseErr.message || 'Gagal mengunduh berkas.');
            }
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};

export default spkService;
