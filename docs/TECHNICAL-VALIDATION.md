# TECHNICAL VALIDATION REPORT --- SIMATA BPS KABUPATEN MOJOKERTO
**Dokumen:** Technical Validation (Phase 0)  
**Status:** Approved / Validated  
**Peran:** Senior Software Architect & Technical Lead  
**Target Aplikasi:** SIMATA (Sistem Manajemen Mitra BPS Kabupaten Mojokerto - Kode Wilayah 3516)  
**Tanggal Validasi:** 2 November 2026  

---

## 1. Executive Summary

Laporan ini menyajikan hasil validasi teknis menyeluruh (Phase 0) terhadap spesifikasi arsitektur, dependensi pustaka antarmuka, model basis data relasional, integritas konkurensi bisnis, dan kesiapan infrastruktur hosting cPanel untuk aplikasi SIMATA.

Tujuan utama SIMATA adalah mentransformasikan tata kelola penugasan mitra kerja BPS Kabupaten Mojokerto dari format lembar kerja horizontal (*spreadsheet* dengan kolom berulang *Uraian Tugas 1 s.d. 7*) menjadi sistem relasional berbasis web terpusat. Berdasarkan seluruh dokumen acuan (`README.md`, `PRD.md`, `BUSINESS-RULES.md`, `DATABASE.md`, `ARCHITECTURE.md`, `DESIGN.md`, `ROUTES.md`, `API.md`, `IMPORT-EXPORT.md`, `SECURITY.md`, `DEVELOPMENT-PLAN.md`, `AGENTS.md`), validasi teknis ini mengonfirmasi kelayakan stack yang dipilih dan menetapkan pagar pembatas arsitektural sebelum implementasi Phase 1 dimulai.

---

## 2. Validasi Environment & Infrastruktur

### 2.1 Kondisi Environment Aktual (Mesin Pengembang)
Berdasarkan audit langsung pada lingkungan sistem lokal:

| Komponen | Versi Terpasang | Status Evaluasi | Rekomendasi untuk SIMATA |
| :--- | :--- | :--- | :--- |
| **PHP Runtime** | `PHP 8.5.11 (cli)` (Laragon ZTS x64) | Terpasang (Versi Development/Bleeding-edge) | **Gunakan PHP 8.2 atau 8.3 sebagai target kompatibilitas.** PHP 8.5 lokal aman untuk eksekusi CLI, namun kode harus mematuhi standar PHP 8.2/8.3 LTS agar 100% kompatibel dengan cPanel MultiPHP. |
| **Composer** | `2.10.3` | Memenuhi syarat | Standard Composer v2, siap mengelola dependensi Laravel. |
| **Node.js** | `v24.21.0` | Memenuhi syarat (Modern LTS) | Digunakan untuk proses build Vite lokal / CI pipeline. |
| **npm** | `11.19.0` | Memenuhi syarat | Kompatibel penuh dengan resolusi paket npm modern. |
| **MySQL Server** | `8.0.30 Community Server` | Memenuhi syarat | Mendukung penuh transaksi InnoDB, Row-Level Locking (`FOR UPDATE`), tipe data `DECIMAL(15,2)`, dan kolom `JSON`. |

### 2.2 Extension PHP yang Diperlukan
Hasil verifikasi modul PHP aktif (`php -m`) memastikan seluruh modul yang diwajibkan oleh Laravel 11/12 dan PhpSpreadsheet telah tersedia:
- **Core Laravel:** `openssl`, `pdo`, `pdo_mysql`, `mbstring`, `tokenizer`, `xml`, `ctype`, `json`, `fileinfo`, `curl`.
- **Manipulasi Angka & Presisi Keuangan:** `bcmath` (Tersedia — krusial untuk kalkulasi honor tanpa floating-point rounding issue).
- **Format Tanggal & Lokalisasi:** `intl` (Tersedia — wajib untuk format tanggal dan mata uang Bahasa Indonesia `id_ID`).
- **Import/Export Spreadsheet & Dokumen:** `zip`, `gd`, `SimpleXML`, `xmlreader`, `xmlwriter` (Semua tersedia untuk pengolahan file Excel BPS).

