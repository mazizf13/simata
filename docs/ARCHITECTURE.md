# Architecture --- SIMATA

## 1. Arsitektur tingkat tinggi

SIMATA menggunakan satu repository Laravel dengan frontend React + Vite.
Laravel melayani API, autentikasi, business logic, dan koneksi MySQL.
React menjadi SPA untuk antarmuka pengguna.

``` mermaid
flowchart TD
    U[Browser User] --> FE[React + Vite]
    FE --> API[Laravel API]
    API --> AUTH[Authentication / Authorization]
    API --> SVC[Application Services]
    SVC --> DB[(MySQL)]
    SVC --> FILE[Import / Export Storage]
    SVC --> AUDIT[Audit Log]
```

## 2. Stack

  Lapisan            Teknologi
  ------------------ ---------------------------------------------------
  Backend            Laravel
  Frontend           React + Vite
  UI                 `@idds/react`
  Styling            Tailwind CSS sesuai kompatibilitas IDDS
  Icons              `@tabler/icons-react`
  Database           MySQL
  Authentication     Laravel session/Sanctum sesuai deployment
  HTTP client        Axios
  Server state       TanStack Query
  Form               React Hook Form + Zod
  Date utility       date-fns
  Spreadsheet        Laravel Excel atau library setara yang kompatibel
  Testing backend    PHPUnit/Pest
  Testing frontend   Vitest + React Testing Library

Versi package harus dipilih setelah memeriksa versi Laravel, PHP, React,
Tailwind, dan peer dependencies `@idds/react`. Jangan mengasumsikan
kompatibilitas versi tanpa instalasi dan build test.

## 3. Repository structure

``` text
simata-bps/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   ├── Requests/
│   │   ├── Resources/
│   │   └── Middleware/
│   ├── Models/
│   ├── Policies/
│   ├── Services/
│   ├── Actions/
│   └── Enums/
├── bootstrap/
├── config/
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── resources/
│   ├── js/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.jsx
│   └── css/
├── routes/
│   ├── api.php
│   └── web.php
├── tests/
│   ├── Feature/
│   └── Unit/
├── public/
├── docs/
└── vite.config.js
```

## 4. Backend design

Gunakan pola:
`Route → Middleware → Form Request → Controller → Service/Action → Model/Query → API Resource`.

-   Controller tipis: menerima request, memanggil service, mengembalikan
    resource.
-   Form Request: validasi bentuk dan tipe input.
-   Service/Action: business rules dan orkestrasi transaksi.
-   Model: relasi, casts, scopes, dan perilaku entitas.
-   Policy: otorisasi resource.
-   API Resource: bentuk response yang konsisten.
-   Enum/constants: status dan kode yang tidak boleh tersebar sebagai
    magic string.

Business logic batas honor/tugas harus berada pada service backend dan
diuji terpisah.

## 5. Frontend design

Gunakan feature-based architecture: - `features/mitras` -
`features/teams` - `features/tasks` - `features/assignments` -
`features/spks` - `features/reports` - `features/dashboard`

Komponen lintas fitur ditempatkan di `components/`. Hindari membuat satu
file komponen raksasa untuk seluruh aplikasi.

Gunakan TanStack Query untuk server state, React Hook Form untuk form
state, dan Zod untuk schema frontend. Validasi frontend hanya untuk
pengalaman pengguna; backend tetap sumber kebenaran.

## 6. API dan autentikasi

Jika frontend dan backend berada pada origin yang sama, pertimbangkan
session authentication dengan proteksi CSRF atau Laravel Sanctum
stateful SPA. Hindari menyimpan token sensitif di localStorage tanpa
analisis keamanan.

Untuk cPanel, satu origin/domain lebih sederhana: - Laravel berada pada
root aplikasi. - Build React/Vite menjadi asset statis yang dilayani
Laravel. - API berada di `/api`. - Hindari deployment frontend dan
backend pada subdomain terpisah kecuali ada alasan teknis.

## 7. Deployment cPanel

Target deployment harus diverifikasi dengan provider hosting: - Versi
PHP sesuai versi Laravel yang dipilih. - Extension PHP yang dibutuhkan
tersedia. - Node.js/build environment tersedia atau asset dapat dibuild
lokal/CI. - Document root diarahkan ke folder `public`. - `.env` tidak
dapat diakses publik. - Storage dan cache memiliki permission yang
tepat. - Database MySQL tersedia. - Scheduler/cron tersedia jika kelak
dibutuhkan. - Backup database dan file import tersedia.

Jangan menaruh seluruh source Laravel pada public_html. Jika struktur
hosting membatasi document root, gunakan pola deployment aman yang
memisahkan source dan public directory.

## 8. Prinsip engineering

-   Reusable component tanpa abstraksi berlebihan.
-   Hindari duplikasi business logic.
-   Hindari query N+1; gunakan eager loading.
-   Gunakan pagination server-side.
-   Gunakan transaction untuk operasi multi-record.
-   Jangan percaya nilai total dari browser.
-   Gunakan DTO/action bila membantu kejelasan, bukan sekadar menambah
    lapisan.
-   Tulis test untuk business rules sebelum UI.
-   Jangan menambah package tanpa kebutuhan yang jelas.
