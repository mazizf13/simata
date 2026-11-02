# COMPATIBILITY REPORT & RISK MITIGATION --- SIMATA
**Dokumen:** Compatibility Report (Phase 0 Technical Validation)  
**Status:** Complete / Verified  
**Sistem:** SIMATA (Sistem Manajemen Mitra BPS Kabupaten Mojokerto)  
**Penyusun:** Senior Software Architect & Technical Lead  
**Tanggal:** 2 November 2026  

---

## 1. Matriks Kompatibilitas Menyeluruh

Laporan ini memetakan kompatibilitas antar modul, dependensi pihak ketiga, lingkungan hosting, serta pustaka antarmuka pengguna untuk memastikan tidak ada konflik dependensi saat fase implementasi.

```
+----------------------------------------------------------------------------------------------------------+
|                                    MATRIKS KOMPATIBILITAS SIMATA                                         |
+----------------------------------------------------------------------------------------------------------+
| Komponen          | Versi Dipilih       | Target Server (cPanel)     | Status Kompatibilitas & Catatan  |
+-------------------+---------------------+----------------------------+----------------------------------+
| PHP Runtime       | 8.2 / 8.3 LTS       | MultiPHP 8.2 / 8.3         | PASS (Baseline aman untuk hosting)|
| Composer          | 2.10.x              | N/A (Build lokal / CI)     | PASS (Manajemen dependensi PHP)  |
| Node.js / npm     | v24.x / npm 11.x    | N/A (Build lokal / CI)     | PASS (Vite asset build)          |
| Laravel Framework | 11.x / 12.x         | PHP 8.2+                   | PASS (Dukungan LTS & stabil)     |
| MySQL Server      | 8.0.x               | MySQL 8.0 / MariaDB 10.6+  | PASS (InnoDB, Row Locks, JSON)   |
| React / ReactDOM  | 18.3.1              | Browser Desktop / Modern   | PASS (Didukung @idds/react)      |
| @idds/react       | 1.6.66              | React >= 18.0.0            | PASS (Komponen Resmi INA Digital)|
| @idds/styles      | 1.6.38              | Pure CSS (BEM namespaced)  | PASS (Isolasi style murni)       |
| Tailwind CSS      | v4.0                | @tailwindcss/vite          | PASS (Tidak bentrok dengan IDDS) |
| Tabler Icons      | 3.50.0              | React >= 16                | PASS (Ikon institusional formal) |
| TanStack Query    | 5.x                 | React 18 / 19              | PASS (Server state caching)      |
| React Hook Form   | 7.60.x              | Didukung @idds/react       | PASS (Dipakai internal IDDS)     |
| PhpSpreadsheet    | ^3.1                | PHP ext zip, gd, xml       | PASS (Modul PHP tersedia)        |
+----------------------------------------------------------------------------------------------------------+
```

---

## 2. Analisis Rinci Potensi Masalah Kompatibilitas & Solusi

### 2.1 Kompatibilitas PHP: Lingkungan Dev (PHP 8.5) vs cPanel Target (PHP 8.2/8.3)
- **Isu:** Lingkungan mesin pengembang lokal menjalankan `PHP 8.5.11` (versi pra-rilis dari Laragon), sedangkan server cPanel shared/cloud hosting di Indonesia umumnya menyediakan PHP versi `8.2` atau `8.3`.
- **Potensi Risiko:** Jika pengembang secara tidak sengaja menggunakan fitur sintaksis yang hanya ada di PHP 8.4/8.5, aplikasi akan mengalami *Fatal Parse Error* saat dideploy di cPanel.
- **Tindakan Mitigasi:**
  1. Kunci versi platform pada `composer.json`:
     ```json
     "config": {
       "platform": {
         "php": "8.2.0"
       }
     }
     ```
  2. Ini memaksa Composer hanya mengunduh dependensi yang kompatibel dengan PHP 8.2, dan mencegah penggunaan library yang memerlukan PHP 8.4+.
  3. Menggunakan static analysis (PHPStan / Rector) pada level target PHP 8.2.

