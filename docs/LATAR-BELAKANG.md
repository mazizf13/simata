Oke. Berdasarkan tiga keputusan tersebut, kita bisa mulai mengunci rancangan sistem dan menyusun PRD yang siap dijadikan acuan development di Antigravity.

Ada satu konsekuensi penting dari keputusanmu: batas 10 tugas dan Rp4 juta merupakan dua batas alternatif (OR), bukan dua batas yang harus dilanggar sekaligus.

Artinya, jika salah satu batas sudah tercapai, sistem menolak penugasan tambahan.

Contoh:

- Mitra memiliki 9 tugas dan honor Rp3 juta → masih boleh menerima satu tugas jika honor akhirnya tidak melebihi Rp4 juta.
- Mitra memiliki 8 tugas dan honor Rp3,9 juta → penugasan dengan honor Rp200 ribu ditolak.
- Mitra memiliki 10 tugas dan honor Rp2 juta → penugasan berikutnya ditolak.
- Mitra memiliki 5 tugas dan honor Rp4,1 juta → kondisi ini seharusnya tidak bisa terjadi melalui transaksi normal karena validasi honor.

Untuk penghitungan honor lintas bulan, seluruh nilai penugasan dibebankan ke bulan berdasarkan tanggal mulai penugasan. Sedangkan struktur SPK adalah satu SPK per mitra, yang dapat memuat beberapa detail pekerjaan.

# PRD — Sistem Manajemen Mitra & Honor BPS

Rancangan produk v1.0

# SIMATA

Sistem Manajemen Penugasan dan Honor Mitra

BPS Kabupaten Mojokerto · Kode Wilayah 3516

| Atribut        | Keputusan                      |
| -------------- | ------------------------------ |
| Jenis aplikasi | Internal administrative system |
| Backend        | Laravel                        |
| Frontend       | React + Vite                   |
| UI System      | INA Digital Design System      |
| Database       | MySQL                          |
| Deployment     | cPanel                         |
| Bahasa         | Indonesia                      |
| Pengguna       | Admin, operator tim, pimpinan  |
| Target         | Web desktop dan responsif      |

## 1. Latar belakang

Sistem pengelolaan penugasan mitra saat ini menggunakan spreadsheet dengan struktur horizontal. Setiap mitra memiliki kolom Uraian Tugas 1 sampai Uraian Tugas 7 beserta detail waktu, volume, harga satuan, nilai perjanjian, dan akun anggaran.

Struktur tersebut menyebabkan beberapa permasalahan:

1. Data penugasan sulit dibaca karena terlalu banyak kolom.
2. Riwayat penugasan setiap mitra tidak tersusun secara terpusat.
3. Perhitungan total honor bulanan masih membutuhkan rekap manual.
4. Pengawasan batas penugasan dan honor belum otomatis.
5. Pengelolaan SPK dan rekapitulasi belum terintegrasi.
6. Penambahan jenis pekerjaan baru membuat spreadsheet semakin kompleks.

## 2. Tujuan produk

Membangun aplikasi internal yang mampu:

- Mengelola master mitra secara terpusat.
- Mengelola tim dan katalog kegiatan survei.
- Membuat penugasan satu atau banyak mitra.
- Mengelola SPK berdasarkan masing-masing mitra.
- Memvalidasi batas penugasan dan honor otomatis.
- Menyediakan monitoring berdasarkan bulan, tim, dan mitra.
- Menghasilkan dokumen dan rekap Excel sesuai kebutuhan administrasi.

## 3. Pengguna dan hak akses

| Role         | Hak akses                             |
| ------------ | ------------------------------------- |
| Super Admin  | Seluruh modul dan konfigurasi         |
| Admin        | Master data, penugasan, SPK, laporan  |
| Operator Tim | Mengelola penugasan timnya            |
| Pimpinan     | Melihat dashboard, rekap, dan laporan |

Prinsipnya, operator tim hanya boleh mengakses data sesuai tim yang menjadi tanggung jawabnya, sedangkan pimpinan memiliki akses baca lintas tim.

