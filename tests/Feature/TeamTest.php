<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamTest extends TestCase
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

    public function test_can_list_teams(): void
    {
        Team::create([
            'code' => 'PROD',
            'name' => 'Statistik Produksi',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/teams');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.code', 'PROD');
    }

    public function test_can_create_new_team(): void
    {
        $payload = [
            'code' => 'NERWIL',
            'name' => 'Neraca Wilayah dan Analisis Statistik',
            'description' => 'Tim penyusunan PDRB dan tabel I-O',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/teams', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', 'NERWIL');

        $this->assertDatabaseHas('teams', [
            'code' => 'NERWIL',
        ]);
    }

    public function test_cannot_create_team_with_duplicate_code(): void
    {
        Team::create([
            'code' => 'DUPLICATE',
            'name' => 'Tim Satu',
            'is_active' => true,
        ]);

        $payload = [
            'code' => 'DUPLICATE',
            'name' => 'Tim Dua',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/teams', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    public function test_can_deactivate_team(): void
    {
        $team = Team::create([
            'code' => 'DEACT',
            'name' => 'Tim Nonaktif Segera',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/teams/{$team->id}");

        $response->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('teams', [
            'id' => $team->id,
            'is_active' => false,
        ]);
    }
}
