<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $admin;
    protected Role $adminRole;
    protected Role $operatorRole;
    protected Team $team;

    protected function setUp(): void
    {
        parent::setUp();

        $superAdminRole = Role::create([
            'name' => UserRole::SUPER_ADMIN->value,
            'display_name' => 'Super Admin',
        ]);

        $this->adminRole = Role::create([
            'name' => UserRole::ADMIN->value,
            'display_name' => 'Admin',
        ]);

        $this->operatorRole = Role::create([
            'name' => UserRole::OPERATOR_TIM->value,
            'display_name' => 'Operator Tim',
        ]);

        $this->team = Team::create([
            'code' => 'PROD',
            'name' => 'Produksi',
        ]);

        $this->superAdmin = User::factory()->create();
        $this->superAdmin->roles()->attach($superAdminRole->id);

        $this->admin = User::factory()->create();
        $this->admin->roles()->attach($this->adminRole->id);
    }

    public function test_super_admin_can_list_users(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/users');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_super_admin_can_create_new_user(): void
    {
        $payload = [
            'name' => 'Budi Operator BPS',
            'email' => 'budi.operator@bpsmojokerto.id',
            'password' => 'password123',
            'phone' => '081234567899',
            'role_ids' => [$this->operatorRole->id],
            'team_ids' => [$this->team->id],
            'is_active' => true,
        ];

        $response = $this->actingAs($this->superAdmin)
            ->postJson('/api/users', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Budi Operator BPS')
            ->assertJsonPath('data.email', 'budi.operator@bpsmojokerto.id');

        $this->assertDatabaseHas('users', [
            'email' => 'budi.operator@bpsmojokerto.id',
        ]);
    }

    public function test_super_admin_can_update_user(): void
    {
        $user = User::factory()->create(['name' => 'Original Name']);
        $user->roles()->attach($this->operatorRole->id);

        $payload = [
            'name' => 'Updated Name',
            'email' => $user->email,
            'phone' => '089999999999',
            'role_ids' => [$this->adminRole->id],
            'is_active' => true,
        ];

        $response = $this->actingAs($this->superAdmin)
            ->putJson("/api/users/{$user->id}", $payload);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Name');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_user_can_be_deactivated(): void
    {
        $user = User::factory()->create(['is_active' => true]);
        $user->roles()->attach($this->operatorRole->id);

        $response = $this->actingAs($this->superAdmin)
            ->postJson("/api/users/{$user->id}/deactivate");

        $response->assertOk()
            ->assertJsonPath('data.is_active', false);
    }
}