---

### 2.2 Kompatibilitas React: React 18 vs React 19 dengan Ekosistem IDDS
- **Isu:** React 19 telah dirilis, namun sejumlah pustaka ekosistem React terkadang memiliki batasan deklarasi *peer dependency* yang memicu peringatan `--legacy-peer-deps`.
- **Hasil Audit Paket:**
  - `@idds/react` versi `1.6.66` memiliki deklarasi `peerDependencies`:
    ```json
    "peerDependencies": {
      "react": ">=18.0.0",
      "react-dom": ">=18.0.0"
    }
    ```
  - Pustaka `@tanstack/react-query` versi `5.105.x` mendukung `"react": "^18 || ^19"`.
  - Pustaka `@tabler/icons-react` mendukung `"react": ">= 16"`.
- **Rekomendasi Final:**
  - Menggunakan **React 18.3.1**.
  - Versi ini merupakan versi LTS yang paling stabil, teruji di lingkungan produksi pemerintah, dan bebas dari isu re-render / hydration breaking changes.

---

### 2.3 Kompatibilitas Styling: @idds/styles dengan Tailwind CSS v4
- **Isu:** Potensi benturan gaya (*CSS specificity collision*) antara CSS reset/preflight Tailwind dengan gaya komponen INA Digital.
- **Hasil Audit Langsung pada Berkas Paket `@idds/styles`:**
  - Komponen IDDS menggunakan kelas BEM berawalan `ina-` (misalnya: `.ina-button`, `.ina-textfield`, `.ina-modal`).
  - Style IDDS terisolasi pada nama-nama kelas tersebut dan tidak menggunakan utility Tailwind secara langsung.
  - `@idds/styles` secara resmi menyediakan token Tailwind v4 pada direktori `dist/tailwind/css/idds.css`.
- **Pola Integrasi yang Diverifikasi:**
  1. Entry point JavaScript (`resources/js/app.jsx`):
     ```jsx
     import '@idds/react/index.css'; // Wajib diimpor pertama
     import '../css/app.css';
     ```
  2. Stylesheet aplikasi (`resources/css/app.css`):
     ```css
     @import "tailwindcss";
     @import "@idds/styles/tailwind/css/idds.css";
     ```
  3. Hasil: Kelas utilitas Tailwind berfungsi normal untuk penataan grid dan margin/padding kontainer tanpa menimpa (*override*) aturan internal tombol, input, maupun tabel INA Digital.

---

### 2.4 Kompatibilitas Basis Data: Concurrency & Lock For Update
- **Isu:** Pengujian aturan batas bulanan (Maks 10 tugas OR Rp4.000.000) terhadap permintaan konkuren (*simultaneous requests*).
- **Hasil Audit:**
  - Mesin MySQL 8.0 lokal dan server produksi cPanel (MySQL 8.0 atau MariaDB 10.6+) menggunakan storage engine **InnoDB** yang mendukung penuh **Row-Level Locking** dan level isolasi transaksi *Repeatable Read*.
- **Potensi Risiko:**
  - Terjadinya *deadlock* saat bulk assignment jika dua request menugaskan tugas ke kumpulan mitra yang sama dengan urutan ID berbeda.
- **Tindakan Mitigasi:**
  - Seluruh operasi bulk assignment wajib mengurutkan ID mitra secara ascending (`collect($mitraIds)->sort()`) sebelum menjalankan `lockForUpdate()`.
  - Menetapkan batas timeout transaksi dan menyertakan penanganan `QueryException` untuk melakukan retry otomatis secara terbatas (maksimal 3 kali) pada kasus deadlock.

---

