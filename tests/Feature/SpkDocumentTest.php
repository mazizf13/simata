<?php

namespace Tests\Feature;

use App\Enums\SpkStatus;
use App\Enums\UserRole;
use App\Helpers\TerbilangHelper;
use App\Models\District;
use App\Models\Mitra;
use App\Models\Role;
use App\Models\Spk;
use App\Models\User;
use App\Services\SpkDocumentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SpkDocumentTest extends TestCase
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
            'spk_number' => '001/3516/SPK.48/XI/2026',
            'contract_date' => '2026-11-03',
            'period_start' => '2026-11-01',
            'period_end' => '2026-11-30',
            'status' => SpkStatus::ACTIVE,
            'created_by' => $this->adminUser->id,
        ]);
    }

    public function test_terbilang_helper_converts_number_to_rupiah_words(): void
    {
        $this->assertEquals('Tujuh Ratus Dua Puluh Delapan Ribu Rupiah', TerbilangHelper::rupiah(728000));
        $this->assertEquals('Satu Juta Lima Ratus Ribu Rupiah', TerbilangHelper::rupiah(1500000));
        $this->assertEquals('Empat Juta Rupiah', TerbilangHelper::rupiah(4000000));
        $this->assertEquals('Nol Rupiah', TerbilangHelper::rupiah(0));
    }

    public function test_terbilang_helper_formats_legal_date_clause(): void
    {
        $clause = TerbilangHelper::legalDateClause('2026-09-30');
        $this->assertStringContainsString('rabu', $clause);
        $this->assertStringContainsString('tiga puluh', $clause);
        $this->assertStringContainsString('september', $clause);
        $this->assertStringContainsString('dua ribu dua puluh enam', $clause);
    }

    public function test_spk_document_service_generates_file_with_hashed_filename(): void
    {
        $service = app(SpkDocumentService::class);
        $path = $service->generate($this->spk);

        $this->spk->refresh();

        $this->assertNotNull($this->spk->document_path);
        $this->assertNotNull($this->spk->document_hash);
        $this->assertNotNull($this->spk->generated_at);

        // Path is in spk_documents/{hash}.docx
        $this->assertStringStartsWith('spk_documents/', $path);
        $this->assertStringEndsWith('.docx', $path);
        $this->assertEquals(64, strlen($this->spk->document_hash));

        // File exists on storage disk
        $this->assertTrue(Storage::disk('local')->exists($path));
    }

    public function test_generate_document_api_endpoint(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson("/api/spks/{$this->spk->id}/generate-document");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.has_document', true);

        $this->spk->refresh();
        $this->assertNotNull($this->spk->document_hash);
    }

    public function test_download_document_api_endpoint_returns_file_with_clean_name(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->get("/api/spks/{$this->spk->id}/download-document");

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

        $contentDisposition = $response->headers->get('Content-Disposition');
        $this->assertStringContainsString('SPK_001-3516-SPK.48-XI-2026_zakia_indira_syahda.docx', $contentDisposition);
    }
}
