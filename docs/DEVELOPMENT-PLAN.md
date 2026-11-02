# Development Plan --- SIMATA

## 1. Strategi

Bangun fondasi data dan business rules terlebih dahulu. Jangan memulai
dari dashboard visual sebelum model transaksi dan validasi batas
terbukti benar.

## 2. Fase pengembangan

### Phase 0 --- Discovery & Technical Validation

-   Konfirmasi aturan bisnis yang masih terbuka.
-   Verifikasi versi PHP/Laravel yang didukung cPanel.
-   Uji instalasi `@idds/react` dan kompatibilitas React/Tailwind.
-   Tentukan autentikasi SPA.
-   Siapkan repository dan environment development.

**Output:** keputusan teknis, repository, build minimal berhasil.

### Phase 1 --- Foundation

-   Setup Laravel + React + Vite.
-   Setup MySQL dan migration awal.
-   Setup login dan role.
-   Setup AppShell, sidebar, header, routing.
-   Setup komponen IDDS.
-   Setup API response/error convention.

**Acceptance:** - Aplikasi dapat login/logout. - Route terlindungi. -
Build frontend berhasil. - Layout responsif dasar tersedia. - Tidak ada
credential di source.

### Phase 2 --- Master Data

-   Master kecamatan.
-   Master mitra.
-   Master tim.
-   Master tugas.
-   Master akun anggaran.
-   Search, filter, pagination.
-   Import master bila diperlukan.

**Acceptance:** - Mitra memiliki kode unik. - Mitra terhubung ke
kecamatan. - Tugas terhubung ke tim. - Tarif default dan akun default
tersimpan. - Data yang direferensikan tidak dapat dihapus permanen.

### Phase 3 --- Assignment Engine

-   Model dan migration penugasan.
-   Single assignment.
-   Bulk assignment.
-   Status workflow.
-   Honor calculation.
-   Limit validation.
-   Transaction dan locking.
-   Audit log.

**Acceptance:** - OR limit berjalan benar. - Tanggal mulai menentukan
bulan. - Transaksi lintas bulan tidak diprorata. - Status yang
dikecualikan tidak dihitung. - Pembatalan mengeluarkan transaksi dari
agregat tetapi mempertahankan histori. - Concurrent requests tidak dapat
melewati batas. - Test unit/feature mencakup edge cases.

### Phase 4 --- SPK Data Management

-   Metadata SPK.
-   Relasi SPK-mitra.
-   Relasi SPK-detail penugasan.
-   Validasi konsistensi mitra.
-   Histori perubahan.

**Acceptance:** - Satu SPK hanya dimiliki satu mitra. - Satu SPK dapat
memiliki beberapa detail. - Detail tidak dapat mengacu pada mitra yang
berbeda. - Nomor SPK unik. - Tidak ada generate DOCX/PDF pada fase ini.

### Phase 5 --- Monitoring & Reports

-   Dashboard.
-   Rekap per mitra.
-   Rekap per tim.
-   Kalender.
-   Filter periode.
-   Export rekap Excel.

**Acceptance:** - Total rekap cocok dengan detail transaksi. - Filter
bekerja server-side. - Tampilan utama berupa tabel. - Kalender
menampilkan rentang pekerjaan. - Pimpinan dapat melihat rekap lintas tim
sesuai izin.

### Phase 6 --- Import Legacy & Hardening

-   Parser workbook lama.
-   Deteksi kelompok tugas dinamis.
-   Mapping dan preview.
-   Validasi duplikasi.
-   Import batch.
-   Error report.
-   Security review.
-   Performance test.
-   Deployment cPanel dan backup/restore test.

**Acceptance:** - Kelompok Uraian Tugas 1--7 diubah menjadi record
terpisah. - Error import dapat ditelusuri. - Import ulang tidak membuat
duplikasi tanpa konfirmasi. - Production deployment aman. - Backup dan
restore diuji.

## 3. Testing minimum

### Limit tests

-   9 tugas + 1 tugas di bawah batas honor → lolos.
-   9 tugas + honor membuat total \> Rp4 juta → gagal.
-   10 tugas + tugas baru → gagal.
-   Total honor tepat Rp4 juta → lolos jika jumlah tugas masih di
    bawah/equal 10.
-   Total honor \> Rp4 juta → gagal.
-   Tugas draft tidak dihitung.
-   Tugas dibatalkan tidak dihitung.
-   Tugas selesai tetap dihitung.
-   Penugasan tanggal 31 Agustus dibebankan ke Agustus.
-   Penugasan mulai 31 Agustus dan selesai September tetap dibebankan ke
    Agustus.
-   Perubahan tanggal mulai memicu validasi ulang.

### SPK tests

-   SPK milik mitra A tidak dapat dipakai mitra B.
-   Satu SPK dapat memiliki banyak assignment untuk mitra yang sama.
-   Nomor SPK duplikat ditolak.

### Import tests

-   Workbook dengan 1 sampai 7 kelompok tugas.
-   Kelompok kosong dilewati.
-   Format tanggal dan rupiah.
-   Nama mitra ambigu.
-   Kegiatan tidak ditemukan.
-   Nomor SPK duplikat.
-   Nilai Excel berbeda dari hasil hitung.

## 4. Definition of Done

Fitur selesai jika: - Acceptance criteria terpenuhi. - Validasi backend
tersedia. - Otorisasi diperiksa. - Loading/empty/error/success state
tersedia. - Test relevan lulus. - Tidak ada duplikasi komponen/function
yang tidak perlu. - Dokumentasi endpoint dan perilaku diperbarui. -
Tidak ada data contoh hardcoded di production UI.

## 5. Urutan kerja yang disarankan

Jangan mengerjakan seluruh fase dalam satu prompt AI coding. Berikan
satu fase per prompt, review hasil, jalankan test, lalu lanjutkan fase
berikutnya.