### 2.3 Persyaratan Infrastruktur Deployment cPanel
Shared hosting / Cloud cPanel memiliki karakteristik arsitektur khusus yang harus diantisipasi sejak awal:
1. **Pemisahan Direktori Publik (*Document Root*):**
   - Di lingkungan cPanel standar, *Document Root* domain utama umumnya terkunci pada direktori `public_html/`.
   - **Aturan Keamanan Mutlak:** Kode sumber aplikasi Laravel (`app/`, `bootstrap/`, `config/`, `routes/`, `.env`, dll.) **TIDAK BOLEH** diletakkan di dalam `public_html/` karena berisiko kebocoran berkas `.env` dan file transaksi.
   - **Pola Deployment Terpilih:**
     - Direktori inti diletakkan pada level root pengguna: `/home/user/simata_app/`.
     - Isi direktori `public/` (termasuk berkas `index.php`, `.htaccess`, dan aset `build/`) diletakkan di `/home/user/public_html/`.
     - Berkas `index.php` disesuaikan untuk merujuk ke `/home/user/simata_app/bootstrap/app.php`.
2. **Ketersediaan Node.js pada cPanel:**
   - Server cPanel sering kali tidak memiliki runtime Node.js atau versi npm yang memadai untuk proses build frontend di server.
   - **Strategi Build:** Proses build aset frontend (`npm run build`) dilakukan di mesin lokal pengembang atau melalui GitHub Actions / CI/CD pipeline, kemudian direktori `public/build` diunggah ke cPanel. Server hosting hanya melayani file statis hasil kompilasi Vite.
3. **Konfigurasi Proteksi Berkas Upload & Storage:**
   - Direktori `storage/app/private` digunakan untuk menampung file upload Excel sementara sebelum di-commit.
   - Hak akses folder `storage/` dan `bootstrap/cache/` diatur pada `755` (direktori) dan `644` (berkas).
4. **PHP Max Execution Time & Memory Limit:**
   - Operasi import Excel horizontal (memecah ribuan baris Uraian Tugas 1–7) memerlukan alokasi `memory_limit` minimal 256MB dan `max_execution_time` minimal 120 detik pada php.ini cPanel.

---

## 3. Hasil Validasi INA Digital Design System (@idds/react)

Sebagai aplikasi institusional pemerintah Republik Indonesia, SIMATA mengadopsi **INA Digital Design System (IDDS)**. Pemeriksaan mendalam dilakukan langsung pada artefak npm `@idds/react` (versi `1.6.66`) dan `@idds/styles` (versi `1.6.38`).

### 3.1 Arsitektur Gaya & Isolasi CSS
- Paket `@idds/react` dibangun menggunakan pure CSS dengan konvensi penamaan kelas BEM (seperti `ina-button`, `ina-textfield`, `ina-badge`).
- **Gaya IDDS TIDAK bergantung pada utility classes Tailwind CSS.**
- File styling didistribusikan terpusat melalui `@idds/styles/dist/index.css`.
- **Aturan Import Wajib:**
  ```jsx
  // resources/js/app.jsx (Entry Point Frontend)
  import '@idds/react/index.css'; // Wajib diimpor pertama kali
  import '../css/app.css';        // Stylesheet aplikasi & Tailwind
  ```
  Urutan ini menjamin bahwa style dasar dan komponen INA Digital dimuat sebelum stylesheet kustom aplikasi.

### 3.2 Kompatibilitas dengan Tailwind CSS
- Integrasi Tailwind CSS dengan IDDS bersifat **opsional dan komplementer**. Tailwind digunakan untuk tata letak (*layout grid*, *flexbox*, margin, padding halaman SIMATA), bukan untuk merombak tampilan internal komponen IDDS.
- Token warna resmi INA Digital dapat diekspos ke Tailwind melalui:
  - Pada Tailwind v4: `@import "@idds/styles/tailwind/css/idds.css";` di dalam `resources/css/app.css`.
  - Pada Tailwind v3: `import iddsTokens from '@idds/styles/tailwind/ts/idds';` di dalam `tailwind.config.js`.
- Dengan pendekatan ini, pengembang dapat menggunakan kelas semantik seperti `border-stroke-primary` atau `text-primary-600` yang serasi dengan komponen IDDS.

### 3.3 Kompatibilitas React
- `peerDependencies` paket `@idds/react` mendefinisikan: `react: ">=18.0.0"` dan `react-dom: ">=18.0.0"`.
- Paket ini terbukti kompatibel dengan **React 18.3.1** dan **React 19.x**.
- **Rekomendasi Arsitektural:** Gunakan **React 18.3.1** untuk stabilitas maksimum pada tahap awal, guna menjamin kompatibilitas tanpa peringatan resolusi peer-dependency dengan pustaka ekosistem lain (`react-hook-form 7.60.0`, `@tanstack/react-query 5.x`).

