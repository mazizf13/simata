# Database Design --- SIMATA

**DBMS:** MySQL\
**Model:** Relational\
**Versi:** Draft 1.0

## 1. Prinsip desain

-   Gunakan relasi normalisasi untuk master dan transaksi.
-   Satu mitra dapat memiliki banyak penugasan.
-   Satu kegiatan dapat digunakan pada banyak penugasan.
-   Satu SPK dimiliki satu mitra dan dapat memuat banyak penugasan.
-   Data transaksi menyimpan snapshot nilai penting.
-   Gunakan foreign key, unique index, index komposit, dan soft delete
    secara terukur.
-   Gunakan `DECIMAL` untuk uang dan volume; hindari `FLOAT`/`DOUBLE`
    untuk nominal.

## 2. ERD konseptual

``` mermaid
erDiagram
    DISTRICTS ||--o{ MITRAS : contains
    TEAMS ||--o{ TASKS : owns
    MITRAS ||--o{ SPKS : has
    MITRAS ||--o{ TASK_ASSIGNMENTS : receives
    TASKS ||--o{ TASK_ASSIGNMENTS : defines
    SPKS ||--o{ TASK_ASSIGNMENTS : groups
    BUDGET_ACCOUNTS ||--o{ TASK_ASSIGNMENTS : charges
    USERS ||--o{ AUDIT_LOGS : creates
    USERS ||--o{ TEAM_USER : assigned
    TEAMS ||--o{ TEAM_USER : includes

    DISTRICTS {
      bigint id PK
      string code UK
      string name
    }
    MITRAS {
      bigint id PK
      string mitra_code UK
      string name
      bigint district_id FK
      string address
      string phone
      string status
    }
    TEAMS {
      bigint id PK
      string code UK
      string name
    }
    TASKS {
      bigint id PK
      string code
      bigint team_id FK
      string name
      string default_unit
      decimal default_rate
    }
    SPKS {
      bigint id PK
      bigint mitra_id FK
      string spk_number UK
      date contract_date
      date period_start
      date period_end
      string status
    }
    TASK_ASSIGNMENTS {
      bigint id PK
      bigint mitra_id FK
      bigint task_id FK
      bigint spk_id FK
      bigint budget_account_id FK
      date start_date
      date end_date
      decimal volume
      decimal unit_price
      decimal total_value
      string status
    }
    BUDGET_ACCOUNTS {
      bigint id PK
      string code UK
      string name
    }
    USERS {
      bigint id PK
      string name
      string email UK
    }
    TEAM_USER {
      bigint user_id FK
      bigint team_id FK
    }
    AUDIT_LOGS {
      bigint id PK
      bigint user_id FK
      string action
      string entity_type
      bigint entity_id
    }
```

## 3. Tabel dan kolom

### 3.1 `districts`

-   `id` BIGINT PK
-   `code` VARCHAR(20) UNIQUE
-   `name` VARCHAR(100)
-   `is_active` BOOLEAN
-   timestamps

Seed 18 kecamatan harus menggunakan kode/nama dari referensi resmi.
Jangan mengarang kode wilayah.

### 3.2 `mitras`

-   `id` BIGINT PK
-   `mitra_code` VARCHAR(30) UNIQUE, wajib
-   `name` VARCHAR(150), wajib
-   `address` TEXT nullable
-   `district_id` BIGINT FK → districts
-   `phone` VARCHAR(30) nullable
-   `email` VARCHAR(150) nullable
-   `occupation` VARCHAR(100) nullable
-   `position` VARCHAR(100) nullable
-   `status` ENUM/string: active, inactive
-   `notes` TEXT nullable
-   timestamps, `deleted_at`

Nama bukan unique key. Mitra dapat memiliki nama sama; `mitra_code`
menjadi identitas sistem.

### 3.3 `teams`

-   `id` BIGINT PK
-   `code` VARCHAR(30) UNIQUE
-   `name` VARCHAR(100) UNIQUE
-   `description` TEXT nullable
-   `is_active` BOOLEAN
-   timestamps

Seed awal: Produksi, Sosial, Pertanian, Distribusi, IPDS.

### 3.4 `team_user`

-   `user_id` BIGINT FK
-   `team_id` BIGINT FK
-   composite unique (`user_id`, `team_id`)

### 3.5 `tasks`

-   `id` BIGINT PK
-   `code` VARCHAR(50) nullable/unique sesuai kebijakan
-   `team_id` BIGINT FK → teams
-   `name` VARCHAR(200)
-   `default_unit` VARCHAR(50)
-   `default_rate` DECIMAL(15,2)
-   `default_budget_account_id` BIGINT nullable FK
-   `description` TEXT nullable
-   `is_active` BOOLEAN
-   timestamps, `deleted_at`

### 3.6 `budget_accounts`

-   `id` BIGINT PK
-   `code` VARCHAR(100) UNIQUE
-   `name` VARCHAR(200)
-   `description` TEXT nullable
-   `is_active` BOOLEAN
-   timestamps

### 3.7 `spks`

