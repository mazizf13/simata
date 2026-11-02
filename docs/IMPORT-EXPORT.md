# Import & Export Specification --- SIMATA

## 1. Tujuan

Mengubah workbook lama yang menggunakan satu baris per mitra dan
kelompok kolom Uraian Tugas 1--7 menjadi struktur relasional. Import
harus aman, dapat ditinjau, dan tidak membuat duplikasi tanpa diketahui
pengguna.

## 2. Sumber data lama

Kolom umum: - No - No. SPK - Nama Petugas - Pekerjaan - Alamat

Kelompok tugas berulang: - Uraian Tugas N - Jangka Waktu Mulai N -
Jangka Waktu Akhir N - Volume Pekerjaan N - Satuan N - Harga Satuan N -
Nilai Perjanjian N - Beban Anggaran N

Kolom akhir: - Total - Terbilang Total

Jumlah kelompok pada contoh saat ini sampai 7. Importer sebaiknya
mendeteksi pola suffix angka dan tidak mengunci desain hanya untuk tujuh
kelompok.

## 3. Mapping

  ---------------------------------------------------------------------------
  Excel lama                          SIMATA
  ----------------------------------- ---------------------------------------
  Nama Petugas                        `mitras.name`

  Alamat                              `mitras.address` atau alamat pekerjaan
                                      sesuai hasil klarifikasi

  Pekerjaan                           `spks.occupation` atau snapshot
                                      pekerjaan

  No. SPK                             `spks.spk_number`

  Uraian Tugas N                      `task_assignments.task_name_snapshot`
                                      dan mapping ke `tasks`

  Jangka Waktu Mulai N                `task_assignments.start_date`

  Jangka Waktu Akhir N                `task_assignments.end_date`

  Volume Pekerjaan N                  `task_assignments.volume`

  Satuan N                            `task_assignments.unit_snapshot`

  Harga Satuan N                      `task_assignments.unit_price`

  Nilai Perjanjian N                  `task_assignments.total_value`

  Beban Anggaran N                    mapping `budget_accounts` + snapshot
  ---------------------------------------------------------------------------

`Total` dan `Terbilang Total` sebaiknya dihitung ulang dari detail yang
berhasil diimport. Nilai dari Excel dipakai sebagai pembanding
rekonsiliasi, bukan sumber utama.

## 4. Tantangan mapping

-   Nama petugas tidak selalu unik.
-   Nama kegiatan pada Excel dapat memiliki variasi ejaan.
-   Satu nomor SPK dapat muncul pada beberapa baris atau workbook.
-   Sel kosong dapat berarti tugas tidak ada atau sel gabungan/format
    Excel.
-   Format tanggal dapat berbeda.
-   Nilai rupiah dapat berisi teks `Rp`, titik pemisah ribuan, spasi,
    atau tanda `-`.
-   Kode akun mungkin berada pada kolom berbeda atau memiliki spasi.
-   Kolom alamat perlu dipastikan apakah alamat mitra atau alamat
    pelaksanaan pekerjaan.

Jangan melakukan auto-match mitra hanya berdasarkan nama jika ada lebih
dari satu kandidat. Gunakan kode mitra jika tersedia; jika tidak,
tampilkan kandidat untuk konfirmasi.

## 5. Workflow import

1.  Upload workbook.
2.  Pilih sheet.
3.  Deteksi header dan kelompok kolom tugas.
4.  Mapping kolom.
5.  Normalisasi tanggal, angka, satuan, dan kode akun.
6.  Cocokkan mitra, kegiatan, akun, dan SPK.
7.  Tampilkan preview.
8.  Tampilkan error per baris dan per kelompok tugas.
9.  Pengguna memperbaiki mapping atau mengunduh error report.
10. Konfirmasi commit.
11. Simpan dalam database transaction/batch yang terkontrol.
12. Tampilkan ringkasan sukses, dilewati, dan gagal.

## 6. Validasi import

-   Nama mitra wajib ada.
-   Mitra harus dapat dipetakan ke satu ID yang jelas.
-   Nomor SPK wajib sesuai aturan data yang disepakati.
-   Uraian tugas kosong berarti kelompok tugas dilewati.
-   Jika uraian tugas ada, tanggal, volume, satuan, tarif, dan akun
    divalidasi sesuai kebijakan field wajib.
-   Tanggal akhir tidak boleh sebelum tanggal mulai.
-   Volume harus positif.
-   Tarif tidak negatif.
-   Nilai perjanjian dihitung ulang; jika berbeda dari Excel, tampilkan
    warning.
-   Kode akun harus cocok dengan master atau masuk antrean mapping.
-   Duplikasi diperiksa sebelum commit.
-   Import historis harus memiliki opsi untuk tidak menerapkan batas
    bulanan saat ini, jika data yang dimasukkan merupakan arsip masa
    lalu. Opsi ini hanya untuk role berwenang dan wajib tercatat.

## 7. Idempotensi dan duplikasi

Simpan import batch: - `import_batches`: file, uploader, waktu, status,
checksum, ringkasan. - `import_rows`: nomor baris, data mentah, status,
error. - `source_fingerprint` atau external key untuk mengenali record
sumber.

Jangan menganggap kombinasi nama + kegiatan + tanggal sebagai kunci unik
tanpa validasi bisnis. Tampilkan potensi duplikasi kepada pengguna.

## 8. Export MVP

Format: - Rekap honor per mitra per bulan. - Rekap penugasan per tim. -
Detail transaksi. - Daftar SPK dan detail penugasannya (data tabular,
bukan dokumen SPK resmi).

Export mengikuti filter yang aktif dan mencantumkan periode serta waktu
pembuatan file.

## 9. Di luar MVP

-   Generate SPK DOCX/PDF.
-   Template tanda tangan.
-   Terbilang pada dokumen final (boleh disediakan sebagai helper
    setelah fitur dokumen disetujui).
-   Penomoran dokumen otomatis jika belum ada kebijakan resmi.
