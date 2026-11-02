<?php

namespace App\Services;

use App\Models\Mitra;
use App\Repositories\Contracts\TaskAssignmentRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class AssignmentLimitService
{
    public const MAX_TASKS_PER_MONTH = 10;
    public const MAX_HONOR_PER_MONTH = 4000000.00;

    protected static array $indonesianMonths = [
        1 => 'Januari',
        2 => 'Februari',
        3 => 'Maret',
        4 => 'April',
        5 => 'Mei',
        6 => 'Juni',
        7 => 'Juli',
        8 => 'Agustus',
        9 => 'September',
        10 => 'Oktober',
        11 => 'November',
        12 => 'Desember',
    ];

    public function __construct(
        protected TaskAssignmentRepositoryInterface $assignmentRepository
    ) {}

    /**
     * Lock a single mitra row for update within a transaction.
     */
    public function lockMitra(int|string $mitraId): Mitra
    {
        /** @var Mitra */
        return Mitra::where('id', $mitraId)->lockForUpdate()->firstOrFail();
    }

    /**
     * Lock multiple mitra rows sorted by ID ascending to avoid deadlocks.
     *
     * @param array<int|string> $mitraIds
     * @return Collection<int, Mitra>
     */
    public function lockMitras(array $mitraIds): Collection
    {
        $uniqueSortedIds = collect($mitraIds)
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->sort()
            ->values()
            ->all();

        return Mitra::whereIn('id', $uniqueSortedIds)
            ->orderBy('id', 'asc')
            ->lockForUpdate()
            ->get();
    }

    /**
     * Format Rupiah without decimals for friendly error messages.
     */
    public function formatRupiah(float $amount): string
    {
        return 'Rp' . number_format($amount, 0, ',', '.');
    }

    /**
     * Check assignment and honor limits for a mitra in the month of start_date.
     *
     * @param int|string $mitraId
     * @param string $startDate (Y-m-d)
     * @param float $additionalHonor (volume * unit_price)
     * @param int $additionalTasks (usually 1)
     * @param int|string|null $excludeAssignmentId
     * @return array{
     *     allowed: bool,
     *     period_month: int,
     *     period_year: int,
     *     period_label: string,
     *     current_tasks: int,
     *     current_honor: float,
     *     projected_tasks: int,
     *     projected_honor: float,
     *     remaining_tasks: int,
     *     remaining_honor: float,
     *     task_limit_exceeded: bool,
     *     honor_limit_exceeded: bool,
     *     reason: string|null
     * }
     */
    public function checkLimits(
        int|string $mitraId,
        string $startDate,
        float $additionalHonor,
        int $additionalTasks = 1,
        int|string|null $excludeAssignmentId = null
    ): array {
        $date = Carbon::parse($startDate);
        $year = $date->year;
        $month = $date->month;
        $monthName = self::$indonesianMonths[$month] ?? $date->translatedFormat('F');
        $periodLabel = "{$monthName} {$year}";

        // Aggregate current counted tasks & honor
        $currentStats = $this->assignmentRepository->getCountedMonthlyStats(
            $mitraId,
            $year,
            $month,
            $excludeAssignmentId
        );

        $currentTasks = $currentStats['task_count'];
        $currentHonor = $currentStats['total_honor'];

        $projectedTasks = $currentTasks + $additionalTasks;
        $projectedHonor = round($currentHonor + $additionalHonor, 2);

        $taskLimitExceeded = $projectedTasks > self::MAX_TASKS_PER_MONTH;
        $honorLimitExceeded = $projectedHonor > self::MAX_HONOR_PER_MONTH;

        // Operator: OR — rejected if EITHER limit is strictly exceeded (> limit)
        $allowed = !$taskLimitExceeded && !$honorLimitExceeded;

        $reason = null;
        if ($taskLimitExceeded && $honorLimitExceeded) {
            $reason = "Batas jumlah penugasan dan honor bulanan terlampaui. Proyeksi menjadi {$projectedTasks} tugas ({$this->formatRupiah($projectedHonor)}) pada {$periodLabel}, melebihi batas maksimal " . self::MAX_TASKS_PER_MONTH . ' tugas atau ' . $this->formatRupiah(self::MAX_HONOR_PER_MONTH) . '.';
        } elseif ($taskLimitExceeded) {
            $reason = "Batas jumlah penugasan tercapai. Mitra sudah memiliki {$currentTasks} penugasan pada {$periodLabel}, penambahan {$additionalTasks} tugas menyebabkan total menjadi {$projectedTasks} (maksimal " . self::MAX_TASKS_PER_MONTH . ' tugas).';
        } elseif ($honorLimitExceeded) {
            $reason = "Batas honor bulanan terlampaui. Total setelah penugasan menjadi {$this->formatRupiah($projectedHonor)} pada {$periodLabel}, sedangkan batas maksimal {$this->formatRupiah(self::MAX_HONOR_PER_MONTH)}.";
        }

        $remainingTasks = max(0, self::MAX_TASKS_PER_MONTH - $currentTasks);
        $remainingHonor = max(0.0, self::MAX_HONOR_PER_MONTH - $currentHonor);

        return [
            'allowed' => $allowed,
            'period_month' => $month,
            'period_year' => $year,
            'period_label' => $periodLabel,
            'current_tasks' => $currentTasks,
            'current_honor' => $currentHonor,
            'projected_tasks' => $projectedTasks,
            'projected_honor' => $projectedHonor,
            'remaining_tasks' => $remainingTasks,
            'remaining_honor' => $remainingHonor,
            'task_limit_exceeded' => $taskLimitExceeded,
            'honor_limit_exceeded' => $honorLimitExceeded,
            'reason' => $reason,
        ];
    }

    /**
     * Validate limits and throw a formal ValidationException if rejected.
     *
     * @param int|string $mitraId
     * @param string $startDate
     * @param float $additionalHonor
     * @param int $additionalTasks
     * @param int|string|null $excludeAssignmentId
     * @return array
     * @throws ValidationException
     */
    public function validateLimitsOrFail(
        int|string $mitraId,
        string $startDate,
        float $additionalHonor,
        int $additionalTasks = 1,
        int|string|null $excludeAssignmentId = null
    ): array {
        $check = $this->checkLimits($mitraId, $startDate, $additionalHonor, $additionalTasks, $excludeAssignmentId);

        if (!$check['allowed']) {
            throw ValidationException::withMessages([
                'limits' => [$check['reason']],
            ]);
        }

        return $check;
    }
}