### 2.5 Kompatibilitas Import Workbook Excel Lama
- **Isu:** File Excel lama BPS Kabupaten Mojokerto menyimpan penugasan dalam 7 kelompok kolom horizontal (`Uraian Tugas 1` s.d. `Uraian Tugas 7`) dengan format tanggal, nominal uang, dan ejaan nama yang bervariasi.
- **Hasil Audit Mekanisme Import:**
  - Tipe sel pada kolom harga satuan dan nilai perjanjian sering kali tercampur antara teks berawalan `"Rp"`, angka berpemisah titik, atau nilai kosong `"-"`.
  - Satu nomor SPK dapat terbagi ke dalam beberapa baris jika satu baris tidak muat.
- **Tindakan Mitigasi:**
  1. **Dynamic Chunk Importer:** Memanfaatkan `PhpSpreadsheet` dengan pembacaan berbasis streaming/chunk untuk mencegah konsumsi memori berlebih (*Out of Memory*).
  2. **Sanitizer String Moneter:** Membuat parser khusus yang membersihkan simbol non-numerik sebelum konversi ke tipe `DECIMAL(15,2)`.
  3. **Tahap Dua Langkah (Preview & Commit):**
     - Tahap 1: Parser membaca file, memvalidasi baris, dan menampilkan ringkasan preview (jumlah baris valid, baris duplikat, tugas tidak dikenal).
     - Tahap 2: Pengguna mengonfirmasi tombol commit sebelum data disimpan ke database permanen.

---

## 3. Persyaratan Spesifik Deployment Hosting cPanel

| Kebutuhan Hosting | Spesifikasi Minimum | Rekomendasi Konfigurasi cPanel |
| :--- | :--- | :--- |
| **Versi PHP** | PHP 8.2 | Diaktifkan via MultiPHP Manager |
| **PHP Memory Limit** | 256 MB | Mengakomodasi parsing berkas Excel bertugas jamak |
| **Max Execution Time** | 120 detik | Mencegah timeout saat impor massal |
| **Ekstensi PHP Wajib** | `pdo_mysql`, `bcmath`, `intl`, `zip`, `gd`, `fileinfo`, `mbstring`, `openssl`, `curl` | Diaktifkan melalui cPanel PHP Extensions / Select PHP Version |
| **Struktur Direktori** | Pemisahan Folder Core & Web | `app_core/` (di luar public) dan `public_html/` (hanya index.php + build) |
| **Cron Job (Scheduler)** | Opsional (setiap menit jika ada antrean) | `* * * * * /usr/local/bin/php /home/user/simata_core/artisan schedule:run >> /dev/null 2>&1` |
| **Sertifikat SSL / HTTPS** | Wajib Aktif (Let's Encrypt / AutoSSL) | Menjamin pengiriman session cookie aman (`Secure=true`) |

---

## 4. Rekomendasi Checklist Menuju Phase 1

1. [x] **Evaluasi Dependensi Selesai:** Seluruh dependensi utama (`@idds/react`, Tailwind v4, Sanctum, TanStack Query, PhpSpreadsheet) telah diuji kelayakannya.
2. [x] **Pilihan Arsitektur Terkunci:** Monorepo Single-Domain dengan autentikasi session cookie Sanctum.
3. [x] **Rancangan Basis Data Diverifikasi:** Foreign key komposit untuk SPK, field snapshot untuk transaksi historis, dan mekanisme *row locking* untuk integritas batas bulanan.
4. [ ] **Langkah Lanjutan (Phase 1 — Foundation):**
   - Inisialisasi kerangka kerja Laravel 11/12 dan integrasi Vite + React 18.
   - Pemasangan pustaka `@idds/react` dan konfigurasi Tailwind CSS v4.
   - Pembuatan layout dasar institusional (`AppShell`, `Sidebar`, `Header`) sesuai panduan visual `DESIGN.md`.
   - Setup migrasi pengguna, sistem autentikasi sesi, dan kontrak standar respons API JSON.