## 4. Ruang lingkup fitur

PRIORITAS VERSI PERTAMA

| Modul            | Fitur                                         |
| ---------------- | --------------------------------------------- |
| Dashboard        | Statistik, ringkasan honor, aktivitas         |
| Master Mitra     | CRUD, pencarian, kecamatan, status            |
| Master Kecamatan | 18 kecamatan Kabupaten Mojokerto              |
| Master Tim       | Produksi, Sosial, Pertanian, Distribusi, IPDS |
| Master Tugas     | Kegiatan, satuan, tarif, tim                  |
| Master Akun      | Kode dan nama akun anggaran                   |
| Penugasan        | Single dan bulk assignment                    |
| SPK              | Satu SPK per mitra                            |
| Monitoring       | Kalender dan tabel rekap                      |
| Validasi         | Maksimal 10 tugas atau Rp4 juta               |
| Laporan          | Rekap per mitra, tim, bulan                   |
| Import/Export    | Excel dan dokumen SPK                         |
| Audit Log        | Histori perubahan data                        |

Fitur yang belum perlu masuk versi pertama: payment gateway, sistem pembayaran honor, aplikasi mobile native, dan integrasi API eksternal yang belum tersedia.

## 5. Business rules dan ketentuan sistem

Bagian ini harus dianggap sebagai aturan bisnis utama yang tidak boleh hanya diimplementasikan di frontend.

### 5.1 Batas honor dan jumlah tugas

Konfigurasi awal:

```
MAX_TASKS_PER_MONTH = 10
MAX_HONOR_PER_MONTH = 4000000
LIMIT_OPERATOR = OR
```

Formula validasi:

\\[ \text{Tolak jika } (N+1)>10 \lor (H+H_b)>4.000.000 \\]

Keterangan:

- \\(N\\): jumlah penugasan yang sudah diperhitungkan pada bulan tersebut.
- \\(H\\): total honor yang sudah diperhitungkan.
- \\(H_b\\): nilai penugasan baru.

| Kondisi                          | Hasil                  |
| -------------------------------- | ---------------------- |
| 9 tugas, Rp3 juta + Rp500 ribu   | Ditolak (honor)        |
| 9 tugas, Rp3 juta + Rp200 ribu   | Diterima               |
| 10 tugas, Rp2 juta + Rp100 ribu  | Ditolak (jumlah tugas) |
| 5 tugas, Rp3,5 juta + Rp500 ribu | Diterima               |
| 5 tugas, Rp3,5 juta + Rp600 ribu | Ditolak (honor)        |

Perlu ada mekanisme pengecualian yang hanya bisa dilakukan oleh role berwenang, jika nantinya memang diizinkan oleh kebijakan administrasi.

### 5.2 Penghitungan honor lintas bulan

Tanggal mulai menjadi penentu periode pembebanan.

Contoh:

| Atribut          | Nilai             |
| ---------------- | ----------------- |
| Mitra            | Agus Alim         |
| Tanggal mulai    | 24 September 2026 |
| Tanggal selesai  | 10 Oktober 2026   |
| Nilai perjanjian | Rp1.000.000       |
| Periode rekap    | September 2026    |
| Honor September  | Rp1.000.000       |
| Honor Oktober    | Rp0               |

Seluruh Rp1 juta dihitung pada September. Tidak dilakukan prorata.

### 5.3 Aturan SPK

Struktur yang disarankan:

```
SPK
 ├── Nomor SPK
 ├── Mitra
 ├── Pekerjaan
 ├── Jabatan
 ├── Alamat
 ├── Tanggal SPK
 └── Detail Penugasan
      ├── Kegiatan 1
      ├── Kegiatan 2
      ├── Kegiatan 3
      └── dst.
```

Contohnya Agus Alim memiliki satu SPK dengan lima detail pekerjaan.

Setiap detail memiliki:

- Uraian tugas.
- Tanggal mulai dan selesai.
- Volume pekerjaan.
- Satuan.
- Harga satuan.
- Nilai perjanjian.
- Beban anggaran.

