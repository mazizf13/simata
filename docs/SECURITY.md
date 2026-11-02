# Security & Access Control --- SIMATA

## 1. Prinsip

-   Deny by default.
-   Backend sebagai sumber kebenaran otorisasi.
-   Least privilege.
-   Audit untuk operasi penting.
-   Lindungi data pribadi dan informasi honor.
-   Jangan menyimpan secret di repository.

## 2. Authentication

-   Gunakan mekanisme autentikasi Laravel yang sesuai deployment.
-   Untuk SPA satu origin, pertimbangkan session + CSRF atau Laravel
    Sanctum stateful.
-   Terapkan password hashing bawaan Laravel.
-   Terapkan rate limiting untuk login dan endpoint sensitif.
-   Sediakan logout dan invalidasi session.
-   Kebijakan reset password harus mengikuti kemampuan hosting dan
    kebijakan internal.

## 3. Authorization

Role awal: - Super Admin - Admin - Operator Tim - Pimpinan

Contoh matriks akses:

  Aksi                       Super Admin           Admin       Operator Tim        Pimpinan
  ------------------------ ------------- --------------- ------------------ ---------------
  Lihat dashboard                     Ya              Ya        Tim sendiri              Ya
  Kelola pengguna                     Ya        Terbatas              Tidak           Tidak
  Kelola master mitra                 Ya              Ya        Sesuai izin           Tidak
  Kelola master tugas                 Ya              Ya               Baca           Tidak
  Buat penugasan                      Ya              Ya        Tim sendiri           Tidak
  Setujui penugasan                   Ya              Ya   Sesuai kebijakan           Tidak
  Lihat rekap                         Ya              Ya        Tim sendiri              Ya
  Ubah konfigurasi batas              Ya   Tidak/default              Tidak           Tidak
  Lihat audit log                     Ya     Sesuai izin              Tidak   Baca terbatas

Matriks final harus disetujui pemilik proses. Implementasikan
menggunakan Policies/Gates atau package role-permission yang teruji.

## 4. Data protection

-   Validasi semua input di backend.
-   Escape output untuk mencegah XSS.
-   Proteksi CSRF sesuai metode autentikasi.
-   Batasi tipe, ukuran, dan isi file upload.
-   Simpan file import di lokasi non-public.
-   Jangan mengekspos `.env`, log, backup, atau source sensitif.
-   Gunakan HTTPS.
-   Batasi akses endpoint export dan detail honor.
-   Jangan menaruh data pribadi/honor pada log aplikasi yang tidak
    perlu.

## 5. Audit log

Catat minimal: - Login/logout (sesuai kebutuhan keamanan). -
Create/update/deactivate mitra. - Perubahan master tugas/tarif. -
Create/approve/activate/complete/cancel assignment. - Perubahan SPK. -
Import dan export. - Perubahan role/permission. - Perubahan konfigurasi
batas.

Audit record: - user - action - entity type/id - timestamp - old
values/new values untuk field relevan - IP/user agent bila diperlukan
dan sesuai kebijakan

Jangan menyimpan password, token, atau secret ke audit log.

## 6. Concurrency

Validasi batas harus atomik: 1. Mulai database transaction. 2. Lock row
mitra. 3. Hitung jumlah dan nilai penugasan yang dihitung pada bulan
target. 4. Evaluasi batas OR. 5. Simpan perubahan jika lolos. 6. Commit.

Untuk bulk, lock mitra berdasarkan urutan ID yang konsisten. Tangani
deadlock dengan retry terbatas dan aman.

## 7. Backup dan recovery

-   Backup database berkala.
-   Backup file import dan file pendukung.
-   Simpan backup di lokasi terpisah dari hosting utama bila
    memungkinkan.
-   Uji restore, bukan hanya membuat backup.
-   Batasi akses file backup.

## 8. Deployment checklist

-   APP_DEBUG=false.
-   APP_ENV=production.
-   APP_KEY tersedia dan aman.
-   `.env` tidak dapat diakses publik.
-   HTTPS aktif.
-   Permission storage/cache benar.
-   Database credential memiliki hak minimum.
-   Folder upload tidak dapat mengeksekusi script.
-   Error tidak menampilkan stack trace ke pengguna.
-   Backup awal dilakukan sebelum migrasi/import produksi.
