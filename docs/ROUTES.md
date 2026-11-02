# Information Architecture & Routes --- SIMATA

## 1. Peta navigasi

``` text
/
├── /login
└── /app
    ├── /dashboard
    ├── /assignments
    │   ├── /new
    │   ├── /bulk
    │   └── /:id
    ├── /mitras
    │   ├── /new
    │   └── /:id
    ├── /teams
    ├── /tasks
    │   ├── /new
    │   └── /:id/edit
    ├── /spks
    │   ├── /new
    │   └── /:id
    ├── /reports
    │   ├── /monthly
    │   └── /teams
    ├── /imports
    │   └── /assignments
    └── /settings
        ├── /users
        ├── /districts
        ├── /budget-accounts
        ├── /system
        └── /audit-logs
```

## 2. Detail halaman

  Route                             Halaman            Fungsi
  --------------------------------- ------------------ ---------------------------------
  `/login`                          Login              Autentikasi pengguna
  `/app/dashboard`                  Dashboard          Ringkasan dan perhatian
  `/app/assignments`                Penugasan          Tabel dan kalender penugasan
  `/app/assignments/new`            Tambah penugasan   Form satu mitra
  `/app/assignments/bulk`           Penugasan massal   Form banyak mitra
  `/app/assignments/:id`            Detail penugasan   Informasi, status, audit
  `/app/mitras`                     Data mitra         Daftar, filter, import
  `/app/mitras/new`                 Tambah mitra       Form mitra
  `/app/mitras/:id`                 Detail mitra       Ringkasan dan histori
  `/app/teams`                      Master tim         Kelola tim
  `/app/tasks`                      Master tugas       Katalog kegiatan
  `/app/tasks/new`                  Tambah tugas       Form kegiatan
  `/app/spks`                       Daftar SPK         Data SPK
  `/app/spks/new`                   Tambah SPK         Metadata SPK dan detail terkait
  `/app/spks/:id`                   Detail SPK         Mitra dan detail pekerjaan
  `/app/reports/monthly`            Rekap bulanan      Rekap honor/tugas
  `/app/reports/teams`              Rekap tim          Distribusi kegiatan
  `/app/imports/assignments`        Import             Upload, mapping, preview
  `/app/settings/users`             Pengguna           Manajemen akun
  `/app/settings/districts`         Kecamatan          Master wilayah
  `/app/settings/budget-accounts`   Akun anggaran      Master akun
  `/app/settings/system`            Pengaturan         Batas dan konfigurasi
  `/app/settings/audit-logs`        Audit log          Riwayat perubahan

## 3. Filter standar

Daftar penugasan: - Bulan/tahun. - Tim. - Kegiatan. - Kecamatan. -
Mitra. - Status. - Nomor SPK.

Daftar mitra: - Kata kunci nama/kode. - Kecamatan. - Status. - Tim
melalui histori penugasan (jika filter ini diperlukan).

Rekap: - Bulan/tahun wajib. - Tim opsional. - Kecamatan opsional. -
Status opsional.

## 4. Pola interaksi

-   Gunakan halaman detail untuk data kompleks.
-   Gunakan drawer/modal hanya untuk aksi singkat.
-   Gunakan dialog konfirmasi untuk pembatalan.
-   Pertahankan filter saat pengguna kembali dari detail ke daftar bila
    memungkinkan.
-   URL harus merepresentasikan filter penting agar dapat
    dibagikan/bookmark sesuai hak akses.
-   Tampilkan breadcrumb untuk halaman bertingkat.
