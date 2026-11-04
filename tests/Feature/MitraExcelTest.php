<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\District;
use App\Models\Mitra;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class MitraExcelTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected District $district;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create([
            'name' => UserRole::ADMIN->value,
            'display_name' => 'Admin',
        ]);

        $this->district = District::create([
            'code' => '010',
            'name' => 'Jatirejo',
            'regency' => 'Kabupaten Mojokerto',
        ]);

        $this->admin = User::factory()->create();
        $this->admin->roles()->attach($role->id);
    }

    public function test_can_download_mitra_template(): void
    {
        $response = $this->actingAs($this->admin)
            ->get('/api/mitras/template');

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_can_export_mitras_to_excel(): void
    {
        Mitra::create([
            'mitra_code' => '351624100001',
            'name' => 'Test Mitra Export',
            'district_id' => $this->district->id,
            'phone' => '081234567890',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->admin)
            ->get('/api/mitras/export');

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_can_import_mitras_from_csv(): void
    {
        $csvContent = "No,Kode Mitra,Nama Lengkap,Kode Kecamatan,Alamat,HP,Email,Pekerjaan,Posisi,Status,Catatan\n";
        $csvContent .= "1,351627010099,Mitra Baru 2027,010,Jl. Test No 1,081234567899,test2027@gmail.com,Mitra Statistik,PPL,active,Mitra 2027\n";

        $file = UploadedFile::fake()->createWithContent('mitras.csv', $csvContent);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/mitras/import', [
                'file' => $file,
                'update_existing' => true,
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.imported', 1);

        $this->assertDatabaseHas('mitras', [
            'mitra_code' => '351627010099',
            'name' => 'Mitra Baru 2027',
        ]);
    }
}
