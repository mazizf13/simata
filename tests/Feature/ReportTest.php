<?php

namespace Tests\Feature;

use App\Enums\AssignmentStatus;
use App\Enums\UserRole;
use App\Models\BudgetAccount;
use App\Models\District;
use App\Models\Mitra;
use App\Models\Role;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected Team $teamA;
    protected Team $teamB;
    protected District $district;
    protected Mitra $mitraA;
    protected Mitra $mitraB;
    protected Task $taskA;
    protected Task $taskB;
    protected BudgetAccount $budgetAccount;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create([
            'name' => UserRole::ADMIN->value,
            'display_name' => 'Admin',
        ]);

        $this->adminUser = User::factory()->create(['is_active' => true]);
        $this->adminUser->roles()->attach($adminRole->id);

        $this->teamA = Team::create([
            'code' => 'PROD',
            'name' => 'Tim Produksi',
            'is_active' => true,
        ]);

        $this->teamB = Team::create([
            'code' => 'SOS',
            'name' => 'Tim Sosial',
            'is_active' => true,
        ]);

        $this->district = District::create([
            'code' => '3516010',
            'name' => 'Jatirejo',
            'is_active' => true,
        ]);

        $this->mitraA = Mitra::create([
            'mitra_code' => 'MITRA-001',
            'name' => 'Budi Santoso',
            'district_id' => $this->district->id,
            'status' => 'active',
            'phone' => '08111111111',
        ]);

        $this->mitraB = Mitra::create([
            'mitra_code' => 'MITRA-002',
            'name' => 'Siti Aminah',
            'district_id' => $this->district->id,
            'status' => 'active',
            'phone' => '08222222222',
        ]);

        $this->budgetAccount = BudgetAccount::create([
            'code' => '521213.001',
            'name' => 'Honor Output Kegiatan',
            'is_active' => true,
        ]);

        $this->taskA = Task::create([
            'task_code' => 'TASK-001',
            'name' => 'Survei Ubinan Padi',
            'team_id' => $this->teamA->id,
            'default_unit' => 'Dokumen',
            'default_rate' => 500000,
            'default_budget_account_id' => $this->budgetAccount->id,
            'is_active' => true,
        ]);

        $this->taskB = Task::create([
            'task_code' => 'TASK-002',
            'name' => 'Survei Biaya Hidup',
            'team_id' => $this->teamB->id,
            'default_unit' => 'Rumah Tangga',
            'default_rate' => 1000000,
            'default_budget_account_id' => $this->budgetAccount->id,
            'is_active' => true,
        ]);
    }

    public function test_dashboard_stats_using_actual_database_aggregates(): void
    {
        Sanctum::actingAs($this->adminUser);

        // Mitra A gets 2 approved assignments in November 2026 (Total Rp 1.000.000)
        TaskAssignment::create([
            'mitra_id' => $this->mitraA->id,
            'task_id' => $this->taskA->id,
            'task_name_snapshot' => $this->taskA->name,
            'team_name_snapshot' => $this->teamA->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 500000,
            'start_date' => '2026-11-05',
            'end_date' => '2026-11-10',
            'volume' => 1,
            'unit_price' => 500000,
            'total_value' => 500000,
            'status' => AssignmentStatus::APPROVED,
            'created_by' => $this->adminUser->id,
        ]);

        TaskAssignment::create([
            'mitra_id' => $this->mitraA->id,
            'task_id' => $this->taskA->id,
            'task_name_snapshot' => $this->taskA->name,
            'team_name_snapshot' => $this->teamA->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 500000,
            'start_date' => '2026-11-12',
            'end_date' => '2026-11-20',
            'volume' => 1,
            'unit_price' => 500000,
            'total_value' => 500000,
            'status' => AssignmentStatus::ACTIVE,
            'created_by' => $this->adminUser->id,
        ]);

        // Mitra B gets 1 completed assignment in November 2026 (Total Rp 1.000.000)
        TaskAssignment::create([
            'mitra_id' => $this->mitraB->id,
            'task_id' => $this->taskB->id,
            'task_name_snapshot' => $this->taskB->name,
            'team_name_snapshot' => $this->teamB->name,
            'unit_snapshot' => 'Rumah Tangga',
            'unit_price_snapshot' => 1000000,
            'start_date' => '2026-11-01',
            'end_date' => '2026-11-15',
            'volume' => 1,
            'unit_price' => 1000000,
            'total_value' => 1000000,
            'status' => AssignmentStatus::COMPLETED,
            'created_by' => $this->adminUser->id,
        ]);

        // Draft assignment (MUST NOT be counted in honor / tasks totals)
        TaskAssignment::create([
            'mitra_id' => $this->mitraB->id,
            'task_id' => $this->taskB->id,
            'task_name_snapshot' => $this->taskB->name,
            'team_name_snapshot' => $this->teamB->name,
            'unit_snapshot' => 'Rumah Tangga',
            'unit_price_snapshot' => 1000000,
            'start_date' => '2026-11-01',
            'end_date' => '2026-11-15',
            'volume' => 1,
            'unit_price' => 1000000,
            'total_value' => 1000000,
            'status' => AssignmentStatus::DRAFT,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->getJson('/api/dashboard?year=2026&month=11');

        $response->assertOk()
            ->assertJsonPath('data.metrics.total_active_mitras', 2)
            ->assertJsonPath('data.metrics.total_assignments', 3) // 2 + 1 (excluding draft)
            ->assertJsonPath('data.metrics.total_honor_value', 2000000)
            ->assertJsonPath('data.metrics.active_assignments_count', 1);
    }

    public function test_monthly_mitra_recap(): void
    {
        Sanctum::actingAs($this->adminUser);

        // Assign Mitra A Rp 3.500.000 in 8 tasks -> should be marked as "Mendekati Batas"
        for ($i = 1; $i <= 8; $i++) {
            TaskAssignment::create([
                'mitra_id' => $this->mitraA->id,
                'task_id' => $this->taskA->id,
                'task_name_snapshot' => $this->taskA->name,
                'team_name_snapshot' => $this->teamA->name,
                'unit_snapshot' => 'Dokumen',
                'unit_price_snapshot' => 437500,
                'start_date' => '2026-11-05',
                'end_date' => '2026-11-10',
                'volume' => 1,
                'unit_price' => 437500,
                'total_value' => 437500,
                'status' => AssignmentStatus::APPROVED,
                'created_by' => $this->adminUser->id,
            ]);
        }

        $response = $this->getJson('/api/reports/monthly?year=2026&month=11');

        $response->assertOk()
            ->assertJsonPath('meta.total', 2);

        $data = collect($response->json('data'));
        $mitraARecap = $data->firstWhere('id', $this->mitraA->id);

        $this->assertEquals(8, $mitraARecap['total_tasks']);
        $this->assertEquals(3500000, $mitraARecap['total_honor']);
        $this->assertEquals(2, $mitraARecap['remaining_tasks']);
        $this->assertEquals(500000, $mitraARecap['remaining_honor']);
        $this->assertEquals('near_limit', $mitraARecap['limit_status']);
    }

    public function test_team_recap_and_drilldown(): void
    {
        Sanctum::actingAs($this->adminUser);

        // Mitra A and Mitra B in Team A
        TaskAssignment::create([
            'mitra_id' => $this->mitraA->id,
            'task_id' => $this->taskA->id,
            'task_name_snapshot' => $this->taskA->name,
            'team_name_snapshot' => $this->teamA->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 500000,
            'start_date' => '2026-11-05',
            'end_date' => '2026-11-10',
            'volume' => 1,
            'unit_price' => 500000,
            'total_value' => 500000,
            'status' => AssignmentStatus::APPROVED,
            'created_by' => $this->adminUser->id,
        ]);

        TaskAssignment::create([
            'mitra_id' => $this->mitraB->id,
            'task_id' => $this->taskA->id,
            'task_name_snapshot' => $this->taskA->name,
            'team_name_snapshot' => $this->teamA->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 500000,
            'start_date' => '2026-11-05',
            'end_date' => '2026-11-10',
            'volume' => 1,
            'unit_price' => 500000,
            'total_value' => 500000,
            'status' => AssignmentStatus::APPROVED,
            'created_by' => $this->adminUser->id,
        ]);

        $responseTeam = $this->getJson('/api/reports/teams?year=2026&month=11');
        $responseTeam->assertOk();

        $teams = collect($responseTeam->json('data.teams'));
        $teamARecap = $teams->firstWhere('team_id', $this->teamA->id);

        $this->assertEquals(2, $teamARecap['mitras_count']);
        $this->assertEquals(2, $teamARecap['assignments_count']);
        $this->assertEquals(1000000, $teamARecap['total_honor']);

        // Drill-down endpoint
        $responseDrill = $this->getJson("/api/reports/teams/{$this->teamA->id}/drilldown?year=2026&month=11");
        $responseDrill->assertOk()
            ->assertJsonPath('data.team.name', 'Tim Produksi')
            ->assertJsonPath('data.summary.mitras_count', 2)
            ->assertJsonPath('data.tasks.0.task_name', 'Survei Ubinan Padi');
    }

    public function test_cross_month_calendar_events(): void
    {
        Sanctum::actingAs($this->adminUser);

        // Assignment spanning from 25 October 2026 to 10 November 2026
        // It must appear in November calendar query
        TaskAssignment::create([
            'mitra_id' => $this->mitraA->id,
            'task_id' => $this->taskA->id,
            'task_name_snapshot' => $this->taskA->name,
            'team_name_snapshot' => $this->teamA->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 500000,
            'start_date' => '2026-10-25',
            'end_date' => '2026-11-10',
            'volume' => 1,
            'unit_price' => 500000,
            'total_value' => 500000,
            'status' => AssignmentStatus::ACTIVE,
            'created_by' => $this->adminUser->id,
        ]);

        // Cancelled assignment should NOT appear in calendar
        TaskAssignment::create([
            'mitra_id' => $this->mitraB->id,
            'task_id' => $this->taskB->id,
            'task_name_snapshot' => $this->taskB->name,
            'team_name_snapshot' => $this->teamB->name,
            'unit_snapshot' => 'Rumah Tangga',
            'unit_price_snapshot' => 1000000,
            'start_date' => '2026-11-01',
            'end_date' => '2026-11-15',
            'volume' => 1,
            'unit_price' => 1000000,
            'total_value' => 1000000,
            'status' => AssignmentStatus::CANCELLED,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->getJson('/api/reports/calendar?year=2026&month=11');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.mitra_name', 'Budi Santoso');
    }

    public function test_kanban_assignments_categorization(): void
    {
        Sanctum::actingAs($this->adminUser);

        TaskAssignment::create([
            'mitra_id' => $this->mitraA->id,
            'task_id' => $this->taskA->id,
            'task_name_snapshot' => $this->taskA->name,
            'team_name_snapshot' => $this->teamA->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 500000,
            'start_date' => '2026-11-05',
            'end_date' => '2026-11-10',
            'volume' => 1,
            'unit_price' => 500000,
            'total_value' => 500000,
            'status' => AssignmentStatus::DRAFT,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->getJson('/api/reports/kanban?year=2026&month=11');

        $response->assertOk()
            ->assertJsonCount(1, 'data.draft');
    }

    public function test_exports_csv_endpoints(): void
    {
        Sanctum::actingAs($this->adminUser);

        TaskAssignment::create([
            'mitra_id' => $this->mitraA->id,
            'task_id' => $this->taskA->id,
            'task_name_snapshot' => $this->taskA->name,
            'team_name_snapshot' => $this->teamA->name,
            'unit_snapshot' => 'Dokumen',
            'unit_price_snapshot' => 500000,
            'start_date' => '2026-11-05',
            'end_date' => '2026-11-10',
            'volume' => 1,
            'unit_price' => 500000,
            'total_value' => 500000,
            'status' => AssignmentStatus::APPROVED,
            'created_by' => $this->adminUser->id,
        ]);

        // Monthly mitra CSV
        $responseMonthly = $this->get('/api/exports/monthly?year=2026&month=11');
        $responseMonthly->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Budi Santoso', $responseMonthly->getContent());

        // Teams CSV
        $responseTeams = $this->get('/api/exports/teams?year=2026&month=11');
        $responseTeams->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Tim Produksi', $responseTeams->getContent());

        // Assignments CSV
        $responseAssignments = $this->get('/api/exports/assignments?year=2026&month=11');
        $responseAssignments->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Survei Ubinan Padi', $responseAssignments->getContent());
    }
}
