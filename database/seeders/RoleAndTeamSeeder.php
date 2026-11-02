<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleAndTeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Roles
        $roles = [
            [
                'name' => UserRole::SUPER_ADMIN->value,
                'display_name' => 'Super Admin',
                'description' => 'Mengatur seluruh sistem, konfigurasi, pengguna, dan audit log.',
            ],
            [
                'name' => UserRole::ADMIN->value,
                'display_name' => 'Admin',
                'description' => 'Mengelola master data, penugasan lintas tim, SPK, dan laporan.',
            ],
            [
                'name' => UserRole::OPERATOR_TIM->value,
                'display_name' => 'Operator Tim',
                'description' => 'Mengelola operasional penugasan sesuai tim yang ditugaskan.',
            ],
            [
                'name' => UserRole::PIMPINAN->value,
                'display_name' => 'Pimpinan',
                'description' => 'Melihat dashboard, rekap honor, dan laporan monitoring lintas tim.',
            ],
        ];

        $roleModels = [];
        foreach ($roles as $roleData) {
            $roleModels[$roleData['name']] = Role::firstOrCreate(
                ['name' => $roleData['name']],
                $roleData
            );
        }

        // 2. Teams
        $teams = [
            ['code' => 'PROD', 'name' => 'Produksi', 'description' => 'Tim Statistik Produksi'],
            ['code' => 'SOS', 'name' => 'Sosial', 'description' => 'Tim Statistik Sosial'],
            ['code' => 'TANI', 'name' => 'Pertanian', 'description' => 'Tim Statistik Pertanian'],
            ['code' => 'DIST', 'name' => 'Distribusi', 'description' => 'Tim Statistik Distribusi dan Jasa'],
            ['code' => 'IPDS', 'name' => 'IPDS', 'description' => 'Tim Integrasi Pengolahan dan Diseminasi Statistik'],
        ];

        $teamModels = [];
        foreach ($teams as $teamData) {
            $teamModels[$teamData['code']] = Team::firstOrCreate(
                ['code' => $teamData['code']],
                $teamData
            );
        }

        // 3. Initial Users
        $defaultPassword = Hash::make('password123');

        // Super Admin
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@bpsmojokerto.id'],
            [
                'name' => 'Super Administrator BPS',
                'password' => $defaultPassword,
                'phone' => '081234567890',
                'is_active' => true,
            ]
        );
        $superAdmin->roles()->syncWithoutDetaching([$roleModels[UserRole::SUPER_ADMIN->value]->id]);

        // Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@bpsmojokerto.id'],
            [
                'name' => 'Admin SIMATA',
                'password' => $defaultPassword,
                'phone' => '081234567891',
                'is_active' => true,
            ]
        );
        $admin->roles()->syncWithoutDetaching([$roleModels[UserRole::ADMIN->value]->id]);

        // Operator Tim Produksi
        $operator = User::firstOrCreate(
            ['email' => 'operator.produksi@bpsmojokerto.id'],
            [
                'name' => 'Operator Tim Produksi',
                'password' => $defaultPassword,
                'phone' => '081234567892',
                'is_active' => true,
            ]
        );
        $operator->roles()->syncWithoutDetaching([$roleModels[UserRole::OPERATOR_TIM->value]->id]);
        $operator->teams()->syncWithoutDetaching([$teamModels['PROD']->id]);

        // Pimpinan
        $pimpinan = User::firstOrCreate(
            ['email' => 'pimpinan@bpsmojokerto.id'],
            [
                'name' => 'Kepala BPS Mojokerto',
                'password' => $defaultPassword,
                'phone' => '081234567893',
                'is_active' => true,
            ]
        );
        $pimpinan->roles()->syncWithoutDetaching([$roleModels[UserRole::PIMPINAN->value]->id]);
    }
}
