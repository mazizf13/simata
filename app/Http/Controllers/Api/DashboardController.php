<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Get dashboard summary statistics.
     */
    public function index(Request $request): JsonResponse
    {
        $year = $request->query('year') ? (int) $request->query('year') : null;
        $month = $request->query('month') ? (int) $request->query('month') : null;
        $teamId = $request->query('team_id') ? (int) $request->query('team_id') : null;

        // Support '2026-11' format if passed as single month string
        if ($request->query('period')) {
            $parts = explode('-', $request->query('period'));
            if (count($parts) === 2) {
                $year = (int) $parts[0];
                $month = (int) $parts[1];
            }
        }

        $stats = $this->reportService->getDashboardSummary($year, $month, $teamId);

        return $this->ok($stats, 'Statistik dashboard berhasil diambil.');
    }
}
