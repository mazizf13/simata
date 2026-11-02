# Product Requirements Document (PRD)

## SIMATA --- Sistem Manajemen Mitra BPS

**Versi:** 1.0\
**Status:** Draft untuk validasi\
**Pemilik proses:** BPS Kabupaten Mojokerto\
**Kode wilayah:** 3516

## 1. Ringkasan produk

SIMATA adalah aplikasi internal untuk mengelola master mitra, tim,
katalog kegiatan, penugasan, data SPK, dan rekap honor bulanan. Aplikasi
mengubah pola spreadsheet horizontal menjadi model data relasional: satu
mitra dapat memiliki banyak penugasan, dan setiap penugasan tersimpan
sebagai record tersendiri.

SIMATA bukan aplikasi pembayaran honor. Fokus versi awal adalah
pencatatan, pengendalian batas, monitoring, dan pelaporan administrasi.

## 2. Latar belakang dan masalah

Spreadsheet saat ini menyimpan beberapa uraian tugas dalam satu baris
mitra melalui kolom berulang seperti Uraian Tugas 1 sampai Uraian Tugas
7. Setiap kelompok kolom juga memiliki tanggal mulai/akhir, volume,
satuan, harga satuan, nilai perjanjian, dan beban anggaran.

Dampak: - Tampilan terlalu lebar dan sulit dibaca. - Riwayat satu mitra
tidak mudah ditelusuri. - Rekap honor per mitra dan per bulan
membutuhkan pengolahan manual. - Penambahan tugas baru bergantung pada
penambahan kolom. - Validasi batas tugas dan honor tidak
konsisten/otomatis. - Filter berdasarkan tim, kecamatan, periode, dan
status tidak praktis.

## 3. Tujuan dan indikator keberhasilan

### Tujuan

1.  Menyediakan satu profil terpusat untuk setiap mitra.
2.  Menyimpan setiap penugasan secara terpisah dan terstruktur.
3.  Mencegah penugasan yang melampaui salah satu batas bulanan.
4.  Menghasilkan rekap per mitra, tim, dan periode.
5.  Menyediakan pencatatan SPK per mitra yang memuat beberapa detail
    pekerjaan.
6.  Memindahkan data spreadsheet lama ke struktur baru dengan proses
    import yang tervalidasi.

### Indikator keberhasilan

-   Tidak ada kebutuhan menambah kolom ketika jenis tugas baru
    ditambahkan.
-   Rekap honor per mitra dapat ditampilkan berdasarkan bulan yang
    dipilih.
-   Semua transaksi yang dihitung dalam batas bulanan melewati validasi
    backend.
-   Pengguna dapat menelusuri riwayat penugasan dari halaman detail
    mitra.
-   Hasil import dapat ditinjau dan kesalahan baris dapat
    diidentifikasi.
-   Perubahan penting dapat ditelusuri melalui audit log.

## 4. Pengguna dan peran

  -----------------------------------------------------------------------
  Peran                               Kebutuhan
  ----------------------------------- -----------------------------------
  Super Admin                         Mengatur seluruh sistem, pengguna,
                                      role, master, dan konfigurasi

  Admin                               Mengelola master data, penugasan,
                                      SPK, dan laporan

  Operator Tim                        Mengelola data operasional sesuai
                                      tim yang ditugaskan

  Pimpinan                            Melihat dashboard, rekap, dan
                                      laporan lintas tim
  -----------------------------------------------------------------------

Akses final harus mengikuti kebijakan internal. Role dan izin tidak
boleh hanya dikendalikan dengan menyembunyikan menu di frontend; backend
wajib memeriksa otorisasi.

## 5. Ruang lingkup MVP

### Termasuk

-   Login dan manajemen pengguna.
-   Role dan pembatasan akses per tim.
-   Master kecamatan.
-   Master mitra.
-   Master tim.
-   Master kegiatan/tugas.
-   Master akun anggaran.
-   Pembuatan penugasan satu mitra.
-   Pembuatan penugasan massal untuk banyak mitra.
-   Status penugasan dan validasi batas bulanan.
-   Data SPK per mitra/periode kontrak beserta detail penugasan.
-   Dashboard dan monitoring.
-   Rekap bulanan per mitra dan per tim.
-   Import data Excel lama dengan preview dan laporan kesalahan.
-   Export data rekap ke Excel.
-   Audit log.

