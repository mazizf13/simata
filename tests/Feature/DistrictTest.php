<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\District;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DistrictTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create([
            'name' => UserRole::ADMIN->value,
            'display_name' => 'Admin',
        ]);

        $this->adminUser = User::factory()->create([
            'is_active' => true,
        ]);
        $this->adminUser->roles()->attach($role->id);
    }

    public function test_master_data_seeder_populates_exactly_18_official_districts_of_mojokerto_3516(): void
    {
        $this->seed(\Database\Seeders\DatabaseSeeder::class);

        $districts = District::all();
        $this->assertCount(18, $districts);

        $officialDistrictCodes = [
            '3516010' => 'Jatirejo',
            '3516020' => 'Gondang',
            '3516030' => 'Pacet',
            '3516040' => 'Trawas',
            '3516050' => 'Ngoro',
            '3516060' => 'Pungging',
            '3516070' => 'Kutorejo',
            '3516080' => 'Mojosari',
            '3516090' => 'Bangsal',
            '3516091' => 'Mojoanyar',
            '3516100' => 'Dlanggu',
            '3516110' => 'Puri',
            '3516120' => 'Trowulan',
            '3516130' => 'Sooko',
            '3516140' => 'Gedeg',
            '3516150' => 'Kemlagi',
            '3516160' => 'Jetis',
            '3516170' => 'Dawarblandong',
        ];

        foreach ($officialDistrictCodes as $code => $name) {
            $district = $districts->firstWhere('code', $code);
            $this->assertNotNull($district, "District with code {$code} must exist.");
            $this->assertSame($name, $district->name);
        }
    }

    public function test_can_retrieve_active_districts_via_api(): void
    {
        District::create([
            'code' => '3516010',
            'name' => 'Jatirejo',
            'regency_code' => '3516',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/districts/active');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.code', '3516010');
    }
}
