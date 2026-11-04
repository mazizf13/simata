<?php

namespace Tests\Feature;

use App\Enums\BastStatus;
use App\Enums\SpkStatus;
use App\Enums\UserRole;
use App\Models\District;
use App\Models\Mitra;
use App\Models\Role;
use App\Models\Spk;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\Team;
use App\Models\User;
use App\Services\BastDocumentService;
use App\Services\BastService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BastTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected Mitra $mitra;
    protected Spk $spk;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $adminRole = Role::create([
            'name' => UserRole::ADMIN->value,
            'display_name' => 'Admin',
        ]);

        $this->adminUser = User::factory()->create();
        $this->adminUser->roles()->attach($adminRole);

        $district = District::create([
            'code' => '3516010',
            'name' => 'Jatirejo',
            'is_active' => true,
        ]);

        $this->mitra = Mitra::create([
            'mitra_code' => 'MTR-3516-0001',
            'name' => 'Zakia Indira Syahda',
            'email' => 'zakia@example.com',
            'phone' => '081234567890',
            'district_id' => $district->id,
            'address' => 'Jl. Merdeka No. 10, Jatirejo',
            'status' => 'active',
            'occupation' => 'Petugas Lapangan BPS',
        ]);

        $this->spk = Spk::create([
            'mitra_id' => $this->mitra->id,
            'spk_number' => '001/3516/SPK.1/XI/2026',
            'contract_date' => '2026-11-03',
            'period_start' => '2026-11-01',
            'period_end' => '2026-11-30',
            'status' => SpkStatus::ACTIVE,
            'created_by' => $this->adminUser->id,
        ]);

        $team = Team::create([
            'code' => 'PROD',
            'name' => 'Produksi',
            'leader_name' => 'Ketua Tim Produksi',
        ]);

        $task = Task::create([
            'team_id' => $team->id,
            'code' => 'SURV-PROD-2026-01',
            'name' => 'Survei Ubinan Padi',
            'default_unit' => 'Dokumen',
            'default_rate' => 50000,
            'is_active' => true,
        ]);

        TaskAssignment::create([
            'spk_id' => $this->spk->id,
            'task_id' => $task->id,
            'mitra_id' => $this->mitra->id,
            'start_date' => '2026-11-01',
            'end_date' => '2026-11-15',
            'volume' => 5,
            'unit_price' => 50000,
            'total_value' => 250000,
            'status' => 'approved',
            'task_name_snapshot' => $task->name,
            'team_name_snapshot' => 'Produksi',
            'unit_snapshot' => $task->default_unit,
            'unit_price_snapshot' => 50000,
            'budget_account_code_snapshot' => '8130.BMA.007',
            'budget_account_name_snapshot' => 'Honor Sensus',
            'created_by' => $this->adminUser->id,
        ]);
    }

    public function test_auto_generate_next_bast_number(): void
    {
        $bastService = app(BastService::class);

        $nextNov = $bastService->generateNextBastNumber('2026-11-15');
        $this->assertEquals('001/3516/BAST.1/XI/2026', $nextNov);

        $nextSep = $bastService->generateNextBastNumber('2026-09-10');
        $this->assertEquals('001/3516/BAST.1/IX/2026', $nextSep);
    }

    public function test_create_bast_via_api(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson('/api/basts', [
            'spk_id' => $this->spk->id,
            'bast_number' => '001/3516/BAST.1/XI/2026',
            'bast_date' => '2026-11-30',
            'notes' => 'Pekerjaan selesai 100%',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.bast_number', '001/3516/BAST.1/XI/2026')
            ->assertJsonPath('data.status.value', BastStatus::DRAFT->value);

        $this->assertDatabaseHas('basts', [
            'spk_id' => $this->spk->id,
            'bast_number' => '001/3516/BAST.1/XI/2026',
        ]);
    }

    public function test_cannot_create_duplicate_bast_for_same_spk(): void
    {
        Sanctum::actingAs($this->adminUser);

        $this->postJson('/api/basts', [
            'spk_id' => $this->spk->id,
            'bast_number' => '001/3516/BAST.1/XI/2026',
            'bast_date' => '2026-11-30',
        ])->assertCreated();

        $dupResponse = $this->postJson('/api/basts', [
            'spk_id' => $this->spk->id,
            'bast_number' => '001/3516/BAST.2/XI/2026',
            'bast_date' => '2026-11-30',
        ]);

        $dupResponse->assertStatus(422);
    }

    public function test_approve_bast(): void
    {
        Sanctum::actingAs($this->adminUser);

        $bastService = app(BastService::class);
        $bast = $bastService->createBast([
            'spk_id' => $this->spk->id,
            'bast_number' => '001/3516/BAST.1/XI/2026',
            'bast_date' => '2026-11-30',
        ], $this->adminUser);

        $response = $this->postJson("/api/basts/{$bast->id}/approve");
        $response->assertOk()
            ->assertJsonPath('data.status.value', BastStatus::APPROVED->value);

        $bast->refresh();
        $this->assertEquals(BastStatus::APPROVED, $bast->status);
        $this->assertEquals($this->adminUser->id, $bast->approved_by);
    }

    public function test_generate_and_download_bast_document(): void
    {
        Sanctum::actingAs($this->adminUser);

        $bastService = app(BastService::class);
        $bast = $bastService->createBast([
            'spk_id' => $this->spk->id,
            'bast_number' => '001/3516/BAST.1/XI/2026',
            'bast_date' => '2026-11-30',
        ], $this->adminUser);

        $docService = app(BastDocumentService::class);
        $path = $docService->generate($bast);

        $bast->refresh();
        $this->assertNotNull($bast->document_path);
        $this->assertNotNull($bast->document_hash);
        $this->assertTrue(Storage::disk('local')->exists($path));

        $downloadRes = $this->get("/api/basts/{$bast->id}/download-document");
        $downloadRes->assertOk();
        $downloadRes->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

        $contentDisposition = $downloadRes->headers->get('Content-Disposition');
        $this->assertStringContainsString('BAST_001-3516-BAST.1-XI-2026_zakia_indira_syahda.docx', $contentDisposition);
    }
}