### Ditunda setelah MVP

-   Generate/cetak dokumen SPK otomatis (DOCX/PDF).
-   Pembayaran honor dan integrasi perbankan.
-   Aplikasi mobile native.
-   Integrasi API eksternal.
-   Notifikasi WhatsApp/email otomatis.
-   Workflow addendum SPK yang kompleks.
-   Override batas honor/tugas, kecuali kebijakan resmi mengharuskan.

**Catatan:** data dan metadata SPK tetap dikelola pada MVP. Yang ditunda
adalah pembuatan file dokumen SPK otomatis.

## 6. Modul dan kebutuhan fungsional

### 6.1 Dashboard

-   Menampilkan ringkasan bulan terpilih.
-   Menampilkan jumlah mitra aktif, jumlah penugasan, total nilai
    penugasan, dan jumlah mitra yang mencapai/mendekati batas.
-   Menampilkan distribusi penugasan per tim.
-   Menampilkan aktivitas terbaru.
-   Menyediakan filter bulan/tahun dan tim.
-   Semua angka harus berasal dari query transaksi, bukan angka statis.

### 6.2 Master mitra

-   Tambah, lihat, ubah, dan nonaktifkan mitra.
-   Menyimpan kode mitra unik, nama, alamat, kecamatan, nomor kontak,
    dan status.
-   Mendukung pencarian nama/kode dan filter kecamatan/status.
-   Menampilkan halaman detail dengan ringkasan, riwayat penugasan,
    rekap honor, dan daftar SPK.
-   Mitra yang memiliki histori tidak boleh dihapus permanen melalui UI.

### 6.3 Master kecamatan

-   Menyediakan master 18 kecamatan Kabupaten Mojokerto.
-   Kode dan nama kecamatan berasal dari referensi wilayah resmi.
-   Tidak boleh membuat nama/kode kecamatan berdasarkan tebakan.
-   Kecamatan yang sudah digunakan mitra tidak boleh dihapus; hanya
    dapat dinonaktifkan bila dibutuhkan.

### 6.4 Master tim

-   CRUD tim.
-   Data awal: Produksi, Sosial, Pertanian, Distribusi, IPDS.
-   Setiap tugas terhubung ke tim penanggung jawab.
-   Pengguna dapat dikaitkan dengan satu atau lebih tim.

### 6.5 Master tugas

-   CRUD kegiatan/survei.
-   Field minimal: kode opsional, nama kegiatan, tim, satuan default,
    tarif default, akun anggaran default, status aktif.
-   Tarif master merupakan nilai default; tarif transaksi dapat
    disesuaikan sesuai kewenangan.
-   Perubahan master tidak mengubah snapshot penugasan yang sudah
    dibuat/disetujui.

### 6.6 Master akun anggaran

-   Menyimpan kode akun dan nama/deskripsi akun.
-   Mendukung status aktif/nonaktif.
-   Penugasan menyimpan snapshot kode akun yang digunakan.

### 6.7 Penugasan

-   Membuat satu penugasan untuk satu mitra.
-   Mendukung bulk assignment: satu kegiatan dan detail yang sama dapat
    diberikan kepada beberapa mitra.
-   Field: mitra, tim/kegiatan, SPK, tanggal mulai, tanggal selesai,
    volume, satuan, harga satuan, nilai, akun anggaran, status, catatan.
-   Nilai perjanjian dihitung dari volume × harga satuan, dengan aturan
    pembulatan yang konsisten.
-   Menampilkan simulasi dampak terhadap kuota dan honor sebelum
    penyimpanan.
-   Validasi dilakukan ulang di backend ketika transaksi disimpan.
-   Perubahan transaksi yang telah dihitung harus menjalankan validasi
    ulang.
-   Pembatalan membutuhkan alasan dan dicatat di audit log.

### 6.8 SPK

-   Satu SPK terkait dengan satu mitra.
-   Satu SPK dapat memiliki banyak detail penugasan.
-   Satu mitra dapat memiliki SPK baru untuk periode kontrak berbeda.
-   Menyimpan nomor SPK, tanggal, periode/masa kontrak, jabatan,
    pekerjaan, alamat atau data kontraktual yang diperlukan, dan status.
-   Nomor SPK harus unik sesuai kebijakan penomoran.
-   MVP mengelola data SPK; generate/cetak dokumen otomatis ditunda.

