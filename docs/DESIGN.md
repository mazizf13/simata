# Design & UI/UX Specification --- SIMATA

## 1. Arah desain

SIMATA adalah sistem administrasi internal. Antarmuka harus terasa
seperti aplikasi pengelolaan data institusional yang matang, bukan
template dashboard SaaS generik.

**Arah visual:** formal, bersih, fungsional, tenang, dan padat informasi
secara terukur.

Referensi komponen: - INA Digital Design System:
https://design.inadigital.go.id/ - React package: `@idds/react`

## 2. Prinsip visual

-   Dominan putih dan neutral surface.
-   Warna utama mengikuti token resmi INA Digital yang tersedia.
-   Gunakan tipografi UI yang mudah dibaca dan sesuai design system.
-   Sidebar ringkas dan tidak mendominasi.
-   Tabel merupakan elemen utama.
-   Gunakan border dan pemisah halus, bukan shadow tebal.
-   Spacing konsisten.
-   Status memakai warna semantik secara hemat.
-   Hindari gradient dekoratif, glassmorphism, glow, dan animasi
    berlebihan.
-   Hindari card berlebihan dan angka statistik raksasa.
-   Jangan menggunakan font bergaya coding/monospace untuk UI umum.

## 3. INA Digital Design System

-   Instal `@idds/react`.
-   Impor `@idds/react/index.css` pada entry point sebelum stylesheet
    komponen/aplikasi.
-   Ikuti dokumentasi resmi untuk nama komponen, props, token, dan pola
    penggunaan.
-   Jangan menebak API komponen.
-   Periksa versi dan peer dependencies sebelum memilih versi
    React/Tailwind.
-   Gunakan komponen IDDS terlebih dahulu untuk button, input, select,
    dialog, badge, tabs, dan komponen lain yang tersedia.
-   Buat wrapper reusable hanya untuk kebutuhan domain SIMATA.
-   Jangan menimpa CSS internal IDDS secara global tanpa alasan dan
    pengujian.

Instalasi awal sesuai panduan:

``` bash
npm install @idds/react
npm install @tabler/icons-react tailwindcss @tailwindcss/vite
```

Entry point:

``` jsx
import '@idds/react/index.css';
```

Pastikan import CSS tersebut dilakukan sebelum stylesheet aplikasi
lainnya.

## 4. Layout aplikasi

### Desktop

-   Sidebar kiri untuk navigasi utama.
-   Topbar untuk judul halaman, breadcrumb, periode aktif, dan profil
    pengguna.
-   Area konten dengan lebar yang nyaman untuk tabel.
-   Filter diletakkan dekat dengan tabel.
-   Aksi utama berada pada posisi konsisten di kanan atas area konten.

### Mobile/tablet

-   Sidebar berubah menjadi navigation drawer.
-   Tabel menggunakan overflow horizontal atau mode list yang tetap
    mempertahankan informasi penting.
-   Form disusun satu kolom.
-   Aksi penting tetap mudah dijangkau.

## 5. Navigasi

Menu: 1. Dashboard 2. Penugasan 3. Data Mitra 4. Master Tugas 5. Master
Tim 6. SPK 7. Rekapitulasi 8. Laporan & Export

Pengaturan: - Pengguna & Hak Akses - Master Kecamatan - Akun Anggaran -
Pengaturan Sistem - Audit Log

Menu yang tampil mengikuti role, tetapi otorisasi tetap dilakukan
backend.

## 6. Pola halaman

### Dashboard

-   Ringkasan angka secukupnya.
-   Tabel mitra yang mendekati batas.
-   Distribusi tim yang informatif.
-   Aktivitas terakhir.
-   Filter periode jelas.

### Master data

-   Page title dan deskripsi singkat.
-   Toolbar pencarian/filter.
-   Primary action tambah data.
-   Data table dengan pagination.
-   Row action yang tidak berlebihan.
-   Empty state dan error state yang jelas.

### Detail mitra

Tab: - Ringkasan - Riwayat Penugasan - Rekap Honor - SPK

Tampilkan progress batas tugas/honor sebagai informasi, bukan dekorasi.

### Form penugasan

Urutan: 1. Periode dan tim. 2. Kegiatan. 3. Mitra (single/multiple). 4.
Detail pekerjaan. 5. SPK. 6. Preview nilai dan validasi batas. 7.
Konfirmasi.

Untuk bulk assignment, tampilkan hasil validasi per mitra sebelum
submit.

### Rekapitulasi

-   Default tampilan: tabel per mitra.
-   Pilihan tampilan: kalender dan, bila dibutuhkan, kanban status
    administrasi.
-   Filter periode, tim, kecamatan, status.
-   Total dan batas harus dapat ditelusuri ke detail transaksi.

## 7. Komponen reusable

-   `AppShell`
-   `AppSidebar`
-   `AppHeader`
-   `PageHeader`
-   `Breadcrumbs`
-   `DataTable`
-   `TableToolbar`
-   `FilterBar`
-   `SearchInput`
-   `StatusBadge`
-   `ConfirmDialog`
-   `FormSection`
-   `MoneyInput`
-   `DateRangeInput`
-   `MitraSelect`
-   `TaskSelect`
-   `TeamSelect`
-   `BudgetAccountSelect`
-   `AssignmentLimitIndicator`
-   `EmptyState`
-   `ErrorState`
-   `LoadingState`
-   `Pagination`

Komponen domain harus memiliki API yang jelas dan tidak mengandung
business logic backend.

## 8. Tabel

-   Gunakan pagination server-side.
-   Header kolom singkat dan jelas.
-   Angka rupiah rata kanan.
-   Tanggal menggunakan format Indonesia.
-   Nama mitra dan kegiatan rata kiri.
-   Kolom penting tidak boleh hilang pada resolusi desktop umum.
-   Hindari terlalu banyak kolom; detail tambahan dapat berada pada
    halaman detail atau expandable row.
-   Sorting/filtering harus bekerja pada server untuk data besar.

## 9. Bahasa dan format

-   Bahasa UI: Indonesia.
-   Tanggal: `dd MMMM yyyy` atau format ringkas `dd/MM/yyyy`.
-   Mata uang: `Rp1.291.000`.
-   Zona waktu tampilan: Asia/Jakarta.
-   Istilah konsisten: Mitra, Tim, Kegiatan, Penugasan, SPK, Nilai
    Perjanjian, Akun Anggaran.

## 10. Accessibility dan feedback

-   Label input selalu terlihat.
-   Fokus keyboard jelas.
-   Kontras teks memadai.
-   Error ditampilkan dekat field terkait.
-   Konfirmasi diperlukan untuk pembatalan dan tindakan destruktif.
-   Loading, empty, success, dan error state harus dirancang.
-   Jangan hanya mengandalkan warna untuk menunjukkan status.

## 11. Hal yang dilarang

-   Template admin SaaS generik tanpa penyesuaian.
-   Hero section atau marketing layout.
-   Gradient/glassmorphism dekoratif.
-   Semua konten dibungkus card.
-   Statistik besar tanpa konteks.
-   Placeholder lorem ipsum pada UI final.
-   Ikon tanpa makna.
-   Modal untuk setiap interaksi sederhana.
-   Meniru screenshot referensi secara mentah tanpa memahami kebutuhan.