Total SPK merupakan penjumlahan seluruh nilai detail pekerjaan.

Catatan rancangan: aku merekomendasikan satu SPK per mitra per periode kontrak, bukan satu SPK permanen seumur hidup mitra. Jika ada kontrak baru atau periode baru, sistem bisa menerbitkan SPK baru. Jika detail SPK yang sudah ditandatangani berubah, gunakan mekanisme revisi atau addendum, bukan mengubah dokumen historis secara diam-diam.

### 5.4 Status penugasan

| Status               | Keterangan                       |
| -------------------- | -------------------------------- |
| Draft                | Belum diperhitungkan dalam batas |
| Menunggu persetujuan | Menunggu persetujuan admin       |
| Disetujui            | Sudah diperhitungkan dalam batas |
| Aktif                | Sedang berlangsung               |
| Selesai              | Sudah dilaksanakan               |
| Dibatalkan           | Tidak lagi diperhitungkan        |

Penugasan yang sudah disetujui, aktif, dan selesai tetap diperhitungkan dalam rekap bulan mulai penugasan. Penugasan draft dan batal tidak diperhitungkan.

Perubahan status dan pembatalan harus tercatat dalam audit log.

# 6. Rancangan halaman aplikasi

Aku menyarankan struktur navigasi berikut.

SIMATA

BPS Kabupaten Mojokerto

Internal

MENU UTAMA

Dashboard

Penugasan & Kalender

Data Mitra

Master Tugas

Master Tim

SPK & Kontrak

Rekapitulasi

Laporan & Export

PENGATURAN

Pengaturan Sistem

Audit Log

Ilustrasi struktur navigasi, bukan tampilan final.

### 6.1 Dashboard

Komponen yang ditampilkan:

- Total mitra aktif.
- Jumlah penugasan bulan berjalan.
- Total nilai honor bulan berjalan.
- Mitra yang mendekati batas honor.
- Mitra yang mencapai batas tugas.
- Distribusi penugasan per tim.
- Aktivitas terbaru.

Dashboard jangan dipenuhi kartu statistik. Prioritaskan tabel monitoring dan informasi yang memerlukan tindakan.

### 6.2 Halaman data mitra

Fitur:

- Tabel mitra dengan pagination.
- Pencarian berdasarkan nama dan ID.
- Filter kecamatan dan status.
- Import Excel.
- Tambah, edit, dan nonaktifkan mitra.
- Detail mitra.

Kolom tabel:

| ID      | Nama              | Kecamatan | Total Tugas | Honor Bulan Ini |
| ------- | ----------------- | --------- | ----------- | --------------- |
| MTR-001 | Agus Alim         | Mojosari  | 5           | Rp1.291.000     |
| MTR-002 | Naning Sriwahyuni | Jatirejo  | 8           | Rp3.700.000     |

Klik satu baris akan membuka detail mitra.

### 6.3 Halaman penugasan

Ini menjadi pusat aktivitas operasional.

Tampilan utama:

- Tabel penugasan.
- Kalender.
- Filter tim.
- Filter periode.
- Filter status.
- Tombol tambah penugasan.
- Tombol penugasan massal.

Saat membuat penugasan, formulir harus mengikuti urutan yang logis:

1. Pilih periode.
2. Pilih tim.
3. Pilih kegiatan.
4. Pilih mitra.
5. Masukkan detail pekerjaan.
6. Pilih SPK.
7. Lihat simulasi validasi honor.
8. Simpan.

Jangan membuat satu formulir yang menampilkan puluhan input sekaligus. Gunakan bagian yang terstruktur, dengan ringkasan nilai yang selalu terlihat.

### 6.4 Detail mitra

Ini merupakan halaman yang menurutku paling penting dari perspektif pengguna.

Agus Alim

MTR-002 · Mojosari

Aktif

RingkasanPenugasanSPK

Jumlah tugas

# 5 / 10

Total honor

# Rp1,29 jt

Penugasan September 2026