### 3.4 Inventaris Komponen Resmi (Larangan Halusinasi API)
Berdasarkan manual resmi paket (`AGENT.md` dan deklarasi tipe TypeScript `dist/types/index.d.ts`), komponen-komponen resmi berikut tersedia dan siap digunakan dalam SIMATA:

#### A. Formulir & Masukan Data (*Form Inputs*)
1. **`TextField`**
   - *Props Wajib/Utama:* `value: string`, `onChange: (val: string) => void`, `label: ReactNode`, `placeholder: string`, `status: 'neutral' | 'error' | 'warning' | 'success'`, `statusMessage: ReactNode`, `errorMessage?: string`, `size: 'sm' | 'md' | 'lg'`, `showClearButton?: boolean`.
2. **`TextArea`**
   - *Props:* `value`, `onChange`, `label`, `rows` (default: 4), `maxLength`, `showCharCount`.
3. **`PasswordInput`**
   - Masukan password terenkapsulasi dengan tombol toggle tampilkan/sembunyikan sandi.
4. **`InputSearch`**
   - Komponen pencarian bawaan dengan ikon kaca pembesar dan tombol reset terintegrasi.
5. **`SelectDropdown`**
   - Pilihan dropdown fleksibel dengan fitur pencarian interaktif.
   - *Props:* `options: Array<{ label: string; value: any; disabled?: boolean }>`, `selected: any`, `onSelect: (val: any) => void`, `searchable: boolean`, `placeholder: string`, `multiple?: boolean`.
6. **`DatePicker`**
   - *Props:* `mode: 'single' | 'range' | 'multiple'`, `selected: Date | null`, `onChange: (d: any) => void`, `minDate`, `maxDate`.
7. **`Checkbox`** & **`RadioInput`**
   - Pilihan boolean dan grup pilihan radio.
8. **`Toggle`**
   - Komponen sakelar status (*switch toggle*).
9. **`FileUpload`** / **`SingleFileUpload`**
   - Area unggah berkas drag-and-drop dengan validasi tipe dan ukuran (ideal untuk modul upload Excel).

#### B. Umpan Balik & Interaksi (*Feedback & Overlays*)
1. **`Modal`**
   - Dialog modal berbasis portal.
   - *Props:* `open: boolean`, `onClose: () => void`, `title: ReactNode`, `size: 'sm' | 'md' | 'lg' | 'xl' | 'full'`, `closeOnBackdrop: boolean`.
2. **`Drawer`**
   - Panel geser samping (untuk navigasi mobile atau filter mendalam).
3. **`ToastProvider`** & **`useToast`**
   - Penyedia notifikasi toast asinkron. Memanggil `toast({ state: 'positive' | 'destructive' | 'warning' | 'info', title, description })`.
4. **`ConfirmationProvider`** & **`useConfirmation`**
   - Hook dialog konfirmasi modal (`const isConfirmed = await confirm({ title, message, confirmText, cancelText })`) untuk pembatalan penugasan atau tindakan destruktif.
5. **`Alert`**
   - Banner informasi statis (`state: 'info' | 'positive' | 'warning' | 'destructive'`).

#### C. Navigasi & Struktur Tampilan (*Layout & Navigation*)
1. **`Button`**
   - **PERHATIAN PENTING PROPS:** Menggunakan properti **`hierarchy`**, BUKAN `variant`!
   - *Allowed values:* `hierarchy: 'primary' | 'secondary' | 'tertiary' | 'link' | 'custom'`.
   - *Ukuran:* `size: '2xl' | 'xl' | 'lg' | 'md' | 'sm'`.
   - *Slot ikon:* `prefixIcon?: ReactNode`, `suffixIcon?: ReactNode`.
2. **`Badge`**
   - Indikator status penugasan (*Draft*, *Disetujui*, *Aktif*, *Selesai*, *Dibatalkan*).
   - *Props:* `text: string`, `variant: 'success' | 'danger' | 'warning' | 'info' | 'neutral'`, `type: 'solid' | 'soft' | 'outline'`.
3. **`Table`**
   - Komponen tabel terstruktur dengan integrasi kolom (`columns`) dan data (`data`).
