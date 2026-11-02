<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Get monthly recap per mitra.
     */
    public function monthly(Request $request): JsonResponse
    {
        $year = $request->query('year') ? (int) $request->query('year') : (int) date('Y');
        $month = $request->query('month') ? (int) $request->query('month') : (int) date('n');
        $perPage = (int) $request->query('per_page', 15);

        $filters = $request->only([
            'search',
            'district_id',
            'team_id',
            'limit_status',
            'mitra_status',
        ]);

        $recap = $this->reportService->getMonthlyMitraRecap($year, $month, $filters, $perPage);

        return response()->json([
            'success' => true,
            'message' => 'Rekapitulasi mitra bulanan berhasil diambil.',
            'data' => $recap->items(),
            'meta' => [
                'current_page' => $recap->currentPage(),
                'last_page' => $recap->lastPage(),
                'per_page' => $recap->perPage(),
                'total' => $recap->total(),
            ],
            'period' => [
                'year' => $year,
                'month' => $month,
            ],
        ]);
    }

    /**
     * Get team recap for the period.
     */
    public function teams(Request $request): JsonResponse
    {
        $year = $request->query('year') ? (int) $request->query('year') : (int) date('Y');
        $month = $request->query('month') ? (int) $request->query('month') : (int) date('n');

        $teams = $this->reportService->getTeamRecap($year, $month);

        return $this->ok([
            'period' => [
                'year' => $year,
                'month' => $month,
            ],
            'teams' => $teams,
        ], 'Rekapitulasi per tim berhasil diambil.');
    }

    /**
     * Get drilldown hierarchy for a specific team.
     */
    public function teamDrilldown(Request $request, int|string $teamId): JsonResponse
    {
        $year = $request->query('year') ? (int) $request->query('year') : (int) date('Y');
        $month = $request->query('month') ? (int) $request->query('month') : (int) date('n');

        $drilldown = $this->reportService->getTeamRecapDrilldown((int) $teamId, $year, $month);

        return $this->ok($drilldown, 'Data drill-down tim berhasil diambil.');
    }

    /**
     * Get assignments formatted for calendar view.
     */
    public function calendar(Request $request): JsonResponse
    {
        $year = $request->query('year') ? (int) $request->query('year') : (int) date('Y');
        $month = $request->query('month') ? (int) $request->query('month') : (int) date('n');
        $teamId = $request->query('team_id') ? (int) $request->query('team_id') : null;
        $taskId = $request->query('task_id') ? (int) $request->query('task_id') : null;

        $events = $this->reportService->getCalendarEvents($year, $month, $teamId, $taskId);

        $formatted = $events->map(fn ($item) => [
            'id' => $item->id,
            'title' => ($item->task_name_snapshot ?? $item->task?->name) . ' - ' . ($item->mitra?->name ?? '-'),
            'task_name' => $item->task_name_snapshot ?? $item->task?->name,
            'mitra_name' => $item->mitra?->name,
            'mitra_code' => $item->mitra?->mitra_code,
            'team_name' => $item->team_name_snapshot ?? $item->task?->team?->name,
            'team_id' => $item->task?->team_id,
            'start' => $item->start_date ? $item->start_date->toDateString() : null,
            'end' => $item->end_date ? $item->end_date->toDateString() : null,
            'volume' => (float) $item->volume,
            'unit' => $item->unit_snapshot,
            'total_value' => (float) $item->total_value,
            'formatted_total_value' => 'Rp ' . number_format($item->total_value, 0, ',', '.'),
            'status' => $item->status->value,
            'status_label' => $item->status->label(),
            'badge_variant' => $item->status->badgeVariant(),
        ]);

        return $this->ok($formatted, 'Data kalender penugasan berhasil diambil.');
    }

    /**
     * Get assignments grouped by status for Kanban view.
     */
    public function kanban(Request $request): JsonResponse
    {
        $year = $request->query('year') ? (int) $request->query('year') : (int) date('Y');
        $month = $request->query('month') ? (int) $request->query('month') : (int) date('n');
        $teamId = $request->query('team_id') ? (int) $request->query('team_id') : null;
        $search = $request->query('search') ? (string) $request->query('search') : null;

        $columns = $this->reportService->getKanbanAssignments($year, $month, $teamId, $search);

        return $this->ok($columns, 'Data Kanban penugasan berhasil diambil.');
    }
}
