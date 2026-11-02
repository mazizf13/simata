<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\BudgetAccount;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetAccountTest extends TestCase
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

    public function test_can_store_and_retrieve_complex_budget_account_string_code(): void
    {
        $code = '8130.BMA.007.005.521213';

        $payload = [
            'code' => $code,
            'name' => 'Honor Pengolahan Survei Khusus',
            'description' => 'Akun DIPA BPS Kabupaten Mojokerto',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/budget-accounts', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', $code);

        $this->assertDatabaseHas('budget_accounts', [
            'code' => $code,
        ]);

        $account = BudgetAccount::where('code', $code)->first();
        $this->assertSame($code, $account->code);
    }

    public function test_cannot_create_budget_account_with_duplicate_code(): void
    {
        BudgetAccount::create([
            'code' => '2903.BMA.009.005.521213',
            'name' => 'Akun Pertama',
            'is_active' => true,
        ]);

        $payload = [
            'code' => '2903.BMA.009.005.521213',
            'name' => 'Akun Kedua',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/budget-accounts', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    public function test_can_deactivate_budget_account(): void
    {
        $account = BudgetAccount::create([
            'code' => 'CODE-TO-DEACTIVATE',
            'name' => 'Akun Dinonaktifkan',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/budget-accounts/{$account->id}");

        $response->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('budget_accounts', [
            'id' => $account->id,
            'is_active' => false,
        ]);
    }
}
