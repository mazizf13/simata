<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\BudgetAccount;
use App\Models\Role;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected Team $team;
    protected BudgetAccount $budgetAccount;

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

        $this->team = Team::create([
            'code' => 'PROD',
            'name' => 'Produksi',
            'is_active' => true,
        ]);

        $this->budgetAccount = BudgetAccount::create([
            'code' => '8130.BMA.007.005.521213',
            'name' => 'Honor Survei Produksi',
            'is_active' => true,
        ]);
    }

    public function test_can_list_tasks_with_pagination(): void
    {
        Task::factory()->count(10)->create([
            'team_id' => $this->team->id,
            'default_budget_account_id' => $this->budgetAccount->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/tasks?per_page=5');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.total', 10);
    }

    public function test_can_create_task_with_valid_data(): void
    {
        $payload = [
            'code' => 'SURV-UBINAN-2026',
            'name' => 'Survei Ubinan Padi 2026',
            'team_id' => $this->team->id,
            'default_unit' => 'Dokumen',
            'default_rate' => 60000,
            'default_budget_account_id' => $this->budgetAccount->id,
            'description' => 'Pendataan sampel ubinan komoditas padi',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/tasks', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', 'SURV-UBINAN-2026')
            ->assertJsonPath('data.team.name', 'Produksi');

        $this->assertDatabaseHas('tasks', [
            'code' => 'SURV-UBINAN-2026',
            'default_rate' => 60000,
        ]);
    }

    public function test_cannot_create_task_without_team(): void
    {
        $payload = [
            'code' => 'TASK-NO-TEAM',
            'name' => 'Task Tanpa Tim',
            'team_id' => null, // Required
            'default_unit' => 'Dokumen',
            'default_rate' => 50000,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/tasks', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['team_id']);
    }

    public function test_cannot_create_task_with_duplicate_code(): void
    {
        Task::create([
            'code' => 'CODE-EXISTS',
            'name' => 'Survei Pertama',
            'team_id' => $this->team->id,
            'default_unit' => 'Dokumen',
            'default_rate' => 45000,
            'is_active' => true,
        ]);

        $payload = [
            'code' => 'CODE-EXISTS',
            'name' => 'Survei Kedua',
            'team_id' => $this->team->id,
            'default_unit' => 'Dokumen',
            'default_rate' => 50000,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/tasks', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    public function test_can_deactivate_task_and_it_is_excluded_from_active_list(): void
    {
        $activeTask = Task::create([
            'code' => 'TASK-ACTIVE',
            'name' => 'Tugas Aktif',
            'team_id' => $this->team->id,
            'default_unit' => 'Dokumen',
            'default_rate' => 40000,
            'is_active' => true,
        ]);

        $taskToDeactivate = Task::create([
            'code' => 'TASK-INACTIVE',
            'name' => 'Tugas Segera Nonaktif',
            'team_id' => $this->team->id,
            'default_unit' => 'Dokumen',
            'default_rate' => 40000,
            'is_active' => true,
        ]);

        // Deactivate via API
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/tasks/{$taskToDeactivate->id}");

        $response->assertOk()
            ->assertJsonPath('data.is_active', false);

        // Verify active list endpoint
        $activeResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/tasks/active');

        $activeResponse->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.code', 'TASK-ACTIVE');
    }
}
