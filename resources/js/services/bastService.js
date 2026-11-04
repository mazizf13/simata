import axios from 'axios';
import api, { initCsrf } from './api';

export const bastService = {
    /**
     * Get paginated BAST list with filtering.
     */
    getBasts: async (params = {}) => {
        return await api.get('/basts', { params });
    },

    /**
     * Get single BAST detail.
     */
    getBast: async (id) => {
        return await api.get(`/basts/${id}`);
    },

    /**
     * Get BAST linked to a specific SPK.
     */
    getSpkBast: async (spkId) => {
        return await api.get(`/spks/${spkId}/bast`);
    },

    /**
     * Get auto-generated next BAST number.
     */
    getNextNumber: async (date = null) => {
        return await api.get('/basts/next-number', { params: date ? { date } : {} });
    },

    /**
     * Create new BAST linked to an SPK.
     */
    createBast: async (data) => {
        await initCsrf();
        return await api.post('/basts', data);
    },

    /**
     * Update BAST.
     */
    updateBast: async (id, data) => {
        await initCsrf();
        return await api.put(`/basts/${id}`, data);
    },

    /**
     * Approve / official sign-off for BAST.
     */
    approveBast: async (id) => {
        await initCsrf();
        return await api.post(`/basts/${id}/approve`);
    },

    /**
     * Generate or regenerate BAST Word document.
     */
    generateDocument: async (id) => {
        await initCsrf();
        return await api.post(`/basts/${id}/generate-document`);
    },

    /**
     * Download BAST Word document with clean formatted name.
     */
    downloadDocument: async (id, fallbackFilename = null) => {
        const response = await axios.get(`/api/basts/${id}/download-document`, {
            responseType: 'blob',
            withCredentials: true,
        });

        let filename = fallbackFilename || `BAST_Dokumen_${id}.docx`;
        const disposition = response.headers?.['content-disposition'];
        if (disposition) {
            const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match && match[1]) {
                filename = match[1].replace(/['"]/g, '');
            }
        }

        const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);

        if (blob.type === 'application/json') {
            const errorText = await blob.text();
            try {
                const errJson = JSON.parse(errorText);
                throw new Error(errJson.message || 'Gagal mengunduh dokumen BAST.');
            } catch (parseErr) {
                throw new Error(parseErr.message || 'Gagal mengunduh berkas BAST.');
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

export default bastService;
