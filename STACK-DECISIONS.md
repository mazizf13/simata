# ARCHITECTURAL & STACK DECISIONS --- SIMATA
**Dokumen:** Stack Decisions & Technical Specifications  
**Status:** Approved Architectural Decision Record (ADR)  
**Proyek:** SIMATA (Sistem Manajemen Mitra BPS Kabupaten Mojokerto)  
**Tahun Implementasi:** 2026  

---

## 1. Ikhtisar Keputusan Arsitektur

Dokumen *Architectural Decision Record* (ADR) ini meresmikan seluruh keputusan pemilihan teknologi, pustaka, protokol komunikasi, dan strategi deployment untuk sistem SIMATA. Setiap keputusan dilengkapi dengan konteks masalah, opsi yang dipertimbangkan, alasan pemilihan (*rationale*), serta mitigasi risiko yang disepakati.

---

## 2. Matriks Keputusan Teknologi

```
+---------------------------------------------------------------------------------------+
|                                    SISTEM SIMATA                                      |
+---------------------------------------------------------------------------------------+
|  FRONTEND SPA                                                                         |
|  - React 18.3.1 + Vite 6                                                              |
|  - INA Digital Design System (@idds/react 1.6.66 + @idds/styles 1.6.38)               |
|  - Tailwind CSS v4 (@tailwindcss/vite) + Token Warna IDDS                             |
|  - TanStack React Query v5 + Axios Client                                             |
|  - React Hook Form v7 + Zod Schema Validation                                         |
|  - @tabler/icons-react                                                                |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            | (Single-Domain / Same-Origin)
                                            | (Sanctum Session Cookie + CSRF)
                                            v
+---------------------------------------------------------------------------------------+
|  BACKEND API & BUSINESS CORE                                                          |
|  - Laravel 11.x / 12.x (Target Runtime PHP 8.2 / 8.3 LTS)                             |
|  - RESTful JSON API (/api/*) + Form Requests + Eloquent Resources                     |
|  - Business Engine: AssignmentService, LimitValidationAction, AuditLogger             |
|  - Concurrency: DB Transactions + Pessimistic Row Locking (lockForUpdate)             |
|  - Maatwebsite Laravel-Excel / PhpSpreadsheet                                         |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|  PERSISTENCE & DEPLOYMENT                                                             |
|  - MySQL 8.0 (InnoDB, UTF-8 Collation, Composite FKs & Indexes)                       |
|  - cPanel Hosting (Single-Domain Separation: simata_app/ [core] + public_html/ [web])  |
+---------------------------------------------------------------------------------------+
```

---

## 3. Rincian Architectural Decision Record (ADR)

### ADR-01: Backend Framework & Versi Target PHP
- **Status:** Diterima (*Accepted*)
- **Keputusan:** Menggunakan **Laravel 11.x / 12.x** dengan target standar kode **PHP 8.2 / 8.3**.
- **Konteks:** Mesin pengembang lokal terpasang PHP 8.5.11 (dev/experimental build Laragon), sementara target server produksi adalah cPanel shared/cloud hosting di Indonesia yang umumnya menyediakan PHP 8.2 dan 8.3 secara stabil.
- **Alternatif yang Dipertimbangkan:**
  1. *Menggunakan fitur bleeding-edge PHP 8.5:* Berisiko fatal pada saat deployment ke cPanel karena extension atau interpreter PHP 8.5 belum stabil di MultiPHP Manager.
  2. *Mempertahankan PHP 8.1:* Versi PHP 8.1 telah mendekati akhir masa dukungan resmi komunitas Laravel.
- **Konsekuensi & Tindakan:**
  - Konfigurasi `composer.json` mengunci `"php": "^8.2"`.
  - Kode tidak boleh menggunakan sintaks eksperimental PHP 8.5.
  - Memastikan seluruh developer/CI melakukan pengujian dengan baseline PHP 8.2/8.3.

---

