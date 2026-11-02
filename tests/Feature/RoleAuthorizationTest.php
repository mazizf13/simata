<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RoleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $admin;
    protected User $operator;
    protected User $pimpinan;

    protected function setUp(): void
    {
        parent::setUp();

        $roleSuper = Role::create(['name' => UserRole::SUPER_ADMIN->value, 'display_name' => 'Super Admin']);
        $roleAdmin = Role::create(['name' => UserRole::ADMIN->value, 'display_name' => 'Admin']);
        $roleOperator = Role::create(['name' => UserRole::OPERATOR_TIM->value, 'display_name' => 'Operator Tim']);
        $rolePimpinan = Role::create(['name' => UserRole::PIMPINAN->value, 'display_name' => 'Pimpinan']);

        $password = Hash::make('password123');

        $this->superAdmin = User::create(['name' => 'Super', 'email' => 'super@bps.id', 'password' => $password, 'is_active' => true]);
        $this->superAdmin->roles()->attach($roleSuper->id);

        $this->admin = User::create(['name' => 'Admin', 'email' => 'admin@bps.id', 'password' => $password, 'is_active' => true]);
        $this->admin->roles()->attach($roleAdmin->id);

        $this->operator = User::create(['name' => 'Operator', 'email' => 'operator@bps.id', 'password' => $password, 'is_active' => true]);
        $this->operator->roles()->attach($roleOperator->id);

        $this->pimpinan = User::create(['name' => 'Pimpinan', 'email' => 'pimpinan@bps.id', 'password' => $password, 'is_active' => true]);
        $this->pimpinan->roles()->attach($rolePimpinan->id);
    }

    public function test_super_admin_can_access_super_admin_only_route(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/rbac/super-admin-only');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_admin_cannot_access_super_admin_only_route(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/rbac/super-admin-only');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error_code' => 'FORBIDDEN_ROLE',
            ]);
    }

    public function test_admin_can_access_admin_route(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/rbac/admin-access');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_operator_cannot_access_admin_route(): void
    {
        $response = $this->actingAs($this->operator, 'sanctum')
            ->getJson('/api/rbac/admin-access');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error_code' => 'FORBIDDEN_ROLE',
            ]);
    }

    public function test_operator_can_access_operator_route(): void
    {
        $response = $this->actingAs($this->operator, 'sanctum')
            ->getJson('/api/rbac/operator-access');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_pimpinan_can_access_pimpinan_route(): void
    {
        $response = $this->actingAs($this->pimpinan, 'sanctum')
            ->getJson('/api/rbac/pimpinan-access');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_super_admin_bypasses_all_role_checks(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/rbac/operator-access');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }
}
