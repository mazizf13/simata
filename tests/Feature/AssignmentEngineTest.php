<?php

namespace Tests\Feature;

use App\Enums\AssignmentStatus;
use App\Enums\UserRole;
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
use Tests\TestCase;

class AssignmentEngineTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $operatorUser;
    protected Team $team;
    protected District $district;
    protected Mitra $mitra;
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

        $this->adminUser = User::factory()->create(['is_active' => true]);
        $this->adminUser->roles()->attach($adminRole->id);

        $this->operatorUser = User::factory()->create(['is_active' => true]);
        $this->operatorUser->roles()->attach($operatorRole->id);

        $this->team = Team::create([
            'code' => 'PROD',
            'name' => 'Produksi',
            'is_active' => true,
        ]);

        $this->district = District::create([
            'code' => '3516010',
            'name' => 'Jatirejo',
            'is_active' => true,
        ]);

        $this->mitra = Mitra::create([
            'mitra_code' => '3516-001',
            'name' => 'Ahmad Mitra',
            'address' => 'Jl. Jatirejo No. 1',
            'district_id' => $this->district->id,
            'phone' => '081234567891',
            'status' => 'active',
        ]);

        $this->budgetAccount = BudgetAccount::create([
            'code' => '8130.BMA.007.005.521213',
            'name' => 'Honor Survei Produksi',
            'is_active' => true,
        ]);

        $this->task = Task::create([
            'code' => 'SURV-01',
            'team_id' => $this->team->id,
            'name' => 'Survei Ubinan Padi',
            'default_unit' => 'Dokumen',
            'default_rate' => 100000.00,
            'default_budget_account_id' => $this->budgetAccount->id,
            'is_active' => true,
        ]);
    }

    public function test_total_value_is_calculated_strictly_on_backend(): void
    {
        $payload = [
            'mitra_id' => $this->mitra->id,
            'task_id' => $this->task->id,
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-05',
            'volume' => 5,
            'unit_price' => 150000,
            'total_value' => 999999999, // Fake total value from browser
            'status' => 'approved',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/assignments', $payload);

        $response->assertCreated();

        // 5 * 150,000 = 750,000 (not 999,999,999)
        $this->assertDatabaseHas('task_assignments', [
            'mitra_id' => $this->mitra->id,
            'volume' => 5,
            'unit_price' => 150000,
            'total_value' => 750000,
        ]);
    }

    public function test_can_create_assignment_up_to_exactly_10_tasks_in_a_month(): void
    {
        // Create 9 approved tasks in September 2026 with 100k each = 900k
        for ($i = 1; $i <= 9; $i++) {
            TaskAssignment::create([
                'mitra_id' => $this->mitra->id,
                'task_id' => $this->task->id,
                'task_name_snapshot' => $this->task->name,
                'team_name_snapshot' => $this->team->name,
                'unit_snapshot' => 'Dokumen',
                'unit_price_snapshot' => 100000,
                'start_date' => '2026-09-01',
                'end_date' => '2026-09-05',
                'volume' => 1,
                'unit_price' => 100000,
                'total_value' => 100000,
                'status' => AssignmentStatus::APPROVED,
                'created_by' => $this->adminUser->id,
            ]);
        }

        // 10th task: Should be ACCEPTED (exact 10 tasks)
        $payload = [
            'mitra_id' => $this->mitra->id,
            'task_id' => $this->task->id,
            'start_date' => '2026-09-10',
            'end_date' => '2026-09-15',
            'volume' => 1,
            'unit_price' => 100000,
            'status' => 'approved',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/assignments', $payload);

        $response->assertCreated();
        $this->assertEquals(10, TaskAssignment::where('mitra_id', $this->mitra->id)->count());

        // 11th task: Should be REJECTED (exceeds MAX 10 tasks)
        $payload11 = [
            'mitra_id' => $this->mitra->id,
            'task_id' => $this->task->id,
            'start_date' => '2026-09-20',
            'end_date' => '2026-09-25',
            'volume' => 1,
            'unit_price' => 50000,
            'status' => 'approved',
        ];

        $response11 = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/assignments', $payload11);

        $response11->assertStatus(422)
            ->assertJsonValidationErrors(['limits']);
    }

    public function test_can_reach_honor_up_to_exactly_4_million_but_rejected_if_exceeds(): void
    {
        // 1 task with Rp 3,500,000
        TaskAssignment::create([
            'mitra_id' => $this->mitra->id,
            'task_id' => $this->task->id,
            'task_name_snapshot' => $this->task->name,
            'team_name_snapshot' => $this->team->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 3500000,
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-05',
            'volume' => 1,
            'unit_price' => 3500000,
            'total_value' => 3500000,
            'status' => AssignmentStatus::APPROVED,
            'created_by' => $this->adminUser->id,
        ]);

        // Second task with Rp 500,000 -> Total becomes exactly Rp 4,000,000 (ACCEPTED)
        $payloadExact = [
            'mitra_id' => $this->mitra->id,
            'task_id' => $this->task->id,
            'start_date' => '2026-09-10',
            'end_date' => '2026-09-15',
            'volume' => 1,
            'unit_price' => 500000,
            'status' => 'approved',
        ];

        $resExact = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/assignments', $payloadExact);

        $resExact->assertCreated();

        // Third task with even Rp 1 -> Total becomes Rp 4,000,001 (REJECTED by OR operator)
        $payloadExceed = [
            'mitra_id' => $this->mitra->id,
            'task_id' => $this->task->id,
            'start_date' => '2026-09-20',
            'end_date' => '2026-09-25',
            'volume' => 1,
            'unit_price' => 1,
            'status' => 'approved',
        ];

        $resExceed = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/assignments', $payloadExceed);

        $resExceed->assertStatus(422)
            ->assertJsonValidationErrors(['limits']);
    }

    public function test_cross_month_assignment_charges_entirely_to_start_date_month(): void
    {
        // Assignment: 24 September 2026 to 10 October 2026, Value Rp 1,000,000
        $payload = [
            'mitra_id' => $this->mitra->id,
            'task_id' => $this->task->id,
            'start_date' => '2026-09-24',
            'end_date' => '2026-10-10',
            'volume' => 1,
            'unit_price' => 1000000,
            'status' => 'approved',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/assignments', $payload);

        $response->assertCreated();

        // Check September summary: 1 task, Rp 1,000,000
        $sepRes = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/mitras/{$this->mitra->id}/honor-summary?year=2026&month=9");

        $sepRes->assertOk()
            ->assertJsonPath('data.total_tasks', 1)
            ->assertJsonPath('data.total_honor', 1000000);

        // Check October summary: 0 tasks, Rp 0 (no prorata)
        $octRes = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/mitras/{$this->mitra->id}/honor-summary?year=2026&month=10");

        $octRes->assertOk()
            ->assertJsonPath('data.total_tasks', 0)
            ->assertJsonPath('data.total_honor', 0);
    }

    public function test_draft_and_cancelled_statuses_do_not_count_towards_limits(): void
    {
        // 10 Draft assignments
        for ($i = 1; $i <= 10; $i++) {
            TaskAssignment::create([
                'mitra_id' => $this->mitra->id,
                'task_id' => $this->task->id,
                'task_name_snapshot' => $this->task->name,
                'team_name_snapshot' => $this->team->name,
                'unit_snapshot' => 'Dokumen',
                'unit_price_snapshot' => 100000,
                'start_date' => '2026-09-01',
                'end_date' => '2026-09-05',
                'volume' => 1,
                'unit_price' => 100000,
                'total_value' => 100000,
                'status' => AssignmentStatus::DRAFT,
                'created_by' => $this->adminUser->id,
            ]);
        }

        // 1 Cancelled assignment with Rp 3,000,000
        TaskAssignment::create([
            'mitra_id' => $this->mitra->id,
            'task_id' => $this->task->id,
            'task_name_snapshot' => $this->task->name,
            'team_name_snapshot' => $this->team->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 3000000,
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-05',
            'volume' => 1,
            'unit_price' => 3000000,
            'total_value' => 3000000,
            'status' => AssignmentStatus::CANCELLED,
            'created_by' => $this->adminUser->id,
        ]);

        // Now create an approved assignment with Rp 4,000,000:
        // Must succeed because drafts and cancelled are NOT counted!
        $payload = [
            'mitra_id' => $this->mitra->id,
            'task_id' => $this->task->id,
            'start_date' => '2026-09-10',
            'end_date' => '2026-09-15',
            'volume' => 1,
            'unit_price' => 4000000,
            'status' => 'approved',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/assignments', $payload);

        $response->assertCreated();
    }

    public function test_completed_status_remains_counted(): void
    {
        // 10 Completed assignments
        for ($i = 1; $i <= 10; $i++) {
            TaskAssignment::create([
                'mitra_id' => $this->mitra->id,
                'task_id' => $this->task->id,
                'task_name_snapshot' => $this->task->name,
                'team_name_snapshot' => $this->team->name,
                'unit_snapshot' => 'Dokumen',
                'unit_price_snapshot' => 50000,
                'start_date' => '2026-09-01',
                'end_date' => '2026-09-05',
                'volume' => 1,
                'unit_price' => 50000,
                'total_value' => 50000,
                'status' => AssignmentStatus::COMPLETED,
                'created_by' => $this->adminUser->id,
            ]);
        }

        // New approved task should be rejected because 10 completed tasks are counted
        $payload = [
            'mitra_id' => $this->mitra->id,
            'task_id' => $this->task->id,
            'start_date' => '2026-09-15',
            'end_date' => '2026-09-20',
            'volume' => 1,
            'unit_price' => 50000,
            'status' => 'approved',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/assignments', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['limits']);
    }

    public function test_status_workflow_and_cancellation(): void
    {
        // 1. Create draft
        $assignment = TaskAssignment::create([
            'mitra_id' => $this->mitra->id,
            'task_id' => $this->task->id,
            'task_name_snapshot' => $this->task->name,
            'team_name_snapshot' => $this->team->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 100000,
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-05',
            'volume' => 1,
            'unit_price' => 100000,
            'total_value' => 100000,
            'status' => AssignmentStatus::DRAFT,
            'created_by' => $this->adminUser->id,
        ]);

        // 2. Submit for approval
        $resSubmit = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/assignments/{$assignment->id}/submit");

        $resSubmit->assertOk()
            ->assertJsonPath('data.status.value', 'pending_approval');

        // 3. Approve
        $resApprove = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/assignments/{$assignment->id}/approve");

        $resApprove->assertOk()
            ->assertJsonPath('data.status.value', 'approved');

        // 4. Activate
        $resActivate = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/assignments/{$assignment->id}/activate");

        $resActivate->assertOk()
            ->assertJsonPath('data.status.value', 'active');

        // 5. Cancel with reason
        $resCancel = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/assignments/{$assignment->id}/cancel", [
                'reason' => 'Perubahan alokasi sampel survei oleh pimpinan.',
            ]);

        $resCancel->assertOk()
            ->assertJsonPath('data.status.value', 'cancelled')
            ->assertJsonPath('data.cancellation_reason', 'Perubahan alokasi sampel survei oleh pimpinan.');

        $this->assertDatabaseHas('task_assignments', [
            'id' => $assignment->id,
            'status' => 'cancelled',
            'cancellation_reason' => 'Perubahan alokasi sampel survei oleh pimpinan.',
        ]);

        // Audit log created
        $this->assertDatabaseHas('audit_logs', [
            'entity_id' => $assignment->id,
            'action' => 'cancel_assignment',
        ]);
    }

    public function test_bulk_assignment_creates_individual_records_and_validates_limits(): void
    {
        $mitra2 = Mitra::create([
            'mitra_code' => '3516-002',
            'name' => 'Budi Kedua',
            'address' => 'Jl. Jatirejo No. 2',
            'district_id' => $this->district->id,
            'phone' => '081234567892',
            'status' => 'active',
        ]);

        // Pre-fill mitra2 with Rp 3,900,000 in September
        TaskAssignment::create([
            'mitra_id' => $mitra2->id,
            'task_id' => $this->task->id,
            'task_name_snapshot' => $this->task->name,
            'team_name_snapshot' => $this->team->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 3900000,
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-05',
            'volume' => 1,
            'unit_price' => 3900000,
            'total_value' => 3900000,
            'status' => AssignmentStatus::APPROVED,
            'created_by' => $this->adminUser->id,
        ]);

        // Bulk assign task with unit price 200,000 to both mitras
        // Mitra 1: 0 + 200k = 200k (PASS)
        // Mitra 2: 3.9M + 200k = 4.1M (FAIL: honor limit)
        $payload = [
            'task_id' => $this->task->id,
            'start_date' => '2026-09-15',
            'end_date' => '2026-09-20',
            'status' => 'approved',
            'mitra_assignments' => [
                ['mitra_id' => $this->mitra->id, 'volume' => 1, 'unit_price' => 200000],
                ['mitra_id' => $mitra2->id, 'volume' => 1, 'unit_price' => 200000],
            ],
        ];

        // First test simulation endpoint
        $simResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/assignments/bulk-simulate', $payload);

        $simResponse->assertOk()
            ->assertJsonPath('data.all_passed', false)
            ->assertJsonPath('data.simulation.0.allowed', true)
            ->assertJsonPath('data.simulation.1.allowed', false);

        // Execute bulk assignment
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/assignments/bulk', $payload);

        $response->assertOk()
            ->assertJsonPath('data.created_count', 1)
            ->assertJsonPath('data.failed_count', 1);

        // Mitra 1 has the assignment
        $this->assertDatabaseHas('task_assignments', [
            'mitra_id' => $this->mitra->id,
            'total_value' => 200000,
        ]);

        // Mitra 2 did NOT get the 200k assignment
        $this->assertEquals(1, TaskAssignment::where('mitra_id', $mitra2->id)->count());
    }

    public function test_rejects_assignment_if_spk_does_not_belong_to_mitra(): void
    {
        $otherMitra = Mitra::create([
            'mitra_code' => '3516-999',
            'name' => 'Mitra Lain',
            'address' => 'Alamat Lain',
            'district_id' => $this->district->id,
            'phone' => '081234567899',
            'status' => 'active',
        ]);

        $spkOther = Spk::create([
            'mitra_id' => $otherMitra->id,
            'spk_number' => 'SPK/3516/2026/001',
            'contract_date' => '2026-09-01',
            'created_by' => $this->adminUser->id,
        ]);

        $payload = [
            'mitra_id' => $this->mitra->id, // Ahmad Mitra
            'task_id' => $this->task->id,
            'spk_id' => $spkOther->id, // Owned by Mitra Lain
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-05',
            'volume' => 1,
            'unit_price' => 100000,
            'status' => 'draft',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/assignments', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['spk_id']);
    }

    public function test_updating_start_date_revalidates_limits_in_new_month(): void
    {
        // Mitra has 10 tasks in October 2026
        for ($i = 1; $i <= 10; $i++) {
            TaskAssignment::create([
                'mitra_id' => $this->mitra->id,
                'task_id' => $this->task->id,
                'task_name_snapshot' => $this->task->name,
                'team_name_snapshot' => $this->team->name,
                'unit_snapshot' => 'Dokumen',
                'unit_price_snapshot' => 50000,
                'start_date' => '2026-10-01',
                'end_date' => '2026-10-05',
                'volume' => 1,
                'unit_price' => 50000,
                'total_value' => 50000,
                'status' => AssignmentStatus::APPROVED,
                'created_by' => $this->adminUser->id,
            ]);
        }

        // An approved task in September
        $sepAssignment = TaskAssignment::create([
            'mitra_id' => $this->mitra->id,
            'task_id' => $this->task->id,
            'task_name_snapshot' => $this->task->name,
            'team_name_snapshot' => $this->team->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 50000,
            'start_date' => '2026-09-15',
            'end_date' => '2026-09-20',
            'volume' => 1,
            'unit_price' => 50000,
            'total_value' => 50000,
            'status' => AssignmentStatus::APPROVED,
            'created_by' => $this->adminUser->id,
        ]);

        // Moving this September task to October should be REJECTED because October is already full (10 tasks)
        $updatePayload = [
            'start_date' => '2026-10-15',
            'end_date' => '2026-10-20',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/assignments/{$sepAssignment->id}", $updatePayload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['limits']);
    }

    public function test_concurrent_assignments_enforce_locking_and_prevent_limit_breach(): void
    {
        // Pre-fill with 9 tasks in September (Rp 900,000)
        for ($i = 1; $i <= 9; $i++) {
            TaskAssignment::create([
                'mitra_id' => $this->mitra->id,
                'task_id' => $this->task->id,
                'task_name_snapshot' => $this->task->name,
                'team_name_snapshot' => $this->team->name,
                'unit_snapshot' => 'Dokumen',
                'unit_price_snapshot' => 100000,
                'start_date' => '2026-09-01',
                'end_date' => '2026-09-05',
                'volume' => 1,
                'unit_price' => 100000,
                'total_value' => 100000,
                'status' => AssignmentStatus::APPROVED,
                'created_by' => $this->adminUser->id,
            ]);
        }

        // Admin A creates task 10 (allowed)
        $resA = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/assignments', [
                'mitra_id' => $this->mitra->id,
                'task_id' => $this->task->id,
                'start_date' => '2026-09-10',
                'end_date' => '2026-09-15',
                'volume' => 1,
                'unit_price' => 100000,
                'status' => 'approved',
            ]);
        $resA->assertCreated();

        // Admin B attempts concurrent assignment at almost the same time (now at 10, rejected)
        $resB = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/assignments', [
                'mitra_id' => $this->mitra->id,
                'task_id' => $this->task->id,
                'start_date' => '2026-09-10',
                'end_date' => '2026-09-15',
                'volume' => 1,
                'unit_price' => 100000,
                'status' => 'approved',
            ]);
        $resB->assertStatus(422)
            ->assertJsonValidationErrors(['limits']);
    }
}
