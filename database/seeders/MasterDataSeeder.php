<?php

namespace Database\Seeders;

use App\Models\BudgetAccount;
use App\Models\District;
use App\Models\Mitra;
use App\Models\Task;
use App\Models\Team;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. 18 Kecamatan Resmi Kabupaten Mojokerto (Kode BPS 3516)
        $districts = [
            ['code' => '3516010', 'name' => 'Jatirejo'],
            ['code' => '3516020', 'name' => 'Gondang'],
            ['code' => '3516030', 'name' => 'Pacet'],
            ['code' => '3516040', 'name' => 'Trawas'],
            ['code' => '3516050', 'name' => 'Ngoro'],
            ['code' => '3516060', 'name' => 'Pungging'],
            ['code' => '3516070', 'name' => 'Kutorejo'],
            ['code' => '3516080', 'name' => 'Mojosari'],
            ['code' => '3516090', 'name' => 'Bangsal'],
            ['code' => '3516091', 'name' => 'Mojoanyar'],
            ['code' => '3516100', 'name' => 'Dlanggu'],
            ['code' => '3516110', 'name' => 'Puri'],
            ['code' => '3516120', 'name' => 'Trowulan'],
            ['code' => '3516130', 'name' => 'Sooko'],
            ['code' => '3516140', 'name' => 'Gedeg'],
            ['code' => '3516150', 'name' => 'Kemlagi'],
            ['code' => '3516160', 'name' => 'Jetis'],
            ['code' => '3516170', 'name' => 'Dawarblandong'],
        ];

        $districtMap = [];
        foreach ($districts as $d) {
            $model = District::firstOrCreate(
                ['code' => $d['code']],
                ['name' => $d['name'], 'is_active' => true]
            );
            $districtMap[$d['code']] = $model;
        }

        // 2. Akun Anggaran (Budget Accounts)
        $accounts = [
            [
                'code' => '8130.BMA.007.005.521213',
                'name' => 'Honor Sensus/Survei Statistik Produksi',
                'description' => 'Akun pembebanan kegiatan sensus dan survei tim produksi BPS',
            ],
            [
                'code' => '2903.BMA.009.005.521213',
                'name' => 'Honor Sensus/Survei Statistik Sosial',
                'description' => 'Akun pembebanan kegiatan sensus dan survei tim sosial BPS',
            ],
            [
                'code' => '2904.BMA.008.005.521213',
                'name' => 'Honor Sensus/Survei Statistik Pertanian',
                'description' => 'Akun pembebanan kegiatan sensus dan survei tim pertanian BPS',
            ],
            [
                'code' => '2905.BMA.006.005.521213',
                'name' => 'Honor Sensus/Survei Statistik Distribusi',
                'description' => 'Akun pembebanan kegiatan sensus dan survei tim distribusi BPS',
            ],
            [
                'code' => '2906.BMA.005.005.521213',
                'name' => 'Honor Pengolahan & Diseminasi IPDS',
                'description' => 'Akun pembebanan entri dan diseminasi data tim IPDS',
            ],
        ];

        $accountMap = [];
        foreach ($accounts as $acc) {
            $accountMap[$acc['code']] = BudgetAccount::firstOrCreate(
                ['code' => $acc['code']],
                $acc
            );
        }

        // 3. Master Tugas (Katalog Kegiatan)
        $teams = Team::all()->keyBy('code');

        $tasks = [
            [
                'code' => 'TASK-PROD-01',
                'team_id' => $teams['PROD']->id,
                'name' => 'Survei Industri Besar Sedang (IBS)',
                'default_unit' => 'Dokumen',
                'default_rate' => 65000.00,
                'default_budget_account_id' => $accountMap['8130.BMA.007.005.521213']->id,
                'description' => 'Pencacahan perusahaan industri pengolahan bulanan',
                'is_active' => true,
            ],
            [
                'code' => 'TASK-PROD-02',
                'team_id' => $teams['PROD']->id,
                'name' => 'Survei Ubinan Tanaman Pangan',
                'default_unit' => 'Plot',
                'default_rate' => 150000.00,
                'default_budget_account_id' => $accountMap['8130.BMA.007.005.521213']->id,
                'description' => 'Pengukuran produktivitas panen padi dan palawija',
                'is_active' => true,
            ],
            [
                'code' => 'TASK-SOS-01',
                'team_id' => $teams['SOS']->id,
                'name' => 'Survei Sosial Ekonomi Nasional (SUSENAS)',
                'default_unit' => 'Rumah Tangga',
                'default_rate' => 85000.00,
                'default_budget_account_id' => $accountMap['2903.BMA.009.005.521213']->id,
                'description' => 'Pencacahan modul konsumsi dan kor rumah tangga',
                'is_active' => true,
            ],
            [
                'code' => 'TASK-SOS-02',
                'team_id' => $teams['SOS']->id,
                'name' => 'Survei Angkatan Kerja Nasional (SAKERNAS)',
                'default_unit' => 'Rumah Tangga',
                'default_rate' => 75000.00,
                'default_budget_account_id' => $accountMap['2903.BMA.009.005.521213']->id,
                'description' => 'Pencacahan ketenagakerjaan dan pengangguran',
                'is_active' => true,
            ],
            [
                'code' => 'TASK-TANI-01',
                'team_id' => $teams['TANI']->id,
                'name' => 'Survei Komoditas Hortikultura Potensial',
                'default_unit' => 'Segmen',
                'default_rate' => 60000.00,
                'default_budget_account_id' => $accountMap['2904.BMA.008.005.521213']->id,
                'description' => 'Pendataan luas lahan dan produksi buah/sayur',
                'is_active' => true,
            ],
            [
                'code' => 'TASK-DIST-01',
                'team_id' => $teams['DIST']->id,
                'name' => 'Survei Harga Perdagangan Besar (SHPB)',
                'default_unit' => 'Kuesioner',
                'default_rate' => 55000.00,
                'default_budget_account_id' => $accountMap['2905.BMA.006.005.521213']->id,
                'description' => 'Pemantauan indeks harga grosir dan distribusi',
                'is_active' => true,
            ],
            [
                'code' => 'TASK-IPDS-01',
                'team_id' => $teams['IPDS']->id,
                'name' => 'Entri dan Validasi Dokumen Survei',
                'default_unit' => 'Dokumen',
                'default_rate' => 5000.00,
                'default_budget_account_id' => $accountMap['2906.BMA.005.005.521213']->id,
                'description' => 'Pengolahan dan pemasukan data hasil sensus/survei',
                'is_active' => true,
            ],
        ];

        foreach ($tasks as $taskData) {
            Task::firstOrCreate(['code' => $taskData['code']], $taskData);
        }

        // 4. Initial Master Mitra
        $mitras = [
            [
                'mitra_code' => 'MITRA-3516-001',
                'name' => 'Ahmad Fauzi',
                'address' => 'Jl. Kartini No. 12, RT 02 RW 01, Pacet',
                'district_id' => $districtMap['3516030']->id,
                'phone' => '081234567001',
                'email' => 'ahmad.fauzi@gmail.com',
                'occupation' => 'Pencacah Lapangan',
                'position' => 'Mitra Statistik Utama',
                'status' => 'active',
                'notes' => 'Berpengalaman dalam survei pertanian dan susenas.',
            ],
            [
                'mitra_code' => 'MITRA-3516-002',
                'name' => 'Siti Nurhaliza',
                'address' => 'Dusun Sukosari, RT 01 RW 03, Trawas',
                'district_id' => $districtMap['3516040']->id,
                'phone' => '081234567002',
                'email' => 'siti.nurhaliza@gmail.com',
                'occupation' => 'Pencacah Lapangan',
                'position' => 'Mitra Statistik',
                'status' => 'active',
                'notes' => 'Fasilitator pendataan wilayah Trawas.',
            ],
            [
                'mitra_code' => 'MITRA-3516-003',
                'name' => 'Bambang Prasetyo',
                'address' => 'Jl. Gajah Mada No. 45, Mojosari',
                'district_id' => $districtMap['3516080']->id,
                'phone' => '081234567003',
                'email' => 'bambang.prasetyo@gmail.com',
                'occupation' => 'Pengawas Lapangan (PML)',
                'position' => 'Mitra Pengawas',
                'status' => 'active',
                'notes' => 'Koordinator tim lapangan wilayah Mojosari.',
            ],
            [
                'mitra_code' => 'MITRA-3516-004',
                'name' => 'Dewi Lestari',
                'address' => 'Jl. Raya Brangkal No. 8, Sooko',
                'district_id' => $districtMap['3516130']->id,
                'phone' => '081234567004',
                'email' => 'dewi.lestari@gmail.com',
                'occupation' => 'Pencacah Lapangan',
                'position' => 'Mitra Statistik',
                'status' => 'active',
                'notes' => 'Pencacah aktif survei sosial ekonomi.',
            ],
            [
                'mitra_code' => 'MITRA-3516-005',
                'name' => 'Rian Hidayat',
                'address' => 'Desa Tangunan, Puri',
                'district_id' => $districtMap['3516110']->id,
                'phone' => '081234567005',
                'email' => 'rian.hidayat@gmail.com',
                'occupation' => 'Operator Pengolahan',
                'position' => 'Mitra IPDS',
                'status' => 'active',
                'notes' => 'Terampil dalam aplikasi entri data BPS.',
            ],
        ];

        foreach ($mitras as $mitraData) {
            Mitra::firstOrCreate(['mitra_code' => $mitraData['mitra_code']], $mitraData);
        }
    }
}