-   `id` BIGINT PK
-   `mitra_id` BIGINT FK → mitras
-   `spk_number` VARCHAR(100) UNIQUE
-   `contract_date` DATE
-   `period_start` DATE nullable
-   `period_end` DATE nullable
-   `occupation` VARCHAR(150) nullable
-   `position` VARCHAR(100) nullable
-   `work_address` TEXT nullable
-   `status` VARCHAR(30): draft, active, completed, cancelled
-   `notes` TEXT nullable
-   `created_by` BIGINT FK → users
-   timestamps, `deleted_at`

Jika satu mitra hanya boleh memiliki satu SPK per periode, tambahkan
validasi overlap periode di service. Unique index sederhana tidak cukup
untuk mencegah rentang tanggal yang saling tumpang tindih.

### 3.8 `task_assignments`

-   `id` BIGINT PK
-   `mitra_id` BIGINT FK → mitras
-   `task_id` BIGINT FK → tasks
-   `spk_id` BIGINT FK → spks
-   `budget_account_id` BIGINT nullable FK → budget_accounts
-   `task_name_snapshot` VARCHAR(200)
-   `team_name_snapshot` VARCHAR(100)
-   `budget_account_code_snapshot` VARCHAR(100) nullable
-   `budget_account_name_snapshot` VARCHAR(200) nullable
-   `unit_snapshot` VARCHAR(50)
-   `start_date` DATE
-   `end_date` DATE
-   `volume` DECIMAL(12,2)
-   `unit_price` DECIMAL(15,2)
-   `total_value` DECIMAL(15,2)
-   `status` VARCHAR(30)
-   `notes` TEXT nullable
-   `created_by` BIGINT FK → users
-   `approved_by` BIGINT nullable FK → users
-   `approved_at` TIMESTAMP nullable
-   `cancelled_by` BIGINT nullable FK → users
-   `cancelled_at` TIMESTAMP nullable
-   `cancellation_reason` TEXT nullable
-   timestamps, `deleted_at`

Aturan: - `mitra_id` harus sama dengan mitra pemilik `spk_id`. -
`end_date` tidak boleh lebih awal dari `start_date`. - `volume` harus
lebih besar dari nol. - `unit_price` tidak boleh negatif. -
`total_value` dihitung backend, bukan dipercaya dari request frontend. -
Snapshot disimpan saat transaksi dibuat dan diperbarui hanya melalui
proses revisi yang diaudit.

### 3.9 `users`, roles, permissions

Gunakan Laravel authentication. Untuk role/permission, gunakan
implementasi yang konsisten dan teruji (misalnya package role-permission
yang disetujui atau tabel internal). Hindari membuat sistem permission
ad hoc di banyak controller.

### 3.10 `audit_logs`

-   `id` BIGINT PK
-   `user_id` BIGINT nullable FK → users
-   `action` VARCHAR(50)
-   `entity_type` VARCHAR(100)
-   `entity_id` BIGINT
-   `old_values` JSON nullable
-   `new_values` JSON nullable
-   `ip_address` VARCHAR(45) nullable
-   `user_agent` TEXT nullable
-   `created_at` TIMESTAMP

Audit log bersifat append-only dari aplikasi. Jangan menyediakan tombol
edit/hapus audit log untuk pengguna biasa.

### 3.11 `system_settings`

-   `id` BIGINT PK
-   `key` VARCHAR(100) UNIQUE
-   `value` JSON atau TEXT
-   `description` VARCHAR(255) nullable
-   timestamps

Seed konfigurasi batas: 10 penugasan, Rp4.000.000, operator OR, periode
start_date, override false.

## 4. Index yang disarankan

-   `mitras(mitra_code)` UNIQUE
-   `mitras(district_id, status)`
-   `tasks(team_id, is_active)`
-   `task_assignments(mitra_id, start_date, status)`
-   `task_assignments(spk_id)`
-   `task_assignments(task_id, start_date)`
-   `task_assignments(status, start_date)`
-   `spks(mitra_id, period_start, period_end)`
-   `spks(spk_number)` UNIQUE
-   `budget_accounts(code)` UNIQUE

Index harus diverifikasi dengan query aktual dan `EXPLAIN`, bukan
ditambahkan tanpa kebutuhan.

## 5. Query rekap bulanan

Periode bulan ditentukan dari `start_date`, bukan rentang tanggal
pekerjaan.

Konsep filter:

``` sql
WHERE start_date >= :month_start
  AND start_date < :next_month_start
  AND status IN ('approved', 'active', 'completed')
```

Agregasi per mitra: - `COUNT(*)` sebagai jumlah penugasan. -
`SUM(total_value)` sebagai total honor. - Sisa tugas = `10 - count`. -
Sisa honor = `4000000 - sum`.

Jangan mengandalkan kolom total bulanan yang diinput manual.

## 6. Catatan integritas

-   Pastikan foreign key menggunakan tipe yang sama.
-   Gunakan transaksi database untuk pembuatan dan perubahan status yang
    memengaruhi batas.
-   Lock baris mitra sebelum membaca agregat dan menyimpan transaksi.
-   Bulk assignment memproses mitra dalam urutan ID konsisten.
-   Jangan menghapus master yang sudah direferensikan; gunakan status
    nonaktif.
-   Simpan tanggal/waktu dalam format konsisten dan tampilkan zona waktu
    Asia/Jakarta.
-   Tetapkan collation UTF-8 yang mendukung nama Indonesia.
