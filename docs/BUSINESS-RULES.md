# Business Rules --- SIMATA

**Versi:** 1.0\
**Status:** Draft aturan operasional

Dokumen ini menjadi sumber kebenaran untuk implementasi validasi. Jika
ada perbedaan antara UI, API, dan dokumen lain, aturan di sini harus
menjadi acuan sampai keputusan produk diperbarui.

## 1. Batas penugasan dan honor bulanan

### 1.1 Konfigurasi awal

``` text
MAX_ASSIGNMENTS_PER_MONTH = 10
MAX_HONOR_PER_MONTH = 4000000
LIMIT_OPERATOR = OR
PERIOD_BASIS = assignment.start_date
COUNTED_STATUSES = [approved, active, completed]
EXCLUDED_STATUSES = [draft, pending_approval, cancelled]
OVERRIDE_ENABLED = false
```

### 1.2 Logika OR

Penugasan baru ditolak apabila salah satu kondisi berikut benar:

``` text
projected_assignment_count > 10
OR
projected_honor_total > 4_000_000
```

Dengan demikian, kedua batas tidak harus terlampaui bersamaan. Batas
yang lebih dahulu tercapai menghentikan penambahan penugasan.

### 1.3 Contoh

    Tugas saat ini   Honor saat ini         Penugasan baru Hasil
  ---------------- ---------------- ---------------------- ---------------------
                 9      Rp3.000.000     1 tugas, Rp200.000 Terima
                 9      Rp3.000.000   1 tugas, Rp1.100.000 Tolak: honor
                10      Rp2.000.000     1 tugas, Rp100.000 Tolak: jumlah tugas
                 5      Rp3.500.000     1 tugas, Rp500.000 Terima
                 5      Rp3.500.000     1 tugas, Rp600.000 Tolak: honor
                 8      Rp3.900.000     1 tugas, Rp100.000 Terima
                 8      Rp3.900.000     1 tugas, Rp100.001 Tolak: honor

Nilai tepat Rp4.000.000 dan jumlah tepat 10 masih diperbolehkan.
Penolakan terjadi ketika nilai proyeksi **lebih besar** dari batas,
bukan ketika sama dengan batas.

## 2. Definisi satu tugas

Default MVP: - Satu record `task_assignment` untuk satu mitra dihitung
satu tugas. - Bulk assignment kepada 10 mitra menghasilkan 10 record
penugasan, masing-masing dihitung pada mitra terkait. - Jika satu mitra
memiliki dua kegiatan berbeda dalam satu SPK, dihitung dua tugas. -
Perubahan detail pada record yang sama tidak menambah jumlah tugas. -
Pemecahan satu pekerjaan menjadi beberapa record akan menambah hitungan;
karena itu pengguna harus mengikuti definisi operasional yang
disepakati.

Definisi ini perlu dikonfirmasi dengan pemilik proses sebelum data
produksi dimasukkan.

## 3. Penentuan bulan pembebanan

Bulan pembebanan ditentukan oleh `start_date`.

Contoh: - Mulai: 24 September 2026 - Selesai: 10 Oktober 2026 - Nilai:
Rp1.000.000 - Periode rekap: September 2026 - Nilai yang masuk
September: Rp1.000.000 - Nilai yang masuk Oktober: Rp0

Tidak ada prorata otomatis. Tanggal selesai digunakan untuk kalender dan
informasi masa kerja, bukan untuk menentukan bulan honor.

Jika tanggal mulai berubah, bulan pembebanan berubah dan validasi batas
harus dijalankan ulang untuk bulan asal serta bulan tujuan.

## 4. Status dan dampaknya pada rekap

  Status                   Masuk jumlah tugas?   Masuk total honor?
  ---------------------- --------------------- --------------------
  Draft                                  Tidak                Tidak
  Menunggu Persetujuan                   Tidak                Tidak
  Disetujui                                 Ya                   Ya
  Aktif                                     Ya                   Ya
  Selesai                                   Ya                   Ya
  Dibatalkan                             Tidak                Tidak

Perubahan dari status yang tidak dihitung ke status yang dihitung harus
menjalankan validasi batas sebelum status disimpan.

Perubahan dari status dihitung ke status tidak dihitung harus dicatat
dan memicu kalkulasi ulang rekap.

## 5. Perubahan dan pembatalan

-   Draft dapat diedit sesuai izin.
-   Penugasan yang menunggu persetujuan dapat diedit oleh pembuat atau
    role berwenang.
