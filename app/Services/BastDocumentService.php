<?php

namespace App\Services;

use App\Helpers\TerbilangHelper;
use App\Models\Bast;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PhpOffice\PhpWord\TemplateProcessor;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BastDocumentService
{
    protected string $templatePath;

    public function __construct()
    {
        $primary = resource_path('templates/bast_template.docx');
        $fallback = storage_path('app/templates/bast_template.docx');

        $this->templatePath = file_exists($primary) ? $primary : $fallback;
    }

    /**
     * Generate the BAST Word (.docx) document and store it on disk with a hashed filename.
     */
    public function generate(Bast $bast): string
    {
        if (!file_exists($this->templatePath)) {
            throw new \RuntimeException('Berkas template BAST (bast_template.docx) tidak ditemukan.');
        }

        $bast->loadMissing([
            'spk.mitra.district',
            'spk.taskAssignments.task',
        ]);

        $spk = $bast->spk;
        if (!$spk) {
            throw new \RuntimeException('BAST tidak terhubung dengan SPK yang sah.');
        }

        $template = new TemplateProcessor($this->templatePath);

        // 1. Data Pihak Pertama (PPK)
        $ppkName = config('simata.ppk_name', 'M. Alif Indra Fahmi, S.E');
        $template->setValue('first_party_name', $ppkName);

        // 2. Data BAST & Tanggal
        $template->setValue('bast_number', $bast->bast_number);
        $dateClause = TerbilangHelper::legalDateClause($bast->bast_date ?? now());
        $template->setValue('bast_date_clause', $dateClause);

        // 3. Data Pihak Kedua (Mitra)
        $mitraName = $spk->mitra?->name ?? 'Mitra Statistik';
        $occupation = $spk->occupation ?: ($spk->mitra?->occupation ?: 'Petugas Lapangan Kegiatan Survei Tahun 2026');
        $districtName = $spk->mitra?->district?->name ?? 'Mojokerto';

        $template->setValue('second_party_name', $mitraName);
        $template->setValue('second_party_occupation', $occupation);
        $template->setValue('second_party_district', $districtName);

        // 4. Data Rujukan SPK
        $template->setValue('spk_number', $spk->spk_number);
        $spkContractDateFmt = $spk->contract_date
            ? Carbon::parse($spk->contract_date)->translatedFormat('j F Y')
            : '-';
        $template->setValue('spk_contract_date', $spkContractDateFmt);

        // 5. Tabel Lampiran (9 Baris Tetap Format Resmi BPS)
        $taskAssignments = $spk->taskAssignments;
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

                $template->setValue("task_name_{$r}", $taskName);
                $template->setValue("task_start_{$r}", $startFmt);
                $template->setValue("task_end_{$r}", $endFmt);
                $template->setValue("task_target_volume_{$r}", $vol);
                $template->setValue("task_target_unit_{$r}", $unit);
                // Realisasi dikosongkan untuk diisi tulisan tangan basah oleh mitra statistik
                $template->setValue("task_realized_volume_{$r}", '');
                $template->setValue("task_realized_unit_{$r}", '');
            } else {
                $template->setValue("task_name_{$r}", '');
                $template->setValue("task_start_{$r}", '');
                $template->setValue("task_end_{$r}", '');
                $template->setValue("task_target_volume_{$r}", '');
                $template->setValue("task_target_unit_{$r}", '');
                $template->setValue("task_realized_volume_{$r}", '');
                $template->setValue("task_realized_unit_{$r}", '');
            }
        }

        // 6. Simpan sementara lalu pindahkan ke storage dengan nama hash
        $tempPath = tempnam(sys_get_temp_dir(), 'bast_');
        $template->saveAs($tempPath);

        $fileHash = hash('sha256', $bast->id . '_' . $bast->bast_number . '_' . file_get_contents($tempPath) . '_' . microtime(true));
        $relativeStoragePath = 'bast_documents/' . $fileHash . '.docx';

        Storage::disk('local')->put($relativeStoragePath, file_get_contents($tempPath));
        @unlink($tempPath);

        // Hapus berkas lama jika ada
        if ($bast->document_path && Storage::disk('local')->exists($bast->document_path)) {
            Storage::disk('local')->delete($bast->document_path);
        }

        $bast->update([
            'document_path' => $relativeStoragePath,
            'document_hash' => $fileHash,
            'generated_at' => now(),
        ]);

        return $relativeStoragePath;
    }

    /**
     * Download the BAST document with friendly descriptive filename.
     */
    public function download(Bast $bast): StreamedResponse
    {
        // Selalu generate ulang berkas agar menggunakan versi template dan data terbaru
        $this->generate($bast);
        $bast->refresh();

        $spk = $bast->spk;
        $cleanBastNumber = str_replace(['/', '\\', ' '], '-', $bast->bast_number);
        $cleanMitraName = Str::slug($spk?->mitra?->name ?? 'Mitra', '_');
        $downloadFileName = "BAST_{$cleanBastNumber}_{$cleanMitraName}.docx";

        return Storage::disk('local')->download($bast->document_path, $downloadFileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Access-Control-Expose-Headers' => 'Content-Disposition',
        ]);
    }
}
