<?php

namespace App\Services;

use App\Enums\AssignmentStatus;
use App\Models\TaskAssignment;
use App\Repositories\Contracts\TaskAssignmentRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class HonorCalculationService
{
    public function __construct(
        protected TaskAssignmentRepositoryInterface $assignmentRepository
    ) {}

    /**
     * Get monthly quota and honor summary for a mitra in a specific month and year.
     *
     * @param int|string $mitraId
     * @param int $year
     * @param int $month
     * @return array{
     *     year: int,
     *     month: int,
     *     month_name: string,
     *     total_tasks: int,
     *     total_honor: float,
     *     max_tasks: int,
     *     max_honor: float,
     *     remaining_tasks: int,
     *     remaining_honor: float,
     *     task_percentage: float,
     *     honor_percentage: float
     * }
     */
    public function getMonthlySummary(int|string $mitraId, int $year, int $month): array
    {
        $stats = $this->assignmentRepository->getCountedMonthlyStats($mitraId, $year, $month);

        $taskCount = $stats['task_count'];
        $totalHonor = $stats['total_honor'];

        $maxTasks = AssignmentLimitService::MAX_TASKS_PER_MONTH;
        $maxHonor = AssignmentLimitService::MAX_HONOR_PER_MONTH;

        $remainingTasks = max(0, $maxTasks - $taskCount);
        $remainingHonor = max(0.0, round($maxHonor - $totalHonor, 2));

        $taskPercentage = min(100.0, round(($taskCount / $maxTasks) * 100, 1));
        $honorPercentage = min(100.0, round(($totalHonor / $maxHonor) * 100, 1));

        $date = Carbon::create($year, $month, 1);

        return [
            'year' => $year,
            'month' => $month,
            'month_name' => $date->translatedFormat('F'),
            'total_tasks' => $taskCount,
            'total_honor' => $totalHonor,
            'max_tasks' => $maxTasks,
            'max_honor' => $maxHonor,
            'remaining_tasks' => $remainingTasks,
            'remaining_honor' => $remainingHonor,
            'task_percentage' => $taskPercentage,
            'honor_percentage' => $honorPercentage,
        ];
    }

    /**
     * Get 12-month honor breakdown for a mitra in a given year.
     *
     * @param int|string $mitraId
     * @param int $year
     * @return array<int, array>
     */
    public function getYearlyBreakdown(int|string $mitraId, int $year): array
    {
        $breakdown = [];
        for ($m = 1; $m <= 12; $m++) {
            $breakdown[] = $this->getMonthlySummary($mitraId, $year, $m);
        }

        return $breakdown;
    }
}
