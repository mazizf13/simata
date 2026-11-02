# SIMATA --- Sistem Manajemen Mitra BPS

Dokumentasi awal proyek aplikasi internal pengelolaan mitra, penugasan,
SPK, dan rekap honor untuk BPS Kabupaten Mojokerto (kode wilayah 3516).

> **Status:** Draft spesifikasi awal v1.0\
> **Bahasa:** Indonesia\
> **Stack target:** Laravel + React + Vite + INA Digital Design System +
> MySQL\
> **Deployment target:** cPanel

## Tujuan

SIMATA dirancang untuk menggantikan pengelolaan penugasan mitra yang
saat ini menggunakan spreadsheet horizontal. Setiap mitra memiliki satu
profil, sedangkan setiap pekerjaan disimpan sebagai record penugasan
tersendiri. Dengan struktur ini, riwayat, validasi batas bulanan, dan
rekap dapat dikelola tanpa menambah kolom Uraian Tugas 1--7.

## Prinsip produk

1.  **Mitra sebagai entitas utama:** satu mitra memiliki satu identitas
    internal dan banyak riwayat penugasan.
2.  **Penugasan sebagai transaksi:** satu detail pekerjaan untuk satu
    mitra disimpan sebagai satu record.
3.  **Validasi di backend:** batas penugasan dan honor wajib diperiksa
    oleh Laravel.
4.  **Data historis terjaga:** perubahan master tidak mengubah snapshot
    transaksi yang sudah disetujui.
5.  **Administrasi dahulu:** UI mengutamakan tabel, filter, formulir
    terstruktur, dan keterlacakan.
6.  **Output dokumen ditunda:** pada tahap awal, SIMATA mengelola data
    SPK dan penugasannya. Fitur generate/cetak dokumen SPK belum
    termasuk implementasi awal.

## Keputusan produk yang sudah ditetapkan

  -----------------------------------------------------------------------
  Area                                Keputusan
  ----------------------------------- -----------------------------------
  Batas bulanan                       Maksimal 10 penugasan **atau**
                                      total honor maksimal Rp4.000.000

  Operator batas                      OR --- salah satu batas terlampaui
                                      berarti transaksi ditolak

  Periode honor                       Seluruh nilai masuk ke bulan
                                      berdasarkan tanggal mulai penugasan

  Struktur SPK                        Satu SPK per mitra per periode
                                      kontrak; satu SPK dapat memiliki
                                      beberapa detail penugasan

  Tim awal                            Produksi, Sosial, Pertanian,
                                      Distribusi, IPDS

  Wilayah                             Kabupaten Mojokerto, kode 3516, 18
                                      kecamatan

  Frontend                            React + Vite

  Backend                             Laravel

  UI                                  `@idds/react` dari INA Digital
                                      Design System

  Database                            MySQL
  -----------------------------------------------------------------------

## Isi dokumentasi

-   `PRD.md` --- kebutuhan produk dan ruang lingkup.
-   `BUSINESS-RULES.md` --- aturan bisnis dan validasi.
-   `DATABASE.md` --- rancangan entitas, relasi, dan constraint.
-   `ARCHITECTURE.md` --- arsitektur aplikasi.
-   `DESIGN.md` --- arahan UI/UX dan design system.
-   `ROUTES.md` --- navigasi dan rancangan halaman.
-   `API.md` --- kontrak endpoint API awal.
-   `IMPORT-EXPORT.md` --- migrasi Excel lama dan kebutuhan ekspor data.
-   `SECURITY.md` --- autentikasi, otorisasi, dan audit.
-   `DEVELOPMENT-PLAN.md` --- tahapan implementasi dan acceptance
    criteria.
-   `AGENTS.md` --- instruksi kerja untuk Antigravity/AI coding agent.

## Cara menggunakan

1.  Baca `README.md`, `PRD.md`, dan `BUSINESS-RULES.md` terlebih dahulu.
2.  Tinjau `DATABASE.md` sebelum membuat migration.
3.  Implementasikan backend dan pengujian business rules sebelum
    membangun dashboard.
4.  Gunakan `DESIGN.md` sebagai batasan visual selama implementasi
    frontend.
5.  Gunakan `AGENTS.md` sebagai instruksi tetap untuk coding agent.
6.  Catat perubahan keputusan produk di dokumentasi terkait agar
    spesifikasi tidak saling bertentangan.

## Hal yang masih perlu dikonfirmasi

Dokumentasi ini sengaja menetapkan default yang dapat diubah setelah
validasi dengan pemilik proses:

-   Daftar resmi 18 kecamatan dan kode wilayahnya perlu diisi dari
    referensi resmi.
-   Apakah satu mitra boleh memiliki lebih dari satu SPK aktif dalam
    periode yang sama.
-   Apakah operator tim dapat menyetujui penugasan sendiri atau
    persetujuan harus dilakukan role lain.
-   Format final nomor SPK dan field wajib kontrak.
-   Apakah penugasan yang sudah disetujui dapat diedit langsung atau
    wajib melalui revisi.
-   Kebijakan resmi pengecualian batas 10 penugasan/Rp4 juta. Default
    MVP: tidak ada override.
-   Definisi operasional "satu tugas" perlu disepakati. Default: satu
    detail penugasan untuk satu mitra dihitung satu tugas.