### ADR-02: Struktur Repositori & Pola Komunikasi (Single Monorepo)
- **Status:** Diterima (*Accepted*)
- **Keputusan:** Menggabungkan Laravel dan React Vite dalam **satu repositori terpadu (*Single Monorepo*)** yang disajikan pada **satu domain/origin yang sama**.
- **Konteks:** SIMATA adalah aplikasi administrasi institusi internal. Memisahkan repositori backend dan frontend ke dua domain berbeda (misal `api.bps.go.id` dan `app.bps.go.id`) menambah kompleksitas konfigurasi CORS, SSL certificate ganda, dan kerentanan session cross-origin di cPanel.
- **Alasan Pemilihan:**
  - Build frontend langsung menghasilkan bundle ke `public/build`.
  - Rute web Laravel melayani berkas HTML pembungkus (`app.blade.php`), sementara seluruh interaksi data menggunakan rute `/api/*`.
  - Memudahkan otomatisasi rilis dan pengujian end-to-end tanpa sinkronisasi commit lintas repositori.

---

### ADR-03: Mekanisme Autentikasi SPA: Laravel Sanctum Session Cookie
- **Status:** Diterima (*Accepted*)
- **Keputusan:** Menggunakan **Laravel Sanctum Stateful Session Cookie Authentication**, bukan Personal Access Token (Bearer Token) di `localStorage`.
- **Konteks:** Sistem mengelola data nama mitra, identitas, rekening/anggaran, dan nominal honor mitra sensus BPS. Keamanan data adalah prioritas utama.
- **Alternatif yang Dipertimbangkan:**
  1. *Bearer Token disimpan di `localStorage`:* Sangat rentan terhadap pencurian token melalui serangan Cross-Site Scripting (XSS).
  2. *JWT dengan Refresh Token Rotation:* Terlalu kompleks untuk arsitektur internal single-domain dan tidak memberikan keuntungan nyata dibanding session cookie.
- **Alasan Pemilihan:**
  - Cookie sesi Laravel (`laravel_session`) terlindungi atribut `HttpOnly`, `SameSite=Lax`, dan `Secure` (tidak dapat dibaca oleh JavaScript jahat).
  - Dilengkapi verifikasi token proteksi CSRF otomatis (`XSRF-TOKEN`).
  - Proses logout mematikan sesi langsung di server (*session invalidation*).

---

### ADR-04: UI Component Library: INA Digital Design System (@idds/react)
- **Status:** Diterima (*Accepted*)
- **Keputusan:** Menggunakan pustaka resmi pemerintah **`@idds/react` (v1.6.66)** bersama paket style terpusat **`@idds/styles` (v1.6.38)**.
- **Konteks:** SIMATA wajib mengikuti standar identitas visual pemerintah Indonesia (INA Digital). Pustaka UI tidak boleh diganti dengan Tailwind UI, Ant Design, Shadcn, MUI, atau template dashboard SaaS komersial lainnya.
- **Hasil Validasi Paket:**
  - Komponen menggunakan styling CSS murni dengan kelas BEM (`ina-*`).
  - File style diimpor satu kali pada entry point frontend: `import '@idds/react/index.css';`.
  - Pustaka menyediakan komponen lengkap: `TextField`, `TextArea`, `SelectDropdown`, `DatePicker`, `Table`, `Modal`, `Button`, `Badge`, `ToastProvider`, `ConfirmationProvider`, `Pagination`.
- **Larangan Ketat:**
  - Pengembang dilarang mengarang props atau nama komponen.
  - Properti Button menggunakan `hierarchy: 'primary' | 'secondary' | 'tertiary'`, bukan `variant`.
  - Properti Badge menggunakan `variant: 'success' | 'danger' | 'warning' | 'info' | 'neutral'` dan `type: 'solid' | 'soft' | 'outline'`.

---

