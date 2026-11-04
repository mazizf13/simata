import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ContentContainer,
    PageHeader,
    CardContainer,
} from '../../components';
import { Button, Badge } from '@idds/react';
import {
    IconReceiptTax,
    IconBriefcase,
    IconListCheck,
    IconClipboardList,
    IconFileText,
    IconFileCertificate,
    IconArrowRight,
    IconCheck,
    IconAlertCircle,
    IconHelp,
    IconDownload,
    IconUserCheck,
    IconShieldCheck,
    IconChevronRight,
    IconBulb,
} from '@tabler/icons-react';

export const TutorialPage = () => {
    const [activeStep, setActiveStep] = useState(1);

    const steps = [
        {
            id: 1,
            title: '1. Akun Anggaran (MAK)',
            shortTitle: 'Akun Anggaran',
            icon: IconReceiptTax,
            color: 'blue',
            badge: 'Fondasi DIPA',
            summary: 'Pencatatan pos anggaran DIPA resmi untuk pembebanan honor kegiatan survei/sensus.',
            linkTo: '/app/budget-accounts',
            linkLabel: 'Buka Menu MAK',
            why: 'Setiap pengeluaran honor mitra wajib dibebankan pada pos mata anggaran (MAK) yang sah sesuai DIPA BPS.',
            actionSteps: [
                'Buka menu "Akun Anggaran (MAK)" pada bilah navigasi kiri.',
                'Klik tombol "+ Tambah Akun Anggaran" di sudut kanan atas.',
                'Isi Kode Akun (contoh: 2895.BMA.007.051.A.521213) dan Nama Akun (contoh: Honor Output Kegiatan / Sensus).',
                'Pastikan status Akun aktif, lalu klik "Simpan Akun".',
            ],
            notes: 'MAK yang sudah dibuat akan otomatis dapat dipilih saat menyusun Master Tugas.',
        },
        {
            id: 2,
            title: '2. Master Tim & Operator',
            shortTitle: 'Tim & Operator',
            icon: IconBriefcase,
            color: 'indigo',
            badge: 'Struktur Organisasi',
            summary: 'Pengelompokan unit teknis (Produksi, Sosial, Distribusi, Nerwilis, IPDS) dan penugasan operator.',
            linkTo: '/app/teams',
            linkLabel: 'Buka Master Tim',
            why: 'Menentukan pembagian fungsi teknis dan hak operasional pegawai penanggung jawab kegiatan survei.',
            actionSteps: [
                'Buka menu "Master Tim".',
                'Pilih tim yang bersangkutan (misal: Distribusi, Sosial, atau Produksi), lalu klik ikon pensil (Ubah).',
                'Pada bagian bawah form "Anggota & Operator Tim", centang akun pegawai BPS yang ditugaskan sebagai operator/penanggung jawab tim tersebut.',
                'Klik "Simpan Perubahan".',
            ],
            notes: 'Pegawai yang telah dicentang akan memiliki kewenangan mengelola tugas dan penugasan pada tim tersebut.',
        },
        {
            id: 3,
            title: '3. Master Tugas (Kegiatan)',
            shortTitle: 'Master Tugas',
            icon: IconListCheck,
            color: 'teal',
            badge: 'Spesifikasi Survei',
            summary: 'Pendaftaran kegiatan survei/sensus lengkap dengan tarif honor, satuan kerja, dan default MAK.',
            linkTo: '/app/tasks',
            linkLabel: 'Buka Master Tugas',
            why: 'Menetapkan standar tarif, beban satuan, dan periode survei sebelum dialokasikan ke mitra lapangan.',
            actionSteps: [
                'Buka menu "Master Tugas".',
                'Klik tombol "+ Tambah Kegiatan Baru".',
                'Pilih Tim Kerja penanggung jawab (misal: Produksi).',
                'Gunakan tombol "Buat Otomatis" untuk menghasilkan Kode Kegiatan standar resmi (contoh: SURV-PROD-2026-01).',
                'Tentukan Nama Kegiatan, Satuan Hasil (Dokumen, Segmen, Kuesioner, Rumah Tangga), Tarif Standar per Satuan, dan Akun Anggaran (MAK).',
                'Atur rentang jadwal pelaksanaan tugas lapangan, lalu klik "Simpan Kegiatan".',
            ],
            notes: 'Satu kegiatan Master Tugas dapat dialokasikan kepada puluhan hingga ratusan mitra statistik.',
        },
        {
            id: 4,
            title: '4. Penugasan Lapangan',
            shortTitle: 'Penugasan Mitra',
            icon: IconClipboardList,
            color: 'amber',
            badge: 'Beban Kerja Mitra',
            summary: 'Penetapan alokasi target volume survei kepada mitra statistik dengan kontrol batas honor.',
            linkTo: '/app/assignments',
            linkLabel: 'Buka Penugasan',
            why: 'Menentukan siapa mitra yang bertugas dan berapa target volume yang harus dicapai.',
            actionSteps: [
                'Buka menu "Penugasan".',
                'Klik tombol "+ Tambah Penugasan".',
                'Pilih Mitra Statistik yang aktif dan pilih Kegiatan Survei yang telah didaftarkan.',
                'Masukkan Volume Target (contoh: 15 Dokumen). Nilai total honor akan dihitung otomatis oleh sistem.',
                'Sistem secara cerdas memeriksa batas honor bulanan mitra (maksimal sesuai SBML). Jika melampaui, sistem memberikan peringatan.',
                'Klik "Simpan Penugasan".',
            ],
            notes: 'Penugasan yang berstatus aktif siap dilampirkan ke dalam Surat Perjanjian Kerja (SPK).',
        },
        {
            id: 5,
            title: '5. Surat Perjanjian Kerja (SPK)',
            shortTitle: 'Surat SPK',
            icon: IconFileText,
            color: 'emerald',
            badge: 'Legalitas Kontrak',
            summary: 'Penerbitan kontrak kerja legal antara PPK BPS dan Mitra (mencakup rincian MAK & honor).',
            linkTo: '/app/spks',
            linkLabel: 'Buka Menu SPK',
            why: 'Menjadi payung hukum pelaksanaan tugas dan dasar sah pengeluaran hak pembayaran honor mitra.',
            actionSteps: [
                'Buka menu "SPK" > Klik "+ Buat SPK Baru".',
                'Pilih Mitra Statistik yang dituju. Klik tombol "Buat Otomatis" untuk nomor SPK resmi (001/3516/SPK.N/Bulan/Tahun).',
                'Tentukan Tanggal Kontrak dan Periode Kerja, lalu klik "Simpan SPK".',
                'Buka Detail SPK yang baru dibuat, klik "Lampirkan Penugasan" untuk memasukkan 1 hingga 9 kegiatan survei mitra tersebut dalam bulan ini.',
                'Klik "Aktifkan SPK" untuk meresmikan kontrak.',
                'Klik tombol "Unduh SPK (.docx)" untuk mencetak dokumen fisik 4 halaman berformat resmi BPS.',
            ],
            notes: 'SPK memuat komparasi pihak pertama (PPK), pihak kedua (mitra), rincian anggaran MAK, dan tabel beban kerja.',
        },
        {
            id: 6,
            title: '6. Berita Acara Serah Terima (BAST)',
            shortTitle: 'Berita Acara (BAST)',
            icon: IconFileCertificate,
            color: 'purple',
            badge: 'Akuntabilitas Output',
            summary: 'Pengesahan penyerahan hasil survei (murni verifikasi beban kerja, tanpa nominal uang).',
            linkTo: '/app/basts',
            linkLabel: 'Buka Menu BAST',
            why: 'Bukti fisik bahwa seluruh dokumen sensus/survei telah diterima lengkap dan layak dicairkan honornya.',
            actionSteps: [
                'Dapat dibuat langsung dari halaman Detail SPK (klik "Terbitkan BAST") atau melalui menu "BAST" > "+ Buat BAST Baru".',
                'Pilih SPK yang telah selesai dilaksanakan oleh mitra.',
                'Nomor BAST akan terbuat otomatis (001/3516/BAST.N/Bulan/Tahun). Tentukan tanggal serah terima pekerjaan.',
                'Klik "Simpan Berita Acara".',
                'Klik "Unduh BAST (.docx)" untuk mengunduh dokumen resmi 2 halaman. Kolom realisasi volume dan satuan sengaja dikosongkan agar diisi tulisan tangan basah mitra.',
                'Setelah berkas fisik diperiksa Ketua Tim dan PPK, klik tombol "Sahkan BAST" di aplikasi.',
            ],
            notes: 'BAST yang telah disahkan menjadi lampu hijau bagi Bendahara Pengeluaran untuk mentransfer honor ke rekening mitra.',
        },
    ];

    return (
        <ContentContainer>
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                <IconBulb size={24} />
                            </span>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Panduan Alur Kerja SIMATA
                            </h1>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Pedoman terstruktur administrasi mitra statistik, kegiatan survei, kontrak kerja (SPK), dan serah terima hasil (BAST) di BPS Kabupaten Mojokerto.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link to="/app/spks">
                            <Button hierarchy="secondary" size="md" prefixIcon={<IconFileText size={16} />}>
                                Kelola SPK
                            </Button>
                        </Link>
                        <Link to="/app/basts">
                            <Button hierarchy="primary" size="md" prefixIcon={<IconFileCertificate size={16} />}>
                                Kelola BAST
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Visual Flowchart Diagram */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 mb-8 overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                        <h2 className="text-base font-bold text-gray-900">
                            Bagan Alur Proses Administrasi (End-to-End Pipeline)
                        </h2>
                    </div>
                    <span className="text-xs text-gray-400 italic">
                        Klik tahapan di bawah untuk melihat rincian langkah kerja
                    </span>
                </div>

                {/* Interactive Stepper / Flowchart Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isSelected = activeStep === step.id;

                        return (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => setActiveStep(step.id)}
                                className={`text-left p-3.5 rounded-lg border transition-all relative flex flex-col justify-between ${
                                    isSelected
                                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                        : 'bg-gray-50/50 border-gray-200 hover:bg-gray-100/70 hover:border-gray-300'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div
                                            className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs ${
                                                isSelected
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-700'
                                            }`}
                                        >
                                            <Icon size={18} />
                                        </div>
                                        <span
                                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                isSelected
                                                    ? 'bg-blue-200/80 text-blue-900'
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}
                                        >
                                            Tahap {step.id}
                                        </span>
                                    </div>
                                    <div className="font-bold text-xs text-gray-900 line-clamp-1">
                                        {step.shortTitle}
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-tight">
                                        {step.summary}
                                    </p>
                                </div>

                                <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] font-medium text-blue-700">
                                    <span>{isSelected ? 'Sedang Dibaca' : 'Pelajari'}</span>
                                    <IconChevronRight size={13} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Active Step Detailed Guide */}
            {steps.map((step) => {
                if (step.id !== activeStep) return null;
                const Icon = step.icon;

                return (
                    <div
                        key={step.id}
                        className="bg-white rounded-xl border border-gray-200 shadow-xs mb-8 overflow-hidden animate-fadeIn"
                    >
                        <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                                    <Icon size={22} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold text-gray-900">
                                            {step.title}
                                        </h2>
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                            {step.badge}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {step.summary}
                                    </p>
                                </div>
                            </div>

                            <Link to={step.linkTo}>
                                <Button
                                    hierarchy="primary"
                                    size="sm"
                                    suffixIcon={<IconArrowRight size={14} />}
                                >
                                    {step.linkLabel}
                                </Button>
                            </Link>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Alasan / Mengapa Penting */}
                            <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-4 flex items-start gap-3">
                                <IconAlertCircle size={20} className="text-amber-700 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                                        Mengapa Tahapan Ini Wajib Dilakukan?
                                    </h4>
                                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                                        {step.why}
                                    </p>
                                </div>
                            </div>

                            {/* Langkah-Langkah Operasional */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                                        ✓
                                    </span>
                                    Langkah-Langkah Pembuatan di Aplikasi:
                                </h3>

                                <ol className="space-y-3">
                                    {step.actionSteps.map((act, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200/70 text-sm text-gray-800"
                                        >
                                            <span className="w-6 h-6 rounded-md bg-white border border-gray-300 text-gray-700 text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                                                {i + 1}
                                            </span>
                                            <span className="mt-0.5 leading-relaxed">{act}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Catatan Teknis */}
                            <div className="p-3.5 bg-blue-50/50 border border-blue-200/60 rounded-lg flex items-center justify-between text-xs text-blue-900">
                                <div className="flex items-center gap-2">
                                    <IconCheck size={16} className="text-blue-600 shrink-0" />
                                    <span>
                                        <strong>Catatan Penting:</strong> {step.notes}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {activeStep > 1 && (
                                        <Button
                                            hierarchy="tertiary"
                                            size="sm"
                                            onClick={() => setActiveStep(activeStep - 1)}
                                        >
                                            Tahap Sebelumnya
                                        </Button>
                                    )}
                                    {activeStep < steps.length && (
                                        <Button
                                            hierarchy="secondary"
                                            size="sm"
                                            onClick={() => setActiveStep(activeStep + 1)}
                                        >
                                            Tahap Berikutnya
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Quick Summary Reference Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* SPK vs BAST comparison */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                        <IconShieldCheck size={20} className="text-emerald-700" />
                        <h3 className="text-sm font-bold text-gray-900">
                            Perbedaan Kunci: Dokumen SPK vs BAST
                        </h3>
                    </div>
                    <div className="space-y-3 text-xs text-gray-700">
                        <div className="p-2.5 bg-gray-50 rounded border border-gray-200">
                            <span className="font-bold text-emerald-800 block mb-0.5">
                                Surat Perjanjian Kerja (SPK)
                            </span>
                            Dokumen kontrak awal (4 halaman) yang mengikat hak & kewajiban mitra, target beban kerja, <strong>nominal honor, tarif satuan, dan rincian akun MAK DIPA</strong>.
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded border border-gray-200">
                            <span className="font-bold text-purple-800 block mb-0.5">
                                Berita Acara Serah Terima (BAST)
                            </span>
                            Dokumen verifikasi akhir (2 halaman) hasil pemeriksaan beban kerja. <strong>Bebas nominal uang</strong>, kolom realisasi diisi tulisan tangan basah mitra sebagai bukti fisik sebelum pencairan honor.
                        </div>
                    </div>
                </div>

                {/* Aturan Batas Honor SBML */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                        <IconAlertCircle size={20} className="text-blue-700" />
                        <h3 className="text-sm font-bold text-gray-900">
                            Ketentuan Validasi & Kepatuhan Anggaran
                        </h3>
                    </div>
                    <ul className="space-y-2 text-xs text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span><strong>Batas Honor Bulanan:</strong> Sistem otomatis menghitung total honor seluruh penugasan mitra dalam satu bulan kalender agar tidak melewati batas SBML.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span><strong>Nomor Urut Otomatis:</strong> Format penomoran SPK dan BAST urut per bulan dari 1 (misal: <code>001/3516/SPK.1/XI/2026</code> dan <code>001/3516/BAST.1/XI/2026</code>).</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span><strong>Tabel 9 Baris Resmi:</strong> Seluruh lampiran dokumen Word BPS tetap mempertahankan format 9 baris rapi tanpa kode placeholder rusak.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </ContentContainer>
    );
};

export default TutorialPage;