### 6.9 Monitoring dan rekap

-   Rekap bulanan per mitra: jumlah tugas, total nilai, sisa kuota,
    status batas.
-   Rekap per tim dan kegiatan.
-   Kalender berdasarkan tanggal mulai/akhir pekerjaan.
-   Filter bulan, tahun, tim, kecamatan, mitra, kegiatan, dan status.
-   Tabel rekap menjadi tampilan utama; kalender menjadi tampilan
    alternatif.
-   Kanban dapat digunakan untuk status administrasi, bukan sebagai
    pengganti tabel rekap.

### 6.10 Import dan export

-   Import workbook Excel lama yang memiliki kelompok kolom Uraian Tugas
    1--7.
-   Mapping setiap kelompok tugas menjadi record penugasan terpisah.
-   Preview data sebelum commit.
-   Validasi mitra, tugas, tanggal, volume, tarif, akun, nomor SPK, dan
    duplikasi.
-   Menampilkan hasil sukses/gagal per baris atau per detail tugas.
-   Export rekap ke Excel.
-   Export data mentah terstruktur untuk kebutuhan rekonsiliasi.
-   Generate file SPK otomatis tidak termasuk MVP.

## 7. Aturan bisnis utama

1.  Batas per mitra per bulan adalah maksimal 10 penugasan **atau**
    total honor Rp4.000.000.
2.  Operator logika adalah OR: jika salah satu batas akan terlampaui,
    penugasan ditolak.
3.  Periode pembebanan ditentukan oleh bulan dari tanggal mulai
    penugasan.
4.  Seluruh nilai penugasan masuk ke satu bulan tersebut; tidak
    diprorata.
5.  Satu detail penugasan untuk satu mitra dihitung satu tugas.
6.  Status yang dihitung: Disetujui, Aktif, Selesai.
7.  Status yang tidak dihitung: Draft, Menunggu Persetujuan, Dibatalkan.
8.  Satu SPK dimiliki satu mitra dan dapat memiliki beberapa detail
    penugasan.
9.  Tidak ada override batas pada MVP.
10. Detail aturan lengkap terdapat di `BUSINESS-RULES.md`.

## 8. Kebutuhan nonfungsional

-   UI responsif, dengan prioritas penggunaan desktop.
-   Waktu respons wajar untuk daftar berpaginasi dan filter umum.
-   Validasi dan otorisasi backend untuk seluruh operasi sensitif.
-   Transaksi database dan locking untuk mencegah race condition saat
    validasi batas.
-   Audit log untuk perubahan penting.
-   Backup database dan prosedur restore.
-   Struktur kode modular, reusable, dan mudah diuji.
-   Tidak ada credential, secret, atau data sensitif di repository.
-   Kompatibilitas deployment cPanel harus diuji sejak awal.

## 9. Risiko dan mitigasi

  -----------------------------------------------------------------------
  Risiko                              Mitigasi
  ----------------------------------- -----------------------------------
  Data Excel tidak konsisten          Preview, mapping, validasi, dan
                                      laporan import

  Nama mitra duplikat                 Kode mitra unik; pencocokan nama
                                      hanya sebagai bantuan

  Penugasan bersamaan melewati batas  Transaction + row locking +
                                      pengujian concurrency

  Master tarif berubah                Simpan snapshot tarif pada
                                      transaksi

  SPK berubah setelah disetujui       Batasi edit; simpan histori revisi

  Perbedaan interpretasi satu tugas   Validasi definisi satu detail
                                      penugasan = satu tugas

  Periode lintas bulan membingungkan  Gunakan tanggal mulai sebagai bulan
                                      pembebanan
  -----------------------------------------------------------------------

## 10. Kriteria penerimaan tingkat produk

-   Pengguna dapat mengelola mitra dan master kegiatan.
-   Satu mitra dapat memiliki banyak penugasan tanpa menambah kolom.
-   Penugasan ditolak jika salah satu batas bulanan terlampaui.
-   Penugasan lintas bulan dibebankan seluruhnya ke bulan tanggal mulai.
-   Satu SPK dapat memuat beberapa detail penugasan untuk satu mitra.
-   Rekap bulan dan total honor dapat direkonsiliasi dengan detail
    penugasan.
-   Import Excel lama dapat memecah kelompok tugas horizontal menjadi
    record terpisah.
-   Semua perubahan penting dapat ditelusuri.