4. **`Pagination`**
   - Navigasi halaman tabel (`currentPage: number`, `totalPages: number`, `onPageChange: (page: number) => void`).
5. **`Breadcrumb`**, **`TabHorizontal`**, **`Skeleton`**, **`Spinner`**, **`Card`**, **`Divider`**.

---

## 4. Evaluasi Arsitektur Monorepo & Single-Domain

### 4.1 Struktur Monorepo (Laravel + React Vite)
SIMATA menerapkan arsitektur *Single Monorepo*, di mana backend Laravel dan frontend React berada pada repositori yang sama.

```
simata-bps/
├── app/                  # Controller, Form Request, Service, Action, Model, Policy
├── bootstrap/            # Inisialisasi framework
├── config/               # Konfigurasi sistem
├── database/             # Migrasi, Seeder master data (Kecamatan 3516, Tim, dll.)
├── docs/                 # Dokumentasi spesifikasi arsitektur & bisnis
├── public/               # Web root (index.php, favicon, build/)
├── resources/
│   ├── css/              # app.css (Tailwind & custom rules)
│   ├── js/               # Aplikasi React SPA
│   │   ├── components/   # Wrapper domain SIMATA berbasis IDDS
│   │   ├── features/     # Feature modules (mitras, assignments, spks, reports)
│   │   ├── services/     # Axios client & API endpoints
│   │   └── app.jsx       # Entry point React
│   └── views/
│       └── app.blade.php # HTML Shell untuk SPA
├── routes/
│   ├── api.php           # Endpoint API JSON terproteksi
│   └── web.php           # SPA Fallback route
└── vite.config.js        # Konfigurasi Vite + Laravel Plugin
```

### 4.2 Evaluasi Pola Autentikasi SPA: Sanctum Session vs Bearer Token
Terdapat dua pendekatan autentikasi untuk Single Page Application:

1. **Opsi A: Bearer Token (Simpan di `localStorage` / `sessionStorage`)**
   - *Kelemahan Kritis:* Rentan terhadap serangan Cross-Site Scripting (XSS). Jika skrip berbahaya berhasil dieksekusi di browser, token API dapat dicuri secara instan.
   - *Kesesuaian:* Lebih cocok untuk mobile app native atau frontend lintas-domain (*decoupled*).

2. **Opsi B: Laravel Sanctum Stateful Session Authentication (REKOMENDASI FINAL)**
   - *Mekanisme:* Frontend dan Backend berada pada domain yang sama (misal `simata.bpsmojokerto.id`).
   - Autentikasi memanfaatkan cookie sesi Laravel (`laravel_session`) yang diproteksi dengan atribut `HttpOnly`, `SameSite=Lax`, dan `Secure` (HTTPS).
   - Dilengkapi proteksi otomatis terhadap Cross-Site Request Forgery (CSRF) via cookie `XSRF-TOKEN` yang dibaca secara otomatis oleh Axios.
   - Tidak ada token sensitif yang disimpan pada storage JavaScript browser.
   - **Kesimpulan:** Opsi B adalah arsitektur paling aman, standar industri Laravel untuk aplikasi internal pemerintah, dan paling efisien untuk deployment satu domain cPanel.

### 4.3 Pola Komunikasi & Routing Single-Domain
- Seluruh permintaan antarmuka (`/app/*`, `/login`, dll.) diarahkan ke sebuah Blade view tunggal (`resources/views/app.blade.php`) menggunakan fallback route di `routes/web.php`:
  ```php
  Route::get('/{any}', function () {
      return view('app');
  })->where('any', '^(?!api).*$');
  ```
- Seluruh pertukaran data bisnis dilayani melalui rute terproteksi di `routes/api.php` dengan awalan `/api/` (misal `/api/assignments`, `/api/mitras`).
- Axios dikonfigurasi dengan:
  ```javascript
  axios.defaults.baseURL = '/api';
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  ```
- Hal ini meniadakan perlunya konfigurasi CORS yang kompleks antar subdomain.

---

## 5. Validasi Rancangan Basis Data & Integritas Transaksi

### 5.1 Review Relasi & Integritas Referensial
Rancangan pada `DATABASE.md` dievaluasi terhadap kebutuhan operasional:

1. **Konsistensi Hubungan SPK dan Penugasan:**
   - Satu SPK dimiliki oleh satu mitra (`spks.mitra_id`).
   - Sebuah penugasan mencatat `task_assignments.spk_id` dan `task_assignments.mitra_id`.
   - **Temuan Teknis:** MySQL secara *default* mengizinkan `spk_id` milik Mitra A dipasangkan dengan baris `task_assignment` milik Mitra B jika foreign key hanya memeriksa `spk_id -> spks.id`.
   - **Solusi Arsitektural:** 
     1. Tambahkan constraint komposit unik pada tabel `spks`: `UNIQUE KEY uq_spks_id_mitra (id, mitra_id)`.
     2. Di tabel `task_assignments`, implementasikan foreign key komposit:
        ```sql
        FOREIGN KEY (spk_id, mitra_id) REFERENCES spks(id, mitra_id) ON UPDATE CASCADE ON DELETE RESTRICT
        ```
     3. Lengkapi dengan validasi wajib pada `AssignmentService` dan `StoreAssignmentRequest`: memastikan `spk.mitra_id === request.mitra_id`.

2. **Snapshot Transaksi untuk Perlindungan Data Historis:**
   - Master tarif dan nama tugas pada tabel `tasks` dapat berubah sewaktu-waktu di masa depan sesuai DIPA BPS.
   - Tabel `task_assignments` telah dirancang dengan tepat untuk menyimpan snapshot:
     - `task_name_snapshot`
     - `team_name_snapshot`
     - `unit_snapshot`
     - `unit_price` (DECIMAL 15,2)
     - `total_value` (DECIMAL 15,2)
     - `budget_account_code_snapshot`
   - Hal ini memastikan bahwa perubahan master data di masa depan **tidak akan mengubah nilai kontrak masa lalu**.

3. **Tipe Data Moneter & Volume:**
   - `volume` menggunakan `DECIMAL(12,2)`.
   - `unit_price` dan `total_value` menggunakan `DECIMAL(15,2)`.
   - Menghindari penggunaan `FLOAT` atau `DOUBLE` untuk mencegah galat akumulasi pembulatan desimal biner.

### 5.2 Validasi Mekanisme Batas Bulanan (Business Rules)
Sesuai `BUSINESS-RULES.md`:
- **Batas Bulanan:** Maksimal 10 penugasan **ATAU** Total honor Rp4.000.000 per mitra per bulan.
- **Operator:** `OR` (Salah satu batas terlampaui = Transaksi Ditolak). Nilai tepat 10 tugas atau tepat Rp4.000.000 masih diterima.
- **Bulan Pembebanan:** Ditentukan secara eksklusif oleh `start_date` penugasan. Tidak ada sistem prorata.
- **Status yang Dihitung:** `approved`, `active`, `completed`.
- **Status yang Diabaikan:** `draft`, `pending_approval`, `cancelled`.

### 5.3 Penanganan Concurrency & Race Condition
Skenario bahaya (*Race Condition*): Dua operator dari tim berbeda (misal Tim Produksi dan Tim Sosial) secara simultan menugaskan pekerjaan kepada Mitra X pada bulan yang sama. Jika kedua request dieksekusi bersamaan tanpa locking, validasi dapat membaca kuota yang sama dan meloloskan kedua penugasan, sehingga total melampaui Rp4.000.000.

**Pola Eksekusi Concurrency yang Ditetapkan:**
```php
DB::transaction(function () use ($mitraId, $startDate, $newHonor, $assignmentData) {
    // 1. Kunci baris mitra secara eksklusif (Pessimistic Locking)
    $mitra = Mitra::where('id', $mitraId)->lockForUpdate()->firstOrFail();

    // 2. Tentukan rentang bulan pembebanan berdasarkan start_date
    $startOfMonth = Carbon::parse($startDate)->startOfMonth()->toDateString();
    $endOfMonth = Carbon::parse($startDate)->endOfMonth()->toDateString();

    // 3. Agregasi data penugasan aktif pada bulan target di dalam lock
    $currentSummary = TaskAssignment::where('mitra_id', $mitraId)
        ->whereBetween('start_date', [$startOfMonth, $endOfMonth])
        ->whereIn('status', ['approved', 'active', 'completed'])
        ->selectRaw('COUNT(*) as total_count, COALESCE(SUM(total_value), 0) as total_honor')
        ->first();

    $projectedCount = $currentSummary->total_count + 1;
    $projectedHonor = $currentSummary->total_honor + $newHonor;

    // 4. Evaluasi Batas OR
    if ($projectedCount > 10) {
        throw new BusinessRuleException(
            "Batas jumlah penugasan tercapai. Mitra sudah memiliki {$currentSummary->total_count} penugasan pada periode ini.",
            'ASSIGNMENT_LIMIT_COUNT_EXCEEDED'
        );
    }

    if ($projectedHonor > 4000000) {
        throw new BusinessRuleException(
            "Batas honor bulanan terlampaui. Total proyeksi menjadi Rp" . number_format($projectedHonor, 0, ',', '.') . " (Maksimal Rp4.000.000).",
            'ASSIGNMENT_LIMIT_HONOR_EXCEEDED'
        );
    }

    // 5. Simpan transaksi & snapshot
    return TaskAssignment::create($assignmentData);
});
```