-   Penugasan yang sudah disetujui/aktif/selesai tidak boleh diubah
    diam-diam.
-   Perubahan nilai, mitra, tanggal mulai, volume, tarif, atau akun pada
    transaksi yang sudah disetujui harus melalui mekanisme revisi yang
    mencatat nilai lama dan baru.
-   Pembatalan wajib menyimpan alasan, pengguna, dan waktu.
-   Pembatalan mengeluarkan transaksi dari hitungan aktif, tetapi
    histori tetap tersimpan.
-   Jika revisi mengubah mitra atau bulan pembebanan, validasi harus
    dijalankan untuk kombinasi mitra-periode yang terdampak.

Default MVP yang disarankan: transaksi berstatus Disetujui/Aktif/Selesai
dikunci dari edit langsung. Perubahan dilakukan melalui aksi revisi
terbatas atau pembatalan dan pembuatan ulang, sesuai kebijakan yang
disahkan.

## 6. Tarif dan nilai perjanjian

Formula default:

``` text
total_value = volume × unit_price
```

-   `unit_price` dan `total_value` menggunakan DECIMAL, bukan FLOAT.
-   Tarif default diambil dari master tugas.
-   Tarif dapat disesuaikan ketika penugasan dibuat jika role memiliki
    izin.
-   Nilai tarif dan akun anggaran disalin sebagai snapshot transaksi.
-   Perubahan master tidak mengubah transaksi historis.
-   Aturan pembulatan harus konsisten; default dua angka desimal, tetapi
    nilai rupiah biasanya bilangan bulat. Kebijakan pembulatan final
    perlu dikonfirmasi.

## 7. SPK

-   Satu SPK terkait tepat satu mitra.
-   Satu SPK dapat memiliki banyak detail penugasan.
-   Satu mitra dapat memiliki beberapa SPK untuk periode kontrak
    berbeda.
-   Default rekomendasi: satu SPK per mitra per periode kontrak.
-   Nomor SPK harus unik.
-   Detail penugasan yang terhubung ke SPK harus memiliki mitra yang
    sama dengan pemilik SPK.
-   Perubahan data SPK yang sudah disahkan harus memiliki histori.
-   MVP menyimpan data SPK, tetapi belum menghasilkan file DOCX/PDF.

## 8. Bulk assignment

-   Satu kegiatan dapat diberikan ke banyak mitra.
-   Sistem memvalidasi setiap mitra secara independen.
-   Hasil dapat berupa sukses sebagian atau gagal sebagian hanya jika
    mode partial success dipilih secara eksplisit.
-   Default rekomendasi MVP: tampilkan preview seluruh mitra dan hasil
    validasi; pengguna mengonfirmasi. Setiap mitra yang gagal ditandai
    dengan alasan yang jelas.
-   Proses penyimpanan harus idempotent terhadap request yang sama untuk
    mencegah duplikasi akibat double-click atau retry.
-   Setiap record yang berhasil dibuat memiliki ID dan jejak audit.

## 9. Concurrency dan integritas

-   Validasi batas harus dijalankan di backend.
-   Proses create/update/approve yang memengaruhi batas harus berada
    dalam database transaction.
-   Kunci baris mitra menggunakan `SELECT ... FOR UPDATE` atau mekanisme
    locking setara untuk menserialisasi perubahan pada mitra yang sama.
-   Perhitungan total harus memakai sumber data transaksi yang sama
    dengan proses penyimpanan.
-   Bulk assignment memerlukan penguncian mitra dalam urutan ID yang
    konsisten untuk mengurangi deadlock.
-   Jika validasi gagal, transaksi tidak boleh tersimpan sebagian.

## 10. Pesan validasi

Pesan yang disarankan: -
`Batas jumlah penugasan tercapai. Mitra sudah memiliki 10 penugasan pada September 2026.` -
`Batas honor bulanan terlampaui. Total setelah penugasan menjadi Rp4.150.000, sedangkan batas maksimal Rp4.000.000.` -
`Penugasan tidak dapat disetujui karena perubahan tanggal mulai mengubah periode pembebanan.` -
`SPK yang dipilih bukan milik mitra ini.`

## 11. Hal yang memerlukan pengesahan

1.  Definisi final satu tugas.
2.  Apakah status Menunggu Persetujuan digunakan pada MVP.
3.  Apakah tugas selesai tetap dihitung (default: ya).
4.  Kebijakan revisi setelah SPK ditandatangani.
5.  Apakah override batas boleh dilakukan oleh pimpinan.
6.  Kebijakan pembulatan nilai.
