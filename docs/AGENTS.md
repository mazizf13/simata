# AGENTS.md --- Instruksi Coding Agent SIMATA

Dokumen ini menjadi instruksi kerja untuk Antigravity atau AI coding
agent lain yang mengerjakan repository SIMATA.

## 1. Konteks proyek

SIMATA adalah sistem administrasi internal BPS Kabupaten Mojokerto untuk
mengelola mitra, kegiatan, penugasan, SPK, dan rekap honor.

Stack: - Laravel backend. - React + Vite frontend. - MySQL database. -
INA Digital Design System melalui `@idds/react`. - Tailwind CSS hanya
sesuai integrasi/kompatibilitas resmi. - Tabler Icons.

Baca dokumen berikut sebelum implementasi: 1. `README.md` 2. `PRD.md` 3.
`BUSINESS-RULES.md` 4. `DATABASE.md` 5. `ARCHITECTURE.md` 6. `DESIGN.md`
7. `API.md` 8. `SECURITY.md` 9. `DEVELOPMENT-PLAN.md`

## 2. Aturan wajib

-   Jangan mengubah business rules tanpa memperbarui dokumentasi dan
    meminta konfirmasi.
-   Jangan menganggap bentuk Excel lama sebagai desain database.
-   Jangan menaruh seluruh logic di controller atau komponen React.
-   Jangan membuat duplikasi fungsi jika utilitas/komponen yang sesuai
    sudah ada.
-   Jangan membuat abstraksi berlebihan.
-   Jangan mengarang API atau props komponen INA Digital; periksa
    dokumentasi/package yang terpasang.
-   Jangan mengganti `@idds/react` dengan UI kit lain tanpa persetujuan.
-   Jangan menggunakan template dashboard SaaS generik.
-   Jangan menggunakan gradient dekoratif, glassmorphism, glow, atau
    animasi berlebihan.
-   Jangan menggunakan data dummy pada production.
-   Jangan menghitung batas honor hanya di frontend.
-   Jangan mempercayai `total_value` yang dikirim browser.
-   Jangan menghapus data historis yang telah direferensikan.
-   Jangan membuat fitur generate dokumen SPK pada MVP; fitur tersebut
    ditunda.
-   Jangan menambahkan package tanpa alasan teknis yang jelas.

## 3. Engineering standards

### Backend

-   Gunakan Form Request untuk validasi request.
-   Gunakan Policy/Gate untuk otorisasi.
-   Gunakan Service/Action untuk business logic.
-   Gunakan API Resource untuk response.
-   Gunakan Eloquent relationship dan eager loading.
-   Gunakan database transaction untuk operasi multi-record.
-   Gunakan row locking untuk validasi batas yang rawan race condition.
-   Gunakan DECIMAL untuk nominal uang.
-   Gunakan enum/constant untuk status.
-   Tulis unit/feature tests untuk business rules.

### Frontend

-   Gunakan feature-based folder structure.
-   Buat reusable component untuk pola yang berulang.
-   Gunakan TanStack Query untuk server state bila dipilih.
-   Gunakan React Hook Form + Zod untuk form bila dipilih.
-   Gunakan komponen INA Digital sebagai pilihan pertama.
-   Pisahkan API client, hooks, page, dan komponen.
-   Tangani loading, empty, error, dan success state.
-   Gunakan pagination/filter server-side untuk tabel besar.
-   Hindari file komponen terlalu panjang dan state yang tidak
    terstruktur.

## 4. UI quality bar

Antarmuka harus: - Bersih, formal, institusional, dan fungsional. -
Mengutamakan tabel dan alur administrasi. - Memiliki hierarki visual
jelas. - Konsisten dengan INA Digital Design System. - Responsif dan
dapat diakses keyboard. - Menggunakan bahasa Indonesia yang konsisten. -
Menggunakan format tanggal Indonesia dan rupiah. - Tidak terlihat
seperti hasil generator template AI.

## 5. Workflow setiap fase

Sebelum coding: 1. Baca dokumen terkait. 2. Periksa struktur repository
dan kode yang sudah ada. 3. Identifikasi komponen/fungsi yang dapat
digunakan kembali. 4. Buat rencana perubahan singkat. 5. Jangan menimpa
pekerjaan yang sudah ada tanpa memeriksa dampaknya.

Saat coding: 1. Implementasikan ruang lingkup fase yang diminta saja. 2.
Ikuti struktur yang sudah ada. 3. Gunakan migration dan seeder yang
dapat diulang dengan aman. 4. Tambahkan test. 5. Perbarui dokumentasi
jika ada perubahan.

Setelah coding: 1. Jalankan test backend. 2. Jalankan lint/build
frontend. 3. Periksa error console dan network. 4. Uji role/permission.
5. Laporkan file yang dibuat/diubah. 6. Laporkan test yang dijalankan
dan hasilnya. 7. Catat pekerjaan yang belum selesai.

## 6. Aturan data dan keamanan

-   Semua operasi sensitif divalidasi backend.
-   Batasi akses berdasarkan role dan tim.
-   Audit perubahan data penting.
-   File upload disimpan aman.
-   Jangan menampilkan stack trace pada production.
-   Jangan commit `.env`, token, password, atau credential.
-   Jangan menghapus audit log melalui UI.
-   Jangan melakukan override batas tanpa keputusan resmi.

## 7. Ketentuan output agent

Pada akhir setiap fase, berikan: - Ringkasan implementasi. - Daftar file
penting. - Migration/seed yang dibuat. - Endpoint yang tersedia. - Test
yang dijalankan. - Hasil build. - Known issues. - Rekomendasi fase
berikutnya.

Jangan menyatakan fitur selesai jika test atau build yang relevan belum
dijalankan.
