<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Export monthly mitra recap to CSV.
     */
    public function monthly(Request $request): Response
    {
        $year = $request->query('year') ? (int) $request->query('year') : (int) date('Y');
        $month = $request->query('month') ? (int) $request->query('month') : (int) date('n');

        $filters = $request->only([
            'search',
            'district_id',
            'team_id',
        ]);

        $csvContent = $this->reportService->exportMonthlyMitraCsv($year, $month, $filters);
        $filename = sprintf('rekap-honor-mitra-%04d-%02d.csv', $year, $month);

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Export team recap to CSV.
     */
    public function teams(Request $request): Response
    {
        $year = $request->query('year') ? (int) $request->query('year') : (int) date('Y');
        $month = $request->query('month') ? (int) $request->query('month') : (int) date('n');

        $csvContent = $this->reportService->exportTeamRecapCsv($year, $month);
        $filename = sprintf('rekap-penugasan-tim-%04d-%02d.csv', $year, $month);

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Export detailed task assignments to CSV.
     */
    public function assignments(Request $request): Response
    {
        $year = $request->query('year') ? (int) $request->query('year') : (int) date('Y');
        $month = $request->query('month') ? (int) $request->query('month') : (int) date('n');

        $filters = $request->only([
            'team_id',
            'status',
        ]);

        $csvContent = $this->reportService->exportAssignmentsCsv($year, $month, $filters);
        $filename = sprintf('detail-penugasan-%04d-%02d.csv', $year, $month);

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