### ADR-05: Integrasi CSS Utility: Tailwind CSS v4 & Token IDDS
- **Status:** Diterima (*Accepted*)
- **Keputusan:** Menggunakan **Tailwind CSS v4** melalui plugin resmi `@tailwindcss/vite` untuk tata letak halaman dan menyuntikkan token warna IDDS melalui `@idds/styles/tailwind/css/idds.css`.
- **Konteks:** Komponen `@idds/react` menangani styling komponen internalnya secara mandiri. Namun, aplikasi tetap membutuhkan utility styling untuk grid layout halaman, flexbox responsive, spacing, dan card wrapper.
- **Alur Konfigurasi:**
  1. Vite Plugin: `@tailwindcss/vite`.
  2. Stylesheet `resources/css/app.css`:
     ```css
     @import "tailwindcss";
     @import "@idds/styles/tailwind/css/idds.css";
     ```
  3. Hal ini memungkinkan pemakaian kelas utilitas seperti `border-stroke-primary` atau `bg-surface-neutral` yang sepenuhnya harmonis dengan token desain INA Digital.

---

### ADR-06: Manajemen State Frontend & Komunikasi HTTP
- **Status:** Diterima (*Accepted*)
- **Keputusan:** Menggunakan **TanStack React Query v5** untuk *Server State Management* dan **Axios** sebagai klien HTTP.
- **Konteks:** Aplikasi administrasi tabel memiliki banyak filter (bulan/tahun, tim, kecamatan, status, pagination). State lokal Redux/Zustand berlebih jika hanya digunakan untuk caching data server.
- **Alasan Pemilihan:**
  - TanStack Query menyediakan fitur caching otomatis, *invalidation on mutation* (misal: setelah persetujuan penugasan, query rekap otomatis diperbarui), dan penanganan state bawaan (`isLoading`, `isError`, `data`).
  - Axios secara bawaan mendukung pengiriman cookie kredensial (`withCredentials: true`) dan pembacaan header `X-XSRF-TOKEN` dari Laravel.

---

### ADR-07: Pengelolaan Formulir & Validasi Klien: React Hook Form + Zod
- **Status:** Diterima (*Accepted*)
- **Keputusan:** Mengadopsi **React Hook Form v7** dipadukan dengan **Zod** untuk validasi skema frontend.
- **Konteks:** Formulir penugasan (terutama bulk assignment dan multi-row mapping) memiliki interaksi dinamis. Penggunaan state biasa menyebabkan re-rendering berlebihan.
- **Alasan Pemilihan:**
  - `@idds/react` sudah memiliki dependensi internal ke `react-hook-form: '^7.60.0'`.
  - Zod memungkinkan pendefinisian skema tipe aman TypeScript/JavaScript yang selaras dengan aturan Form Request Laravel.
  - *Catatan Prinsip:* Validasi Zod di frontend hanya untuk panduan interaktif pengguna; validasi Form Request Laravel di backend tetap menjadi sumber kebenaran hukum transaksi.

---

### ADR-08: Penanganan Concurrency & Validasi Batas Honor di Database
- **Status:** Diterima (*Accepted*)
- **Keputusan:** Menggunakan **Database Transaction** dengan **Pessimistic Row-Level Locking (`SELECT ... FOR UPDATE`)** pada record Mitra saat membuat atau mengubah status penugasan.
- **Konteks:** Aturan batas bulanan BPS adalah: **Maksimal 10 penugasan ATAU total honor Rp4.000.000**. Validasi batas bersifat mutlak (*hard limit*, tidak ada override pada MVP). Concurrency dapat menyebabkan dua penugasan lolos bersamaan jika hanya membaca agregat tanpa locking.
- **Alasan Pemilihan:**
  - Penguncian baris mitra (`$mitra->lockForUpdate()`) menserialisasi seluruh operasi yang menargetkan mitra yang sama dalam satu transaksi atomik.
  - Pengurutan `mitra_ids` secara ascending pada bulk assignment mencegah terjadinya deadlock basis data.
  - Perhitungan honor selalu menggunakan `DECIMAL(15,2)` dengan pembulatan rupiah standar tanpa kompromi presisi floating-point.

