# API Contract --- SIMATA

**Base path:** `/api`\
**Format:** JSON\
**Status:** Draft endpoint; response final mengikuti implementasi
Laravel API Resource.

## 1. Konvensi

-   Gunakan plural nouns untuk resource.
-   Gunakan HTTP status yang sesuai.
-   Pagination server-side.
-   Validasi request melalui Form Request.
-   Error memiliki struktur konsisten.
-   Tanggal menggunakan ISO 8601 atau `YYYY-MM-DD` untuk field date.
-   Nominal uang dikirim sebagai angka decimal/string decimal, bukan
    format tampilan `Rp`.
-   Backend menghitung `total_value`; jangan menerima total dari
    frontend sebagai sumber kebenaran.

Contoh response sukses:

``` json
{
  "data": {},
  "message": "Data berhasil disimpan"
}
```

Contoh error validasi:

``` json
{
  "message": "Validasi gagal",
  "errors": {
    "start_date": ["Tanggal mulai wajib diisi."]
  }
}
```

## 2. Endpoint

### Dashboard

  Method   Endpoint                              Keterangan
  -------- ------------------------------------- -------------------
  GET      `/dashboard?month=2026-09&team_id=`   Ringkasan periode

### Mitra

  Method      Endpoint                               Keterangan
  ----------- -------------------------------------- ------------------------------
  GET         `/mitras`                              Daftar + filter + pagination
  POST        `/mitras`                              Buat mitra
  GET         `/mitras/{id}`                         Detail mitra
  PUT/PATCH   `/mitras/{id}`                         Ubah mitra
  POST        `/mitras/{id}/deactivate`              Nonaktifkan
  GET         `/mitras/{id}/summary?month=2026-09`   Ringkasan bulan
  GET         `/mitras/{id}/assignments`             Riwayat penugasan
  GET         `/mitras/{id}/spks`                    Daftar SPK

### Master

  Method      Endpoint                        Keterangan
  ----------- ------------------------------- ---------------------------
  GET/POST    `/districts`                    Daftar/buat kecamatan
  GET/POST    `/teams`                        Daftar/buat tim
  GET/POST    `/tasks`                        Daftar/buat kegiatan
  GET/POST    `/budget-accounts`              Daftar/buat akun anggaran
  PUT/PATCH   `/{resource}/{id}`              Perubahan resource
  POST        `/{resource}/{id}/deactivate`   Nonaktifkan resource

Endpoint master final dapat dipisah per controller sesuai kebutuhan.

### Penugasan

  ------------------------------------------------------------------------------
  Method                  Endpoint                       Keterangan
  ----------------------- ------------------------------ -----------------------
  GET                     `/assignments`                 Daftar penugasan

  POST                    `/assignments`                 Buat satu penugasan

  POST                    `/assignments/bulk`            Buat penugasan massal

  GET                     `/assignments/{id}`            Detail

  PATCH                   `/assignments/{id}`            Ubah sesuai aturan
                                                         status

  POST                    `/assignments/{id}/submit`     Ajukan persetujuan

  POST                    `/assignments/{id}/approve`    Setujui dan jalankan
                                                         validasi batas

  POST                    `/assignments/{id}/activate`   Aktifkan

  POST                    `/assignments/{id}/complete`   Tandai selesai

  POST                    `/assignments/{id}/cancel`     Batalkan dengan alasan

  GET                     `/assignments/calendar`        Data kalender
  ------------------------------------------------------------------------------

### SPK

  Method   Endpoint                   Keterangan
  -------- -------------------------- ----------------------------
  GET      `/spks`                    Daftar SPK
  POST     `/spks`                    Buat metadata SPK
  GET      `/spks/{id}`               Detail SPK
  PATCH    `/spks/{id}`               Ubah sesuai status/izin
  GET      `/spks/{id}/assignments`   Detail penugasan dalam SPK

### Laporan dan import/export

  Method   Endpoint                         Keterangan
  -------- -------------------------------- --------------------------------
  GET      `/reports/monthly`               Rekap bulanan
  GET      `/reports/teams`                 Rekap per tim
  GET      `/reports/assignments`           Detail transaksi untuk laporan
  POST     `/imports/assignments/preview`   Upload dan preview
  POST     `/imports/assignments/commit`    Commit hasil import
  GET      `/exports/monthly`               Export rekap
  GET      `/exports/assignments`           Export detail penugasan

Generate dokumen SPK DOCX/PDF tidak termasuk endpoint MVP.

## 3. Parameter filter

Daftar penugasan:

``` text
month=2026-09
team_id=1
task_id=3
mitra_id=12
district_id=4
status=active
spk_number=...
page=1
per_page=25
sort=start_date
direction=desc
```

## 4. Contoh create assignment

Request:

``` json
{
  "mitra_id": 12,
  "task_id": 3,
  "spk_id": 8,
  "budget_account_id": 2,
  "start_date": "2026-09-24",
  "end_date": "2026-09-30",
  "volume": "15",
  "unit": "segmen",
  "unit_price": "56000",
  "status": "draft",
  "notes": null
}
```

Backend: - Memastikan mitra, tugas, SPK, dan akun valid. - Memastikan
mitra pemilik SPK sama dengan `mitra_id`. - Mengambil snapshot nama
kegiatan/tim/satuan/akun. - Menghitung
`total_value = volume × unit_price`. - Menjalankan validasi batas ketika
transaksi berpindah ke status yang dihitung. - Menyimpan audit log.

## 5. Contoh bulk assignment

``` json
{
  "task_id": 3,
  "spk_id": 8,
  "start_date": "2026-09-24",
  "end_date": "2026-09-30",
  "volume": "15",
  "unit": "segmen",
  "unit_price": "56000",
  "budget_account_id": 2,
  "mitra_ids": [12, 13, 14]
}
```

Catatan: contoh di atas mengasumsikan ketiga mitra memiliki SPK yang
sesuai. Jika satu SPK per mitra, implementasi bulk harus menerima
pemetaan `mitra_id → spk_id`, bukan satu `spk_id` global. Kontrak final
sebaiknya menggunakan array objek per mitra agar aman.

## 6. Error bisnis

Gunakan kode error yang stabil: - `ASSIGNMENT_LIMIT_COUNT_EXCEEDED` -
`ASSIGNMENT_LIMIT_HONOR_EXCEEDED` - `SPK_MITRA_MISMATCH` -
`ASSIGNMENT_PERIOD_INVALID` - `ASSIGNMENT_STATUS_TRANSITION_INVALID` -
`DUPLICATE_IMPORT_RECORD`

Frontend menampilkan pesan manusiawi berdasarkan response backend.