| Kegiatan    | Honor     |
| ----------- | --------- |
| KSA Jagung  | Rp840.000 |
| Survei LPTB | Rp57.000  |
| Survei HD   | Rp106.000 |
| Survei HP   | Rp144.000 |
| Survei HPJ  | Rp144.000 |

Total\
Rp1.291.000

Data ilustrasi berdasarkan contoh Excel.

# 7. Database schema yang lebih detail

Aku merekomendasikan skema berikut untuk implementasi MySQL.

| Tabel              | Kolom penting                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `users`            | id, name, email, password                                                                                             |
| `roles`            | id, name                                                                                                              |
| `teams`            | id, name, code, is_active                                                                                             |
| `team_user`        | user_id, team_id                                                                                                      |
| `districts`        | id, code, name                                                                                                        |
| `mitras`           | id, mitra_code, name, address, district_id, phone, status                                                             |
| `tasks`            | id, team_id, task_code, name, unit, default_rate, is_active                                                           |
| `budget_accounts`  | id, code, name, is_active                                                                                             |
| `spks`             | id, mitra_id, spk_number, contract_date, position, occupation, status                                                 |
| `task_assignments` | id, spk_id, mitra_id, task_id, budget_account_id, start_date, end_date, volume, unit, unit_price, total_value, status |
| `system_settings`  | key, value                                                                                                            |
| `audit_logs`       | user_id, action, entity_type, entity_id, old_values, new_values                                                       |

Ada beberapa keputusan desain database yang penting:

Pertama, simpan snapshot data transaksi.

Nama kegiatan, harga satuan, satuan, dan akun anggaran pada penugasan harus disimpan sebagai data historis atau snapshot. Jangan sampai mengubah tarif master kegiatan otomatis mengubah nilai SPK yang sudah diterbitkan.

Kedua, gunakan decimal untuk nilai uang.

Jangan menggunakan floating point untuk perhitungan rupiah.

Contoh:

```
unit_price DECIMAL(15,2)
total_value DECIMAL(15,2)
volume DECIMAL(12,2)
```

Ketiga, jangan menyimpan total honor bulanan sebagai angka yang diinput manual.

Total harus dihitung berdasarkan penugasan yang memenuhi kriteria periode dan status. Jika diperlukan caching untuk performa, hasilnya tetap harus dapat direkonsiliasi dengan detail transaksi.

Keempat, identitas mitra harus unik.

Gunakan `mitra_code` sebagai identitas internal permanen, bukan nama, karena nama bisa sama atau berubah.

Kelima, gunakan soft delete dan audit trail.

Data yang sudah memiliki histori penugasan tidak boleh dihapus permanen melalui antarmuka administrasi.

## 8. Backend architecture Laravel

Aku menyarankan Laravel menggunakan pola Controller → Form Request → Service → Model.

Hindari menaruh seluruh business logic di Controller.

Contoh struktur:

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── DashboardController.php
│   │       ├── MitraController.php
│   │       ├── TeamController.php
│   │       ├── TaskController.php
│   │       ├── AssignmentController.php
│   │       ├── SpkController.php
│   │       └── ReportController.php
│   └── Requests/
│       ├── StoreMitraRequest.php
│       ├── StoreAssignmentRequest.php
│       └── StoreSpkRequest.php
│
├── Models/
│   ├── Mitra.php
│   ├── District.php
│   ├── Team.php
│   ├── Task.php
│   ├── TaskAssignment.php
│   ├── Spk.php
│   └── BudgetAccount.php
│
├── Services/
│   ├── AssignmentService.php
│   ├── AssignmentLimitService.php
│   ├── SpkService.php
│   ├── HonorCalculationService.php
│   └── ReportService.php
│
└── Policies/
    ├── MitraPolicy.php
    ├── AssignmentPolicy.php
    └── SpkPolicy.php
