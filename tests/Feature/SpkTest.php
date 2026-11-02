<?php

namespace Tests\Feature;

use App\Enums\AssignmentStatus;
use App\Enums\SpkStatus;
use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\BudgetAccount;
use App\Models\District;
use App\Models\Mitra;
use App\Models\Role;
use App\Models\Spk;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SpkTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $operatorUser;
    protected User $pimpinanUser;
    protected District $district;
    protected Mitra $mitraA;
    protected Mitra $mitraB;
    protected Task $task;
    protected BudgetAccount $budgetAccount;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create([
            'name' => UserRole::ADMIN->value,
            'display_name' => 'Admin',
        ]);
        $operatorRole = Role::create([
            'name' => UserRole::OPERATOR_TIM->value,
            'display_name' => 'Operator Tim',
        ]);
        $pimpinanRole = Role::create([
            'name' => UserRole::PIMPINAN->value,
            'display_name' => 'Pimpinan',
        ]);

        $this->adminUser = User::factory()->create(['is_active' => true]);
        $this->adminUser->roles()->attach($adminRole->id);

        $this->operatorUser = User::factory()->create(['is_active' => true]);
        $this->operatorUser->roles()->attach($operatorRole->id);

        $this->pimpinanUser = User::factory()->create(['is_active' => true]);
        $this->pimpinanUser->roles()->attach($pimpinanRole->id);

        $team = Team::create([
            'code' => 'PROD',
            'name' => 'Tim Produksi',
            'is_active' => true,
        ]);

        $this->district = District::create([
            'code' => '3516010',
            'name' => 'Jatirejo',
            'is_active' => true,
        ]);

        $this->mitraA = Mitra::create([
            'mitra_code' => 'MITRA-3516-0001',
            'name' => 'Budi Santoso',
            'district_id' => $this->district->id,
            'status' => 'active',
            'phone' => '081234567890',
        ]);

        $this->mitraB = Mitra::create([
            'mitra_code' => 'MITRA-3516-0002',
            'name' => 'Siti Aminah',
            'district_id' => $this->district->id,
            'status' => 'active',
            'phone' => '081234567891',
        ]);

        $this->budgetAccount = BudgetAccount::create([
            'code' => '8130.BMA.007.005.521213',
            'name' => 'Honor Output Kegiatan',
            'is_active' => true,
        ]);

        $this->task = Task::create([
            'task_code' => 'TASK-001',
            'name' => 'Survei Ubinan Padi',
            'team_id' => $team->id,
            'default_unit' => 'Dokumen',
            'default_rate' => 250000,
            'default_budget_account_id' => $this->budgetAccount->id,
            'is_active' => true,
        ]);
    }

    public function test_can_list_spks_with_pagination_and_filters(): void
    {
        Sanctum::actingAs($this->adminUser);

        Spk::create([
            'mitra_id' => $this->mitraA->id,
            'spk_number' => '001/SPK/3516/2026',
            'contract_date' => '2026-05-01',
            'period_start' => '2026-05-01',
            'period_end' => '2026-05-31',
            'status' => SpkStatus::DRAFT,
            'created_by' => $this->adminUser->id,
        ]);

        Spk::create([
            'mitra_id' => $this->mitraB->id,
            'spk_number' => '002/SPK/3516/2026',
            'contract_date' => '2026-06-01',
            'period_start' => '2026-06-01',
            'period_end' => '2026-06-30',
            'status' => SpkStatus::ACTIVE,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->getJson('/api/spks?search=001');

        $response->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.spk_number', '001/SPK/3516/2026');
    }

    public function test_create_spk_success(): void
    {
        Sanctum::actingAs($this->operatorUser);

        $payload = [
            'mitra_id' => $this->mitraA->id,
            'spk_number' => '003/SPK/3516/2026',
            'contract_date' => '2026-07-01',
            'period_start' => '2026-07-01',
            'period_end' => '2026-07-31',
            'occupation' => 'Mitra Statistik',
            'position' => 'Pencacah',
            'work_address' => 'Kec. Jatirejo',
            'notes' => 'SPK Survei Pertanian Juli',
        ];

        $response = $this->postJson('/api/spks', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.spk_number', '003/SPK/3516/2026')
            ->assertJsonPath('data.status.value', 'draft');

        $this->assertDatabaseHas('spks', [
            'spk_number' => '003/SPK/3516/2026',
            'mitra_id' => $this->mitraA->id,
        ]);
    }

    public function test_spk_number_must_be_unique(): void
    {
        Sanctum::actingAs($this->adminUser);

        Spk::create([
            'mitra_id' => $this->mitraA->id,
            'spk_number' => '004/SPK/3516/2026',
            'contract_date' => '2026-08-01',
            'period_start' => '2026-08-01',
            'period_end' => '2026-08-31',
            'status' => SpkStatus::DRAFT,
            'created_by' => $this->adminUser->id,
        ]);

        $payload = [
            'mitra_id' => $this->mitraB->id,
            'spk_number' => '004/SPK/3516/2026',
            'contract_date' => '2026-09-01',
            'period_start' => '2026-09-01',
            'period_end' => '2026-09-30',
        ];

        $response = $this->postJson('/api/spks', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['spk_number']);
    }

    public function test_reject_overlapping_spk_for_same_mitra(): void
    {
        Sanctum::actingAs($this->adminUser);

        Spk::create([
            'mitra_id' => $this->mitraA->id,
            'spk_number' => '005/SPK/3516/2026',
            'contract_date' => '2026-08-01',
            'period_start' => '2026-08-01',
            'period_end' => '2026-08-31',
            'status' => SpkStatus::ACTIVE,
            'created_by' => $this->adminUser->id,
        ]);

        // Attempt overlapping period: 15 August to 15 September
        $payload = [
            'mitra_id' => $this->mitraA->id,
            'spk_number' => '006/SPK/3516/2026',
            'contract_date' => '2026-08-15',
            'period_start' => '2026-08-15',
            'period_end' => '2026-09-15',
        ];

        $response = $this->postJson('/api/spks', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['period_start']);
    }

    public function test_same_mitra_can_have_multiple_spks_on_different_periods(): void
    {
        Sanctum::actingAs($this->adminUser);

        Spk::create([
            'mitra_id' => $this->mitraA->id,
            'spk_number' => '007/SPK/3516/2026',
            'contract_date' => '2026-08-01',
            'period_start' => '2026-08-01',
            'period_end' => '2026-08-31',
            'status' => SpkStatus::COMPLETED,
            'created_by' => $this->adminUser->id,
        ]);

        // Non-overlapping period: 1 September to 30 September
        $payload = [
            'mitra_id' => $this->mitraA->id,
            'spk_number' => '008/SPK/3516/2026',
            'contract_date' => '2026-09-01',
            'period_start' => '2026-09-01',
            'period_end' => '2026-09-30',
        ];

        $response = $this->postJson('/api/spks', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.spk_number', '008/SPK/3516/2026');
    }

    public function test_attach_assignments_belonging_to_same_mitra(): void
    {
        Sanctum::actingAs($this->adminUser);

        $spk = Spk::create([
            'mitra_id' => $this->mitraA->id,
            'spk_number' => '009/SPK/3516/2026',
            'contract_date' => '2026-10-01',
            'period_start' => '2026-10-01',
            'period_end' => '2026-10-31',
            'status' => SpkStatus::DRAFT,
            'created_by' => $this->adminUser->id,
        ]);

        $assignment1 = TaskAssignment::create([
            'mitra_id' => $this->mitraA->id,
            'task_id' => $this->task->id,
            'budget_account_id' => $this->budgetAccount->id,
            'task_name_snapshot' => $this->task->name,
            'team_name_snapshot' => 'Tim Produksi',
            'budget_account_code_snapshot' => $this->budgetAccount->code,
            'budget_account_name_snapshot' => $this->budgetAccount->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 250000,
            'start_date' => '2026-10-05',
            'end_date' => '2026-10-10',
            'volume' => 2,
            'unit_price' => 250000,
            'total_value' => 500000,
            'status' => AssignmentStatus::APPROVED,
            'created_by' => $this->adminUser->id,
        ]);

        $assignment2 = TaskAssignment::create([
            'mitra_id' => $this->mitraA->id,
            'task_id' => $this->task->id,
            'budget_account_id' => $this->budgetAccount->id,
            'task_name_snapshot' => $this->task->name,
            'team_name_snapshot' => 'Tim Produksi',
            'budget_account_code_snapshot' => $this->budgetAccount->code,
            'budget_account_name_snapshot' => $this->budgetAccount->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 250000,
            'start_date' => '2026-10-12',
            'end_date' => '2026-10-20',
            'volume' => 3,
            'unit_price' => 250000,
            'total_value' => 750000,
            'status' => AssignmentStatus::APPROVED,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->postJson("/api/spks/{$spk->id}/attach-assignments", [
            'assignment_ids' => [$assignment1->id, $assignment2->id],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.tasks_count', 2)
            ->assertJsonPath('data.total_value', 1250000);

        $this->assertDatabaseHas('task_assignments', [
            'id' => $assignment1->id,
            'spk_id' => $spk->id,
        ]);
        $this->assertDatabaseHas('task_assignments', [
            'id' => $assignment2->id,
            'spk_id' => $spk->id,
        ]);
    }

    public function test_reject_attaching_assignment_belonging_to_another_mitra(): void
    {
        Sanctum::actingAs($this->adminUser);

        $spk = Spk::create([
            'mitra_id' => $this->mitraA->id,
            'spk_number' => '010/SPK/3516/2026',
            'contract_date' => '2026-10-01',
            'period_start' => '2026-10-01',
            'period_end' => '2026-10-31',
            'status' => SpkStatus::DRAFT,
            'created_by' => $this->adminUser->id,
        ]);

        // Assignment belonging to Mitra B
        $assignmentB = TaskAssignment::create([
            'mitra_id' => $this->mitraB->id,
            'task_id' => $this->task->id,
            'budget_account_id' => $this->budgetAccount->id,
            'task_name_snapshot' => $this->task->name,
            'team_name_snapshot' => 'Tim Produksi',
            'budget_account_code_snapshot' => $this->budgetAccount->code,
            'budget_account_name_snapshot' => $this->budgetAccount->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 250000,
            'start_date' => '2026-10-05',
            'end_date' => '2026-10-10',
            'volume' => 2,
            'unit_price' => 250000,
            'total_value' => 500000,
            'status' => AssignmentStatus::APPROVED,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->postJson("/api/spks/{$spk->id}/attach-assignments", [
            'assignment_ids' => [$assignmentB->id],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['assignment_ids']);
    }

    public function test_detach_assignment_from_spk(): void
    {
        Sanctum::actingAs($this->adminUser);

        $spk = Spk::create([
            'mitra_id' => $this->mitraA->id,
            'spk_number' => '011/SPK/3516/2026',
            'contract_date' => '2026-10-01',
            'period_start' => '2026-10-01',
            'period_end' => '2026-10-31',
            'status' => SpkStatus::DRAFT,
            'created_by' => $this->adminUser->id,
        ]);

        $assignment = TaskAssignment::create([
            'mitra_id' => $this->mitraA->id,
            'task_id' => $this->task->id,
            'spk_id' => $spk->id,
            'budget_account_id' => $this->budgetAccount->id,
            'task_name_snapshot' => $this->task->name,
            'team_name_snapshot' => 'Tim Produksi',
            'budget_account_code_snapshot' => $this->budgetAccount->code,
            'budget_account_name_snapshot' => $this->budgetAccount->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 250000,
            'start_date' => '2026-10-05',
            'end_date' => '2026-10-10',
            'volume' => 2,
            'unit_price' => 250000,
            'total_value' => 500000,
            'status' => AssignmentStatus::APPROVED,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->postJson("/api/spks/{$spk->id}/detach-assignment/{$assignment->id}");

        $response->assertOk()
            ->assertJsonPath('data.tasks_count', 0)
            ->assertJsonPath('data.total_value', 0);

        $this->assertDatabaseHas('task_assignments', [
            'id' => $assignment->id,
            'spk_id' => null,
        ]);
    }

    public function test_spk_workflow_lifecycle_and_audit_logging(): void
    {
        Sanctum::actingAs($this->adminUser);

        $spk = Spk::create([
            'mitra_id' => $this->mitraA->id,
            'spk_number' => '012/SPK/3516/2026',
            'contract_date' => '2026-11-01',
            'period_start' => '2026-11-01',
            'period_end' => '2026-11-30',
            'status' => SpkStatus::DRAFT,
            'created_by' => $this->adminUser->id,
        ]);

        // 1. Activate
        $responseActivate = $this->postJson("/api/spks/{$spk->id}/activate");
        $responseActivate->assertOk()->assertJsonPath('data.status.value', 'active');

        $this->assertDatabaseHas('audit_logs', [
            'entity_type' => 'spk',
            'entity_id' => $spk->id,
            'action' => 'activate_spk',
        ]);

        // 2. Complete
        $responseComplete = $this->postJson("/api/spks/{$spk->id}/complete");
        $responseComplete->assertOk()->assertJsonPath('data.status.value', 'completed');

        $this->assertDatabaseHas('audit_logs', [
            'entity_type' => 'spk',
            'entity_id' => $spk->id,
            'action' => 'complete_spk',
        ]);
    }

    public function test_cancel_spk_with_reason(): void
    {
        Sanctum::actingAs($this->pimpinanUser);

        $spk = Spk::create([
            'mitra_id' => $this->mitraA->id,
            'spk_number' => '013/SPK/3516/2026',
            'contract_date' => '2026-12-01',
            'period_start' => '2026-12-01',
            'period_end' => '2026-12-31',
            'status' => SpkStatus::ACTIVE,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->postJson("/api/spks/{$spk->id}/cancel", [
            'reason' => 'Perubahan alokasi anggaran kegiatan sensus.',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status.value', 'cancelled');

        $this->assertDatabaseHas('spks', [
            'id' => $spk->id,
            'status' => SpkStatus::CANCELLED->value,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'entity_type' => 'spk',
            'entity_id' => $spk->id,
            'action' => 'cancel_spk',
        ]);
    }

    public function test_get_mitra_spks_endpoint(): void
    {
        Sanctum::actingAs($this->operatorUser);

        Spk::create([
            'mitra_id' => $this->mitraA->id,
            'spk_number' => '014/SPK/3516/2026',
            'contract_date' => '2026-01-01',
            'period_start' => '2026-01-01',
            'period_end' => '2026-01-31',
            'status' => SpkStatus::COMPLETED,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->getJson("/api/mitras/{$this->mitraA->id}/spks");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.spk_number', '014/SPK/3516/2026');
    }
}
