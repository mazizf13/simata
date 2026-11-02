<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\District;
use App\Models\Mitra;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MitraTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected District $district;

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

        $this->district = District::create([
            'code' => '3516010',
            'name' => 'Jatirejo',
            'regency_code' => '3516',
            'is_active' => true,
        ]);
    }

    public function test_can_list_mitras_with_pagination(): void
    {
        Mitra::factory()->count(20)->create([
            'district_id' => $this->district->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/mitras?per_page=10');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 20)
            ->assertJsonCount(10, 'data');
    }

    public function test_can_filter_mitras_by_district_and_search_query(): void
    {
        $district2 = District::create([
            'code' => '3516020',
            'name' => 'Gondang',
            'regency_code' => '3516',
            'is_active' => true,
        ]);

        Mitra::create([
            'mitra_code' => '3516-001',
            'name' => 'Ahmad Subarjo',
            'address' => 'Jl. Jatirejo No. 1',
            'district_id' => $this->district->id,
            'phone' => '081234567891',
            'status' => 'active',
        ]);

        Mitra::create([
            'mitra_code' => '3516-002',
            'name' => 'Budi Gondang',
            'address' => 'Jl. Gondang No. 2',
            'district_id' => $district2->id,
            'phone' => '081234567892',
            'status' => 'active',
        ]);

        // Filter by district
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/mitras?district_id=' . $this->district->id);

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Ahmad Subarjo');

        // Search by name
        $responseSearch = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/mitras?search=Budi');

        $responseSearch->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Budi Gondang');
    }

    public function test_can_create_new_mitra_with_valid_data(): void
    {
        $payload = [
            'mitra_code' => '3516-2026-999',
            'name' => 'Siti Aminah',
            'address' => 'Dusun Sumberagung, RT 02 RW 01',
            'district_id' => $this->district->id,
            'phone' => '081987654321',
            'email' => 'siti@example.com',
            'occupation' => 'Wiraswasta',
            'status' => 'active',
            'notes' => 'Mitra berpengalaman survei pertanian',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/mitras', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.mitra_code', '3516-2026-999')
            ->assertJsonPath('data.name', 'Siti Aminah');

        $this->assertDatabaseHas('mitras', [
            'mitra_code' => '3516-2026-999',
            'name' => 'Siti Aminah',
            'status' => 'active',
        ]);
    }

    public function test_cannot_create_mitra_with_duplicate_code(): void
    {
        Mitra::create([
            'mitra_code' => 'CODE-DUPLICATE',
            'name' => 'Mitra Pertama',
            'address' => 'Alamat',
            'district_id' => $this->district->id,
            'phone' => '081234567891',
            'status' => 'active',
        ]);

        $payload = [
            'mitra_code' => 'CODE-DUPLICATE',
            'name' => 'Mitra Kedua',
            'address' => 'Alamat 2',
            'district_id' => $this->district->id,
            'phone' => '081234567892',
            'status' => 'active',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/mitras', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['mitra_code']);
    }

    public function test_mitras_can_share_identical_names(): void
    {
        // Name must not be unique
        Mitra::create([
            'mitra_code' => 'CODE-1',
            'name' => 'Budi Santoso',
            'address' => 'Alamat 1',
            'district_id' => $this->district->id,
            'phone' => '081234567891',
            'status' => 'active',
        ]);

        $payload = [
            'mitra_code' => 'CODE-2',
            'name' => 'Budi Santoso', // Identical name
            'address' => 'Alamat 2',
            'district_id' => $this->district->id,
            'phone' => '081234567892',
            'status' => 'active',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/mitras', $payload);

        $response->assertCreated();
        $this->assertEquals(2, Mitra::where('name', 'Budi Santoso')->count());
    }

    public function test_cannot_create_mitra_with_invalid_district(): void
    {
        $payload = [
            'mitra_code' => 'CODE-INVALID-DIST',
            'name' => 'Test District',
            'address' => 'Alamat',
            'district_id' => 999999, // Non-existent district
            'phone' => '081234567899',
            'status' => 'active',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/mitras', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['district_id']);
    }

    public function test_can_update_existing_mitra(): void
    {
        $mitra = Mitra::create([
            'mitra_code' => 'CODE-UPDATE',
            'name' => 'Nama Awal',
            'address' => 'Alamat Awal',
            'district_id' => $this->district->id,
            'phone' => '081234567890',
            'status' => 'active',
        ]);

        $payload = [
            'mitra_code' => 'CODE-UPDATE',
            'name' => 'Nama Diperbarui',
            'address' => 'Alamat Baru',
            'district_id' => $this->district->id,
            'phone' => '081234567899',
            'status' => 'active',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/mitras/{$mitra->id}", $payload);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Nama Diperbarui');

        $this->assertDatabaseHas('mitras', [
            'id' => $mitra->id,
            'name' => 'Nama Diperbarui',
        ]);
    }

    public function test_can_deactivate_mitra(): void
    {
        $mitra = Mitra::create([
            'mitra_code' => 'CODE-DEACTIVATE',
            'name' => 'Mitra Deaktivasi',
            'address' => 'Alamat',
            'district_id' => $this->district->id,
            'phone' => '081234567890',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/mitras/{$mitra->id}");

        $response->assertOk()
            ->assertJsonPath('data.status', 'inactive');

        $this->assertDatabaseHas('mitras', [
            'id' => $mitra->id,
            'status' => 'inactive',
        ]);
    }

    public function test_soft_delete_preserves_historical_data(): void
    {
        $mitra = Mitra::create([
            'mitra_code' => 'CODE-SOFT-DEL',
            'name' => 'Mitra Soft Delete',
            'address' => 'Alamat',
            'district_id' => $this->district->id,
            'phone' => '081234567890',
            'status' => 'active',
        ]);

        $mitra->delete();

        $this->assertSoftDeleted('mitras', [
            'id' => $mitra->id,
        ]);
    }
}
