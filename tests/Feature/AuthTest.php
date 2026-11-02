<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Role $adminRole;
    protected Team $teamProduksi;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminRole = Role::create([
            'name' => UserRole::ADMIN->value,
            'display_name' => 'Admin',
            'description' => 'Administrator SIMATA',
        ]);

        $this->teamProduksi = Team::create([
            'code' => 'PROD',
            'name' => 'Produksi',
            'description' => 'Tim Produksi',
        ]);

        $this->user = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@bpsmojokerto.id',
            'password' => Hash::make('secret123'),
            'phone' => '081234567890',
            'is_active' => true,
        ]);

        $this->user->roles()->attach($this->adminRole->id);
        $this->user->teams()->attach($this->teamProduksi->id);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'budi@bpsmojokerto.id',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'email' => 'budi@bpsmojokerto.id',
                        'name' => 'Budi Santoso',
                        'primary_role' => 'admin',
                    ],
                ],
            ]);

        $this->assertAuthenticatedAs($this->user);
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'budi@bpsmojokerto.id',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'error_code' => 'VALIDATION_ERROR',
            ]);

        $this->assertGuest();
    }

    public function test_inactive_user_cannot_login(): void
    {
        $this->user->update(['is_active' => false]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'budi@bpsmojokerto.id',
            'password' => 'secret123',
        ]);

        $response->assertStatus(422);
        $this->assertGuest();
    }

    public function test_authenticated_user_can_fetch_profile(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $this->user->id,
                        'email' => 'budi@bpsmojokerto.id',
                        'is_active' => true,
                    ],
                ],
            ]);
    }

    public function test_unauthenticated_user_cannot_fetch_profile(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'error_code' => 'UNAUTHENTICATED',
            ]);
    }

    public function test_user_can_logout(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }
}