```

### 8.1 Service yang wajib dipisahkan

| Service                   | Tanggung jawab                           |
| ------------------------- | ---------------------------------------- |
| `AssignmentService`       | Membuat, mengubah, membatalkan penugasan |
| `AssignmentLimitService`  | Memvalidasi kuota dan honor              |
| `HonorCalculationService` | Menghitung honor per periode             |
| `SpkService`              | Mengelola SPK dan detailnya              |
| `ReportService`           | Menghasilkan data rekap                  |

Contoh alur validasi:

```
DB::transaction(function () use ($data) {
    $mitra = Mitra::query()
        ->lockForUpdate()
        ->findOrFail($data['mitra_id']);

    $this->assignmentLimitService
        ->validate($mitra, $data);

    $this->assignmentService
        ->create($mitra, $data);
});
```

Kode ini ilustrasi pola implementasi. Implementasi final perlu memastikan locking mencakup semua transaksi mitra pada periode yang sama.

### 8.2 API endpoint

| Method | Endpoint                       | Fungsi              |
| ------ | ------------------------------ | ------------------- |
| GET    | `/api/dashboard`               | Statistik dashboard |
| GET    | `/api/mitras`                  | Daftar mitra        |
| POST   | `/api/mitras`                  | Tambah mitra        |
| GET    | `/api/mitras/{id}`             | Detail mitra        |
| PUT    | `/api/mitras/{id}`             | Update mitra        |
| GET    | `/api/teams`                   | Daftar tim          |
| GET    | `/api/tasks`                   | Daftar kegiatan     |
| POST   | `/api/tasks`                   | Tambah kegiatan     |
| GET    | `/api/assignments`             | Daftar penugasan    |
| POST   | `/api/assignments`             | Tambah penugasan    |
| POST   | `/api/assignments/bulk`        | Penugasan massal    |
| PUT    | `/api/assignments/{id}`        | Update penugasan    |
| POST   | `/api/assignments/{id}/cancel` | Pembatalan          |
| GET    | `/api/mitras/{id}/summary`     | Rekap mitra         |
| GET    | `/api/spks`                    | Daftar SPK          |
| POST   | `/api/spks`                    | Membuat SPK         |
| GET    | `/api/reports/monthly`         | Rekap bulanan       |
| GET    | `/api/reports/team`            | Rekap per tim       |
| GET    | `/api/reports/export`          | Export data         |

Gunakan API Resource untuk konsistensi response JSON, pagination, dan validasi input.

# 9. Frontend architecture React

Frontend menggunakan React + Vite dengan komponen INA Digital.

Aku menyarankan pembagian berdasarkan domain fitur, bukan berdasarkan jenis file semata.

```
resources/js/
├── app/
│   ├── App.jsx
│   ├── router.jsx
│   └── providers.jsx
│
├── components/
│   ├── ui/
│   ├── data-table/
│   ├── form/
│   ├── feedback/
│   └── layout/
│
├── features/
│   ├── dashboard/
│   ├── mitras/
│   ├── teams/
│   ├── tasks/
│   ├── assignments/
│   ├── spks/
│   └── reports/
│
├── hooks/
├── services/
├── utils/
├── styles/
└── main.jsx
```

### Library pendukung

| Library                 | Penggunaan               |
| ----------------------- | ------------------------ |
| `@idds/react`           | Komponen INA Digital     |
| `@tabler/icons-react`   | Ikon                     |
| `tailwindcss`           | Styling                  |
| `react-router-dom`      | Routing                  |
| `@tanstack/react-query` | Server state             |
| `react-hook-form`       | Form state               |
| `zod`                   | Validasi schema frontend |
| `axios`                 | HTTP client              |
| `date-fns`              | Pengolahan tanggal       |

Jangan membuat ulang komponen yang sudah disediakan INA Digital. Namun, untuk kebutuhan khusus seperti tabel penugasan yang kompleks, buat reusable wrapper yang tetap mengikuti visual system INA Digital.

### Prinsip UI yang harus dijaga

1. Tidak menggunakan pola dashboard SaaS generik.
2. Tidak menggunakan gradient sebagai dekorasi.
3. Tidak menggunakan glassmorphism.
4. Tidak menggunakan terlalu banyak kartu statistik.
5. Tidak menggunakan ikon dekoratif yang tidak memiliki fungsi.
6. Tidak menggunakan heading berukuran terlalu besar.
7. Tidak menggunakan animasi berlebihan.
8. Mengutamakan tabel, filter, formulir, dan hierarki informasi.
9. Konsisten menggunakan komponen INA Digital.
10. Setiap halaman harus dirancang berdasarkan aktivitas administrasi yang sebenarnya.

# 10. Import dan export Excel

Ini merupakan fitur yang sangat penting karena data awal sudah tersedia dalam spreadsheet.

### Import

Sistem perlu mendukung format Excel saat ini.

Alur import:

\#chatgpt-mermaid-\_r_1jn\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_1jn\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1jn\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1jn\_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-\_r_1jn\_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1jn\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_1jn\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_1jn\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_1jn\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_1jn\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_1jn\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_1jn\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1jn\_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1jn\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_1jn\_ p{margin:0;}#chatgpt-mermaid-\_r_1jn\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1jn\_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1jn\_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1jn\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_1jn\_ .label text,#chatgpt-mermaid-\_r_1jn\_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1jn\_ .node rect,#chatgpt-mermaid-\_r_1jn\_ .node circle,#chatgpt-mermaid-\_r_1jn\_ .node ellipse,#chatgpt-mermaid-\_r_1jn\_ .node polygon,#chatgpt-mermaid-\_r_1jn\_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-\_r_1jn\_ .rough-node .label text,#chatgpt-mermaid-\_r_1jn\_ .node .label text,#chatgpt-mermaid-\_r_1jn\_ .image-shape .label,#chatgpt-mermaid-\_r_1jn\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_1jn\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_1jn\_ .rough-node .label,#chatgpt-mermaid-\_r_1jn\_ .node .label,#chatgpt-mermaid-\_r_1jn\_ .image-shape .label,#chatgpt-mermaid-\_r_1jn\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_1jn\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_1jn\_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1jn\_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1jn\_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-\_r_1jn\_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-\_r_1jn\_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_1jn\_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_1jn\_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_1jn\_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-\_r_1jn\_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-\_r_1jn\_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1jn\_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1jn\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_1jn\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1jn\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_1jn\_ .icon-shape,#chatgpt-mermaid-\_r_1jn\_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_1jn\_ .icon-shape p,#chatgpt-mermaid-\_r_1jn\_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-\_r_1jn\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_1jn\_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_1jn\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_1jn\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_1jn\_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-\_r_1jn\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_1jn\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_1jn\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_1jn\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1jn\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_1jn\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_1jn\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_1jn\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1jn\_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-\_r_1jn\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_1jn\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1jn\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_1jn\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_1jn\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1jn\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_1jn\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1jn\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(153, 206, 255);}#chatgpt-mermaid-\_r_1jn\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(153, 206, 255);}#chatgpt-mermaid-\_r_1jn\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_1jn\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_1jn\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-width:1px;}#chatgpt-mermaid-\_r_1jn\_ .node rect,#chatgpt-mermaid-\_r_1jn\_ .node circle,#chatgpt-mermaid-\_r_1jn\_ .node ellipse,#chatgpt-mermaid-\_r_1jn\_ .node polygon,#chatgpt-mermaid-\_r_1jn\_ .node path{fill:rgb(0, 40, 77);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_1jn\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_1jn\_ .mermaid-decision .label-container{fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_1jn\_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_1jn\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1jn\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Upload ExcelValidasi FormatMapping KolomPreview DataValidasiTampilkan Error per BarisKonfirmasi ImportImport Mitra dan SPKImport Detail PenugasanLaporan Hasil ImportAda KesalahanValid

Sistem harus mampu membaca struktur horizontal yang sekarang, termasuk Uraian Tugas 1 sampai Uraian Tugas 7, kemudian mengubahnya menjadi detail penugasan vertikal.

Contohnya:

Sebelum import:

| Nama      | Tugas 1    | Tugas 2 | Tugas 3 |
| --------- | ---------- | ------- | ------- |
| Agus Alim | KSA Jagung | LPTB    | HD      |

Sesudah import:

| Mitra     | Kegiatan   |
| --------- | ---------- |
| Agus Alim | KSA Jagung |
| Agus Alim | LPTB       |
| Agus Alim | HD         |

Perlu ada mekanisme pemeriksaan duplikasi berdasarkan nomor SPK, mitra, dan detail penugasan agar data tidak terimpor dua kali.

### Export

Minimal tersedia empat jenis export:

1. Rekap honor per mitra.
2. Rekap penugasan per tim.
3. Rekap seluruh SPK.
4. Format Excel yang menyerupai template administrasi lama.

Untuk SPK, sistem menghasilkan dokumen dengan struktur:

- Identitas mitra.
- Nomor SPK.
- Jabatan.
- Pekerjaan.
- Alamat.
- Tabel uraian tugas.
- Jangka waktu.
- Volume.
- Satuan.
- Harga satuan.
- Nilai perjanjian.
- Beban anggaran.
- Total.
- Terbilang.

Jadi, pengguna tetap mendapatkan output administrasi yang sudah dikenal, tetapi proses pengelolaan datanya jauh lebih baik.

# 11. Keamanan dan integritas data

Karena ini menyangkut dokumen penugasan dan honor, beberapa kontrol wajib diterapkan.

- Authentication menggunakan Laravel.
- Authorization berbasis role dan tim.
- CSRF protection dan validasi backend.
- Database transaction untuk proses penugasan.
- Audit log untuk perubahan data penting.
- Validasi file import.
- Pembatasan akses dokumen SPK.
- Backup database berkala.
- Soft delete untuk master data.
- Riwayat perubahan nilai penugasan.

Khusus data honor, perubahan harga satuan setelah penugasan dibuat tidak boleh mengubah nominal transaksi yang sudah disetujui.

## 12. Acceptance criteria

Fitur dianggap selesai apabila memenuhi kondisi berikut.

| Modul            | Kriteria penerimaan                                                  |
| ---------------- | -------------------------------------------------------------------- |
| Master Mitra     | Satu mitra hanya memiliki satu ID unik                               |
| Master Kecamatan | Mendukung 18 kecamatan                                               |
| Master Tim       | Kegiatan terhubung dengan tim                                        |
| Master Tugas     | Tarif dan satuan dapat dikonfigurasi                                 |
| Penugasan        | Satu mitra dapat memiliki banyak penugasan                           |
| Bulk Assignment  | Banyak mitra dapat ditugaskan sekaligus                              |
| Validasi         | Batas 10 atau Rp4 juta tidak dapat dilewati melalui transaksi normal |
| Periode          | Honor dihitung berdasarkan tanggal mulai                             |
| SPK              | Satu mitra dapat memiliki beberapa detail pekerjaan dalam satu SPK   |
| Rekap            | Total honor sesuai detail penugasan                                  |
| Import           | Format Excel lama dapat dikonversi                                   |
| Export           | Data dapat diekspor sesuai kebutuhan administrasi                    |
| Audit            | Perubahan data dapat ditelusuri                                      |

# 13. Roadmap pengembangan

Aku menyarankan urutan berikut agar development tidak melebar.

## Development roadmap

1. Phase 1 — Project Foundation

   Prioritas awal
   - Setup Laravel dan React Vite.
   - Setup INA Digital.
   - Routing dan layout.
   - Login dan role.
   - Struktur database.
2. Phase 2 — Master Data
   - Master mitra.
   - Master kecamatan.
   - Master tim.
   - Master kegiatan.
   - Master akun anggaran.
3. Phase 3 — Penugasan
   - Single assignment.
   - Bulk assignment.
   - Detail pekerjaan.
   - Penghitungan honor.
   - Validasi batas bulanan.
4. Phase 4 — SPK
   - Pembuatan SPK.
   - Detail SPK.
   - Perhitungan total.
   - Terbilang.
   - Cetak dokumen.
5. Phase 5 — Monitoring
   - Dashboard.
   - Kalender.
   - Rekap mitra.
   - Rekap tim.
   - Rekap bulanan.
6. Phase 6 — Import, Export & Deployment
   - Import Excel lama.
   - Export Excel.
   - Export SPK.
   - Audit log.
   - Testing dan deployment cPanel.

# 14. Hal yang perlu dikunci sebelum development

Ada beberapa detail yang belum sepenuhnya ditentukan. Aku akan menetapkan default rekomendasi agar proses development tidak terhambat.

| Topik                      | Rekomendasi                                          |
| -------------------------- | ---------------------------------------------------- |
| Periode pembatasan         | Kalender bulanan                                     |
| Dasar perhitungan          | Tanggal mulai penugasan                              |
| Penghitungan tugas         | Satu detail penugasan = satu tugas                   |
| Status yang dihitung       | Disetujui, aktif, selesai                            |
| Status yang tidak dihitung | Draft, dibatalkan                                    |
| Pembatalan                 | Harus memiliki alasan                                |
| SPK                        | Satu mitra per periode kontrak                       |
| Perubahan SPK              | Melalui revisi/addendum                              |
| Tarif kegiatan             | Default dari master, bisa disesuaikan saat penugasan |
| Nilai transaksi            | Snapshot, tidak berubah saat master diperbarui       |
| Pengecualian batas         | Tidak tersedia pada versi pertama                    |
| Export                     | Excel dan dokumen SPK                                |

Ada dua hal yang perlu mendapat perhatian khusus:

1\. Batas honor dan jumlah tugas

Jika ada penugasan yang sudah disetujui kemudian dibatalkan, sistem harus menghitung ulang kuota dan honor. Namun histori pembatalannya tetap disimpan.

2\. SPK dan periode kontrak

Perlu dipastikan apakah nomor SPK mengikuti format tertentu dari administrasi BPS, serta apakah satu mitra boleh memiliki SPK baru ketika SPK sebelumnya masih berjalan.

# 15. Rekomendasi akhir

Menurutku, ada tiga prinsip yang harus menjadi pegangan selama pengerjaan:

1. Database-first: Jangan merancang database berdasarkan bentuk Excel. Rancang berdasarkan relasi mitra, tugas, penugasan, dan SPK.
2. Business-rule-first: Validasi honor dan batas penugasan harus selesai dan diuji sebelum membangun dashboard.
3. Workflow-first: Setiap halaman harus membantu pekerjaan administrasi nyata, bukan sekadar terlihat modern.

Untuk identitas aplikasi, aku merekomendasikan nama sementara SIMATA — Sistem Manajemen Mitra. Nama ini masih bisa diubah kemudian.

## Langkah berikutnya

Aku menyarankan kita menyiapkan kumpulan dokumentasi `.md` sebelum masuk Antigravity.

## Dokumentasi project SIMATA

Struktur file yang disarankan

simata-bps/

README.md

Overview dan petunjuk project

MD

PRD.md

Product Requirements Document lengkap

MD

DESIGN.md

UI/UX, design system INA Digital, dan visual rules

MD

DATABASE.md

ERD, relasi, migration, dan constraints

MD

BUSINESS-RULES.md

Aturan honor, penugasan, SPK, dan validasi

MD

ARCHITECTURE.md

Arsitektur Laravel dan React

MD

API.md

Endpoint dan kontrak API

MD

ROUTES.md

Struktur halaman dan navigasi

MD

IMPORT-EXPORT.md

Mapping Excel lama dan format output

MD

SECURITY.md

Authentication, authorization, dan audit

MD

DEVELOPMENT-PLAN.md

Phase development dan acceptance criteria

MD

AGENTS.md

Aturan kerja Antigravity, coding conventions, dan reusable components

MD

Saran terakhir: jangan mulai dari dashboard. Mulai dari master data, struktur relasi, lalu engine validasi penugasan. Ketiganya merupakan fondasi yang menentukan apakah SIMATA benar-benar bisa menggantikan Excel lama.

Setelah dokumentasi dikunci, kita bisa membuat prompt Antigravity per phase dengan instruksi implementasi yang spesifik, reusable component, clean code, dan kepatuhan terhadap INA Digital Design System.