---

### ADR-09: Pengolahan File Excel: Maatwebsite Laravel-Excel / PhpSpreadsheet
- **Status:** Diterima (*Accepted*)
- **Keputusan:** Menggunakan **Maatwebsite/Laravel-Excel (PhpSpreadsheet)** untuk pengolahan import Excel lama (Uraian Tugas 1–7) dan ekspor laporan rekap.
- **Konteks:** Format lama BPS Mojokerto menggunakan baris horizontal dengan hingga 7 kelompok tugas. Import memerlukan pemrosesan batch, pembacaan sel bertipe campuran, dan normalisasi tanggal/rupiah.
- **Alasan Pemilihan:**
  - Pustaka standar de-facto di Laravel dengan dukungan `WithChunkReading`, `WithBatchInserts`, dan memori efisien.
  - Server lokal maupun hosting cPanel telah memenuhi syarat modul `php-zip`, `php-gd`, dan `php-xml`.

---

### ADR-010: Topologi Hosting & Deployment cPanel
- **Status:** Diterima (*Accepted*)
- **Keputusan:** Menerapkan strategi **Document Root Separation** di cPanel.
- **Konteks:** Keamanan berkas `.env` dan kode sumber aplikasi di shared hosting.
- **Spesifikasi Teknis:**
  - Folder aplikasi diletakkan di luar root web: `/home/user/simata_core/`.
  - Folder publik dihubungkan atau dipindahkan ke: `/home/user/public_html/`.
  - Penyesuaian `index.php` pada `public_html/`:
    ```php
    require __DIR__.'/../simata_core/vendor/autoload.php';
    $app = require_once __DIR__.'/../simata_core/bootstrap/app.php';
    ```
  - Aset Vite (`public/build`) diunggah langsung ke `public_html/build`.
  - Melindungi storage internal dan mencegah eksekusi skrip PHP di dalam folder upload berkas Excel.

---

## 4. Ringkasan Versi Stack Terpilih

| Lapisan | Pustaka / Teknologi | Versi Terpilih | Catatan Kompatibilitas |
| :--- | :--- | :--- | :--- |
| **Backend Core** | Laravel Framework | `^11.0` / `^12.0` | Target PHP 8.2 / 8.3 |
| **Frontend Framework** | React + ReactDOM | `^18.3.1` | Didukung IDDS (>=18.0.0) |
| **Frontend Bundler** | Vite | `^6.0` | `@vitejs/plugin-react` + `laravel-vite-plugin` |
| **Design System** | `@idds/react` | `1.6.66` | INA Digital Design System Resmi |
| **Style Tokens** | `@idds/styles` | `1.6.38` | Pure CSS BEM Bundle |
| **Utility CSS** | Tailwind CSS | `^4.0` | Integrasi via `@tailwindcss/vite` |
| **Icon Pack** | `@tabler/icons-react` | `^3.50.0` | Ikon formal institusional |
| **Server State** | `@tanstack/react-query` | `^5.60.0` | Caching data server & filter |
| **HTTP Client** | Axios | `^1.7.0` | WithCredentials & CSRF token |
| **Form Management** | `react-hook-form` | `^7.60.0` | Digunakan oleh IDDS internal |
| **Validation Schema** | `zod` | `^3.24.0` | Schema validator frontend |
| **Date Utility** | `date-fns` | `^4.1.0` | Format tanggal Bahasa Indonesia |
| **Excel Engine** | `maatwebsite/excel` | `^3.1` | Import Uraian Tugas 1–7 & Export |
| **Database Engine** | MySQL | `8.0` | InnoDB, `lockForUpdate`, DECIMAL |
| **Testing Backend** | PHPUnit / Pest | `^11.0` | Pengujian Limit & Concurrency |
| **Testing Frontend** | Vitest | `^3.0` | Pengujian komponen wrapper IDDS |
