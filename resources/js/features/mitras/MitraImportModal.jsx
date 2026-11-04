import React, { useState } from 'react';
import { Modal, Button } from '@idds/react';
import {
    IconUpload,
    IconFileSpreadsheet,
    IconDownload,
    IconCheck,
    IconAlertCircle,
    IconInfoCircle,
} from '@tabler/icons-react';
import masterDataService from '../../services/masterDataService';

export const MitraImportModal = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [file, setFile] = useState(null);
    const [updateExisting, setUpdateExisting] = useState(true);
    const [defaultNotes, setDefaultNotes] = useState('Database Mitra 2027');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setError(null);
            setResult(null);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            setDownloadingTemplate(true);
            await masterDataService.downloadMitraTemplate();
        } catch (err) {
            setError('Gagal mengunduh file template.');
        } finally {
            setDownloadingTemplate(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Silakan pilih berkas Excel (.xlsx, .xls) atau CSV (.csv) terlebih dahulu.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('update_existing', updateExisting);
        if (defaultNotes.trim()) {
            formData.append('default_notes', defaultNotes.trim());
        }

        try {
            const res = await masterDataService.importMitras(formData);
            const resData = res.data || res;
            setResult(resData);
            if (onSuccess) onSuccess();
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Terjadi kendala saat memproses berkas Excel.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        setResult(null);
        onClose();
    };

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            title="Impor Data Mitra Statistik dari Excel"
            size="lg"
        >
            <div className="py-2 space-y-4">
                {/* Information & Template Download Card */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                        <IconInfoCircle size={20} className="text-blue-700 shrink-0 mt-0.5" />
                        <div>
                            <div className="text-xs font-bold text-blue-900">
                                Gunakan Format Standar BPS Kabupaten Mojokerto
                            </div>
                            <div className="text-[11px] text-blue-700 mt-0.5">
                                Berkas Excel harus memuat kolom Nama, Kode Kecamatan (010-180), dan Kode Mitra/SOBAT ID.
                            </div>
                        </div>
                    </div>
                    <Button
                        hierarchy="secondary"
                        size="sm"
                        type="button"
                        prefixIcon={<IconDownload size={14} />}
                        onClick={handleDownloadTemplate}
                        disabled={downloadingTemplate}
                    >
                        {downloadingTemplate ? 'Mengunduh...' : 'Unduh Template Excel'}
                    </Button>
                </div>

                {result ? (
                    /* Success Result Summary */
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-center space-y-3">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                            <IconCheck size={28} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-emerald-900">
                                Proses Impor Berhasil!
                            </h3>
                            <p className="text-xs text-emerald-700 mt-1">
                                Data mitra telah berhasil dimasukkan ke dalam database SIMATA BPS.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto pt-2">
                            <div className="bg-white p-2.5 rounded border border-emerald-200">
                                <div className="text-lg font-bold text-emerald-800">{result.imported || 0}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-semibold">Mitra Baru</div>
                            </div>
                            <div className="bg-white p-2.5 rounded border border-emerald-200">
                                <div className="text-lg font-bold text-blue-800">{result.updated || 0}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-semibold">Diperbarui</div>
                            </div>
                            <div className="bg-white p-2.5 rounded border border-emerald-200">
                                <div className="text-lg font-bold text-gray-800">{result.total_rows || 0}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-semibold">Total Baris</div>
                            </div>
                        </div>

                        <div className="pt-3">
                            <Button hierarchy="primary" size="md" onClick={handleClose}>
                                Selesai & Tutup
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Upload Form */
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-xs text-red-700">
                                <IconAlertCircle size={16} className="shrink-0 mt-0.5" />
                                <div>{error}</div>
                            </div>
                        )}

                        {/* File Upload Box */}
                        <div>
                            <label className="text-xs font-semibold text-gray-700 block mb-1">
                                Pilih Berkas Excel / CSV *
                            </label>
                            <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg p-6 text-center transition-colors bg-gray-50/50">
                                <input
                                    type="file"
                                    id="mitra-excel-file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isLoading}
                                />
                                <label
                                    htmlFor="mitra-excel-file"
                                    className="cursor-pointer flex flex-col items-center justify-center"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                                        <IconFileSpreadsheet size={22} />
                                    </div>
                                    <span className="text-xs font-semibold text-blue-700 hover:underline">
                                        Klik untuk memilih berkas
                                    </span>
                                    <span className="text-[11px] text-gray-500 mt-1">
                                        Mendukung format .xlsx, .xls, atau .csv (Maksimal 10 MB)
                                    </span>
                                </label>

                                {file && (
                                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-medium text-blue-800">
                                        <IconCheck size={14} className="text-blue-600" />
                                        <span>{file.name}</span>
                                        <span className="text-[10px] text-gray-500">
                                            ({(file.size / 1024).toFixed(1)} KB)
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Catatan / Tahun Database */}
                        <div>
                            <label className="text-xs font-semibold text-gray-700 block mb-1">
                                Catatan / Tahun Database Mitra
                            </label>
                            <input
                                type="text"
                                value={defaultNotes}
                                onChange={(e) => setDefaultNotes(e.target.value)}
                                placeholder="Contoh: Database Mitra 2027"
                                className="w-full h-9 px-3 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                                disabled={isLoading}
                            />
                            <span className="text-[11px] text-gray-500 mt-0.5 block">
                                Digunakan sebagai label pengelompokan jika baris di Excel tidak memiliki catatan khusus.
                            </span>
                        </div>

                        {/* Checkbox Update Existing */}
                        <div className="flex items-start gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="mitra-update-existing"
                                checked={updateExisting}
                                onChange={(e) => setUpdateExisting(e.target.checked)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-0.5"
                                disabled={isLoading}
                            />
                            <label htmlFor="mitra-update-existing" className="text-xs text-gray-700 cursor-pointer">
                                <span className="font-semibold block">Perbarui data jika Kode Mitra / SOBAT ID sudah ada</span>
                                <span className="text-gray-500 text-[11px]">
                                    Jika tidak dicentang, baris dengan kode mitra yang sudah ada di sistem akan dilewati.
                                </span>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button
                                hierarchy="secondary"
                                size="md"
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Batal
                            </Button>
                            <Button
                                hierarchy="primary"
                                size="md"
                                type="submit"
                                prefixIcon={<IconUpload size={16} />}
                                disabled={isLoading || !file}
                            >
                                {isLoading ? 'Memproses Impor...' : 'Mulai Impor Mitra'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
};

export default MitraImportModal;