### 5.4 Pencegahan Deadlock pada Bulk Assignment
Pada fitur penugasan massal (*Bulk Assignment*), satu pekerjaan diberikan kepada daftar `$mitraIds = [14, 3, 29]`.
- Jika Request A mengunci Mitra 14 lalu Mitra 3, sedangkan Request B secara bersamaan mengunci Mitra 3 lalu Mitra 14, sistem basis data akan mengalami **Deadlock**.
- **Solusi Wajib:** Urutkan seluruh ID mitra secara ascending sebelum melakukan transaksi dan penguncian baris:
  ```php
  $sortedMitraIds = collect($mitraIds)->sort()->values()->all();
  // Lakukan query lockForUpdate terurut
  Mitra::whereIn('id', $sortedMitraIds)->orderBy('id', 'asc')->lockForUpdate()->get();
  ```

---

## 6. Daftar Keputusan Teknis yang Memerlukan Konfirmasi Pemilik Proses

Meskipun sistem telah memiliki *sensible defaults* yang aman untuk MVP, keputusan-keputusan berikut perlu dikonfirmasi kepada pihak BPS Kabupaten Mojokerto:

1. **Definisi Operasional "Satu Tugas":**
   - *Default MVP:* Satu record pada tabel `task_assignments` dihitung sebagai satu tugas (walaupun durasinya hanya beberapa hari atau satu bulan penuh).
2. **Aturan Satu SPK vs Banyak SPK per Periode:**
   - *Default MVP:* Satu mitra hanya memiliki satu SPK aktif per periode kontrak. Detail pekerjaan baru ditambahkan ke dalam SPK yang sedang aktif.
3. **Pemisahan Wewenang (Segregation of Duties) Approval:**
   - *Default MVP:* Operator Tim dapat membuat draft penugasan timnya; persetujuan (*approval*) dilakukan oleh Admin atau Super Admin.
4. **Format Penomoran Resmi SPK:**
   - Format kode penomoran standar BPS Mojokerto (misal: `B-xxx/3516x/KU.xxx/MM/YYYY`).
5. **Daftar Master 18 Kecamatan Resmi Kabupaten Mojokerto:**
   - Data kode referensi wilayah resmi BPS (3516010 s.d. 3516180) wajib diisi melalui seeder dari Master Wilayah BPS Jawa Timur / Kemendagri, bukan rekayasa manual.
6. **Mekanisme Override Kuota:**
   - *Default MVP:* **Tidak ada override batas.** Sistem menolak keras setiap transaksi yang melampaui batas tanpa pengecualian.

---

## 7. Kesimpulan & Rekomendasi Phase 0

1. **Environment:** Lingkungan pengembang lokal (PHP 8.5, Composer 2.10, Node 24, MySQL 8.0) siap digunakan, dengan target kompatibilitas runtime PHP 8.2/8.3 untuk cPanel.
2. **Pustaka Antarmuka:** `@idds/react` (1.6.66) dan `@idds/styles` (1.6.38) sepenuhnya valid, memiliki koleksi komponen formulir, tabel, dialog, dan navigasi yang lengkap, serta siap dipadukan dengan Tailwind CSS melalui isolasi kelas BEM dan injeksi token.
3. **Arsitektur:** Arsitektur Monorepo Single-Domain berbasis Laravel + React Vite dengan autentikasi session cookie Sanctum merupakan pilihan paling aman dan kompatibel dengan deployment cPanel.
4. **Database & Konkurensi:** Desain skema relasional, snapshot data, serta mekanisme *pessimistic row locking* menjamin aturan bisnis batas 10 tugas / Rp4 juta tidak akan bocor akibat *race condition*.

**Status Phase 0:** SELESAI. Siap melangkah ke Phase 1 (Foundation & Setup Repository).
