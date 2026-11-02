<?php

namespace App\Services;

use App\Models\District;
use App\Models\TaskAssignment;
use App\Models\Team;
use App\Repositories\Contracts\ReportRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ReportService
{
    public function __construct(
        protected ReportRepositoryInterface $reportRepository
    ) {}

    /**
     * Get dashboard summary metrics and statistics.
     *
     * @param int|null $year
     * @param int|null $month
     * @param int|null $teamId
     * @return array<string, mixed>
     */
    public function getDashboardSummary(?int $year = null, ?int $month = null, ?int $teamId = null): array
    {
        $year = $year ?: (int) date('Y');
        $month = $month ?: (int) date('n');

        return $this->reportRepository->getDashboardStats($year, $month, $teamId);
    }

    /**
     * Get monthly recap per mitra.
     *
     * @param int|null $year
     * @param int|null $month
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getMonthlyMitraRecap(?int $year = null, ?int $month = null, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $year = $year ?: (int) date('Y');
        $month = $month ?: (int) date('n');

        return $this->reportRepository->getMonthlyMitraRecap($year, $month, $filters, $perPage);
    }

    /**
     * Get team recap for the period.
     *
     * @param int|null $year
     * @param int|null $month
     * @return Collection
     */
    public function getTeamRecap(?int $year = null, ?int $month = null): Collection
    {
        $year = $year ?: (int) date('Y');
        $month = $month ?: (int) date('n');

        return $this->reportRepository->getTeamRecap($year, $month);
    }

    /**
     * Get drill-down hierarchy for a specific team.
     *
     * @param int $teamId
     * @param int|null $year
     * @param int|null $month
     * @return array<string, mixed>
     */
    public function getTeamRecapDrilldown(int $teamId, ?int $year = null, ?int $month = null): array
    {
        $year = $year ?: (int) date('Y');
        $month = $month ?: (int) date('n');

        return $this->reportRepository->getTeamRecapDrilldown($teamId, $year, $month);
    }

    /**
     * Get calendar events spanning the month.
     *
     * @param int|null $year
     * @param int|null $month
     * @param int|null $teamId
     * @param int|null $taskId
     * @return Collection
     */
    public function getCalendarEvents(?int $year = null, ?int $month = null, ?int $teamId = null, ?int $taskId = null): Collection
    {
        $year = $year ?: (int) date('Y');
        $month = $month ?: (int) date('n');

        return $this->reportRepository->getCalendarEvents($year, $month, $teamId, $taskId);
    }

    /**
     * Get assignments grouped by status for Kanban view.
     *
     * @param int|null $year
     * @param int|null $month
     * @param int|null $teamId
     * @param string|null $search
     * @return array<string, mixed>
     */
    public function getKanbanAssignments(?int $year = null, ?int $month = null, ?int $teamId = null, ?string $search = null): array
    {
        $year = $year ?: (int) date('Y');
        $month = $month ?: (int) date('n');

        return $this->reportRepository->getKanbanAssignments($year, $month, $teamId, $search);
    }

    /**
     * Generate CSV export content for monthly mitra recap.
     *
     * @param int $year
     * @param int $month
     * @param array<string, mixed> $filters
     * @return string
     */
    public function exportMonthlyMitraCsv(int $year, int $month, array $filters = []): string
    {
        $monthName = Carbon::createFromDate($year, $month, 1)->translatedFormat('F');
        $teamName = !empty($filters['team_id']) ? Team::find($filters['team_id'])?->name : 'Semua Tim';
        $districtName = !empty($filters['district_id']) ? District::find($filters['district_id'])?->name : 'Semua Kecamatan';

        $data = $this->reportRepository->getAllMonthlyMitraRecap($year, $month, $filters);

        $output = fopen('php://temp', 'r+');

        // UTF-8 BOM for Excel compatibility
        fputs($output, "\xEF\xBB\xBF");

        // Header Metadata
        fputcsv($output, ['SISTEM INFORMASI MANAJEMEN MITRA STATISTIK (SIMATA) - BPS KABUPATEN MOJOKERTO'], ';');
        fputcsv($output, ['LAPORAN REKAPITULASI HONOR DAN BEBAN TUGAS MITRA BULANAN'], ';');
        fputcsv($output, ["Periode Pembebanan: {$monthName} {$year}"], ';');
        fputcsv($output, ["Waktu Pembuatan: " . now()->format('d/m/Y H:i:s') . ' WIB'], ';');
        fputcsv($output, ["Filter Tim: {$teamName} | Filter Wilayah: {$districtName}"], ';');
        fputcsv($output, [], ';');

        // Table Header
        fputcsv($output, [
            'No',
            'Kode Mitra',
            'Nama Mitra',
            'Kecamatan',
            'Nomor HP',
            'Jumlah Tugas (Maks 10)',
            'Total Honor Terhitung (Rp)',
            'Sisa Kuota Tugas',
            'Sisa Batas Honor (Rp)',
            'Status Batas Kuota',
        ], ';');

        $no = 1;
        $totalAllHonor = 0;
        $totalAllTasks = 0;

        foreach ($data as $row) {
            $totalAllTasks += $row['total_tasks'];
            $totalAllHonor += $row['total_honor'];

            fputcsv($output, [
                $no++,
                $row['mitra_code'],
                $row['name'],
                $row['district'],
                $row['phone'],
                $row['total_tasks'],
                number_format($row['total_honor'], 0, ',', '.'),
                $row['remaining_tasks'],
                number_format($row['remaining_honor'], 0, ',', '.'),
                $row['limit_status'],
            ], ';');
        }

        // Summary row
        fputcsv($output, [], ';');
        fputcsv($output, [
            'TOTAL KESELURUHAN',
            '',
            '',
            '',
            '',
            $totalAllTasks,
            number_format($totalAllHonor, 0, ',', '.'),
            '',
            '',
            '',
        ], ';');

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Generate CSV export content for team recap.
     *
     * @param int $year
     * @param int $month
     * @return string
     */
    public function exportTeamRecapCsv(int $year, int $month): string
    {
        $monthName = Carbon::createFromDate($year, $month, 1)->translatedFormat('F');
        $data = $this->reportRepository->getTeamRecap($year, $month);

        $output = fopen('php://temp', 'r+');
        fputs($output, "\xEF\xBB\xBF");

        fputcsv($output, ['SISTEM INFORMASI MANAJEMEN MITRA STATISTIK (SIMATA) - BPS KABUPATEN MOJOKERTO'], ';');
        fputcsv($output, ['LAPORAN REKAPITULASI PENUGASAN DAN HONOR PER TIM KERJA'], ';');
        fputcsv($output, ["Periode Pembebanan: {$monthName} {$year}"], ';');
        fputcsv($output, ["Waktu Pembuatan: " . now()->format('d/m/Y H:i:s') . ' WIB'], ';');
        fputcsv($output, [], ';');

        fputcsv($output, [
            'No',
            'Kode Tim',
            'Nama Tim Kerja',
            'Jumlah Kegiatan Survei',
            'Jumlah Mitra Terlibat',
            'Total Beban Penugasan',
            'Total Nilai Honor (Rp)',
        ], ';');

        $no = 1;
        $totalAllAssignments = 0;
        $totalAllHonor = 0;

        foreach ($data as $row) {
            $totalAllAssignments += $row['assignments_count'];
            $totalAllHonor += $row['total_honor'];

            fputcsv($output, [
                $no++,
                $row['team_code'],
                $row['team_name'],
                $row['tasks_count'],
                $row['mitras_count'],
                $row['assignments_count'],
                number_format($row['total_honor'], 0, ',', '.'),
            ], ';');
        }

        fputcsv($output, [], ';');
        fputcsv($output, [
            'TOTAL KESELURUHAN',
            '',
            '',
            '',
            '',
            $totalAllAssignments,
            number_format($totalAllHonor, 0, ',', '.'),
        ], ';');

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Generate CSV export content for detailed assignments.
     *
     * @param int $year
     * @param int $month
     * @param array<string, mixed> $filters
     * @return string
     */
    public function exportAssignmentsCsv(int $year, int $month, array $filters = []): string
    {
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth()->toDateString();
        $endOfMonth = Carbon::createFromDate($year, $month, 1)->endOfMonth()->toDateString();
        $monthName = Carbon::createFromDate($year, $month, 1)->translatedFormat('F');

        $query = TaskAssignment::with([
            'mitra:id,mitra_code,name,phone,district_id',
            'mitra.district:id,name',
            'task:id,task_code,name,team_id',
            'task.team:id,name',
            'budgetAccount:id,code,name',
            'spk:id,spk_number',
        ])
        ->whereBetween('start_date', [$startOfMonth, $endOfMonth]);

        if (!empty($filters['team_id'])) {
            $query->whereHas('task', fn ($q) => $q->where('team_id', $filters['team_id']));
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $assignments = $query->orderBy('start_date', 'asc')->get();

        $output = fopen('php://temp', 'r+');
        fputs($output, "\xEF\xBB\xBF");

        fputcsv($output, ['SISTEM INFORMASI MANAJEMEN MITRA STATISTIK (SIMATA) - BPS KABUPATEN MOJOKERTO'], ';');
        fputcsv($output, ['RINCIAN DETAIL TRANSAKSI PENUGASAN MITRA STATISTIK'], ';');
        fputcsv($output, ["Periode Pembebanan: {$monthName} {$year}"], ';');
        fputcsv($output, ["Waktu Pembuatan: " . now()->format('d/m/Y H:i:s') . ' WIB'], ';');
        fputcsv($output, [], ';');

        fputcsv($output, [
            'No',
            'ID Tugas',
            'Nama Kegiatan Survei',
            'Tim Penanggung Jawab',
            'Kode Mitra',
            'Nama Mitra Statistik',
            'Kecamatan Mitra',
            'Nomor SPK',
            'Tanggal Mulai',
            'Tanggal Selesai',
            'Volume',
            'Satuan',
            'Harga Satuan (Rp)',
            'Total Nilai Perjanjian (Rp)',
            'Akun Anggaran (MAK)',
            'Status Penugasan',
        ], ';');

        $no = 1;
        $totalAll = 0;

        foreach ($assignments as $a) {
            $totalAll += (float) $a->total_value;

            fputcsv($output, [
                $no++,
                $a->id,
                $a->task_name_snapshot ?? $a->task?->name,
                $a->team_name_snapshot ?? $a->task?->team?->name,
                $a->mitra?->mitra_code,
                $a->mitra?->name,
                $a->mitra?->district?->name ?? '-',
                $a->spk?->spk_number ?? 'Tanpa SPK',
                $a->start_date ? $a->start_date->toDateString() : '-',
                $a->end_date ? $a->end_date->toDateString() : '-',
                $a->volume,
                $a->unit_snapshot,
                number_format($a->unit_price, 0, ',', '.'),
                number_format($a->total_value, 0, ',', '.'),
                $a->budget_account_code_snapshot ?? $a->budgetAccount?->code ?? '-',
                $a->status->label(),
            ], ';');
        }

        fputcsv($output, [], ';');
        fputcsv($output, [
            'TOTAL KESELURUHAN',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            number_format($totalAll, 0, ',', '.'),
            '',
            '',
        ], ';');

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }
}
