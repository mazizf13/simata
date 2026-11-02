<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mitra;
use App\Services\HonorCalculationService;
use App\Traits\ApiResponses;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class HonorCalculationController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected HonorCalculationService $honorService
    ) {}

    /**
     * Get monthly quota and honor summary for a specific mitra.
     */
    public function summary(Request $request, int|string $id): JsonResponse
    {
        Gate::authorize('view', Mitra::class);

        $now = Carbon::now();
        $year = (int) $request->input('year', $now->year);
        $month = (int) $request->input('month', $now->month);

        $summary = $this->honorService->getMonthlySummary($id, $year, $month);

        return $this->ok($summary, 'Ringkasan kuota dan honor bulanan mitra berhasil diambil.');
    }

    /**
     * Get 12-month honor breakdown for a mitra in a given year.
     */
    public function breakdown(Request $request, int|string $id): JsonResponse
    {
        Gate::authorize('view', Mitra::class);

        $year = (int) $request->input('year', Carbon::now()->year);

        $breakdown = $this->honorService->getYearlyBreakdown($id, $year);

        return $this->ok($breakdown, 'Rincian akumulasi honor tahunan mitra berhasil diambil.');
    }
}
