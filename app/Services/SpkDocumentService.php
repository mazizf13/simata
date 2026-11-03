<?php

namespace App\Services;

use App\Helpers\TerbilangHelper;
use App\Models\Spk;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PhpOffice\PhpWord\TemplateProcessor;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SpkDocumentService
{
    protected string $templatePath;

    public function __construct()
    {
        $primary = resource_path('templates/spk_template.docx');
        $fallback = storage_path('app/templates/spk_template.docx');

        $this->templatePath = file_exists($primary) ? $primary : $fallback;
    }

    /**
     * Generate the SPK Word (.docx) document and store it on disk with a hashed name.
     */
    public function generate(Spk $spk): string
    {
        if (!file_exists($this->templatePath)) {
            throw new \RuntimeException('Berkas template SPK (spk_template.docx) tidak ditemukan pada sistem.');
        }

        $spk->loadMissing(['mitra.district', 'taskAssignments.task', 'taskAssignments.budgetAccount']);

        $template = new TemplateProcessor($this->templatePath);

        // 1. Data Pihak Pertama (PPK)
        $ppkName = config('simata.ppk_name', 'M. Alif Indra Fahmi, S.E');
        $template->setValue('first_party_name', $ppkName);

        // 2. Data SPK & Tanggal
        $template->setValue('spk_number', $spk->spk_number);
        $dateClause = TerbilangHelper::legalDateClause($spk->contract_date ?? now());
        $template->setValue('contract_date_clause', $dateClause);

        // 3. Data Pihak Kedua (Mitra)
        $mitraName = $spk->mitra?->name ?? 'Mitra Statistik';
        $occupation = $spk->occupation ?: ($spk->mitra?->occupation ?: 'Petugas Badan Pusat Statistik');
        $districtName = $spk->mitra?->district?->name ?? 'Mojokerto';

        $template->setValue('second_party_name', $mitraName);
        $template->setValue('second_party_occupation', $occupation);
        $template->setValue('second_party_district', $districtName);

        // 4. Jangka Waktu Perjanjian (Pasal 3)
        $periodStartFormatted = $spk->period_start ? Carbon::parse($spk->period_start)->translatedFormat('j F Y') : '-';
        $periodEndFormatted = $spk->period_end ? Carbon::parse($spk->period_end)->translatedFormat('j F Y') : '-';
        $template->setValue('period_start', $periodStartFormatted);
        $template->setValue('period_end', $periodEndFormatted);

        // 5. Total Nilai & Terbilang (Pasal 5)
        $taskAssignments = $spk->taskAssignments;
        $totalValue = (float) $taskAssignments->sum('total_value');

        $totalRp = number_format($totalValue, 0, ',', '.');
        $totalWords = TerbilangHelper::rupiah($totalValue);

        $template->setValue('total_value_rp', $totalRp);
        $template->setValue('total_value_words', $totalWords);

        // 6. Tabel Lampiran (Tetap 9 Baris Standar Format Resmi BPS)
        for ($r = 1; $r <= 9; $r++) {
            $assignment = $taskAssignments->values()->get($r - 1);

            if ($assignment) {
                $taskName = $assignment->task_name_snapshot ?: ($assignment->task?->name ?? '-');
                $startFmt = Carbon::parse($assignment->start_date)->translatedFormat('j F Y');
                $endFmt = Carbon::parse($assignment->end_date)->translatedFormat('j F Y');
                $vol = (float) $assignment->volume == (int) $assignment->volume
                    ? (string) (int) $assignment->volume
                    : number_format((float) $assignment->volume, 2, ',', '.');
                $unit = $assignment->unit_snapshot ?: ($assignment->task?->default_unit ?? 'Dokumen');
                $rate = 'Rp. ' . number_format((float) $assignment->unit_price, 0, ',', '.') . ',-';
                $total = 'Rp. ' . number_format((float) $assignment->total_value, 0, ',', '.') . ',-';
                $mak = $assignment->budget_account_code_snapshot ?: ($assignment->budgetAccount?->code ?? '-');

                $template->setValue("task_name_{$r}", $taskName);
                $template->setValue("task_start_{$r}", $startFmt);
                $template->setValue("task_end_{$r}", $endFmt);
                $template->setValue("task_volume_{$r}", $vol);
                $template->setValue("task_unit_{$r}", $unit);
                $template->setValue("task_rate_{$r}", $rate);
                $template->setValue("task_total_{$r}", $total);
                $template->setValue("task_mak_{$r}", $mak);
            } else {
                // Baris kosong dibiarkan bersih tanpa teks kurung kurawal
                $template->setValue("task_name_{$r}", '');
                $template->setValue("task_start_{$r}", '');
                $template->setValue("task_end_{$r}", '');
                $template->setValue("task_volume_{$r}", '');
                $template->setValue("task_unit_{$r}", '');
                $template->setValue("task_rate_{$r}", '');
                $template->setValue("task_total_{$r}", '');
                $template->setValue("task_mak_{$r}", '');
            }
        }

        // 7. Simpan ke berkas sementara lalu pindahkan ke storage dengan hash
        $tempPath = tempnam(sys_get_temp_dir(), 'spk_');
        $template->saveAs($tempPath);

        // Hash nama berkas menggunakan sha256 unik
        $fileHash = hash('sha256', $spk->id . '_' . $spk->spk_number . '_' . file_get_contents($tempPath) . '_' . microtime(true));
        $relativeStoragePath = 'spk_documents/' . $fileHash . '.docx';

        // Pastikan folder di storage disk ada
        Storage::disk('local')->put($relativeStoragePath, file_get_contents($tempPath));
        @unlink($tempPath);

        // Hapus file lama jika ada
        if ($spk->document_path && Storage::disk('local')->exists($spk->document_path)) {
            Storage::disk('local')->delete($spk->document_path);
        }

        // Perbarui record database
        $spk->update([
            'document_path' => $relativeStoragePath,
            'document_hash' => $fileHash,
            'generated_at' => now(),
        ]);

        return $relativeStoragePath;
    }

    /**
     * Download the SPK document with a friendly human-readable filename.
     */
    public function download(Spk $spk): StreamedResponse
    {
        // Jika dokumen belum pernah di-generate atau file terhapus, generate baru
        if (!$spk->document_path || !Storage::disk('local')->exists($spk->document_path)) {
            $this->generate($spk);
            $spk->refresh();
        }

        // Format nama berkas unduhan yang rapi:
        // Contoh: SPK_001-3516-SPK.48-IX-2026_Zakia_Indira_Syahda.docx
        $cleanSpkNumber = str_replace(['/', '\\', ' '], '-', $spk->spk_number);
        $cleanMitraName = Str::slug($spk->mitra?->name ?? 'Mitra', '_');
        $downloadFileName = "SPK_{$cleanSpkNumber}_{$cleanMitraName}.docx";

        return Storage::disk('local')->download($spk->document_path, $downloadFileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Access-Control-Expose-Headers' => 'Content-Disposition',
        ]);
    }
}
