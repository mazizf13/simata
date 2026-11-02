<?php

namespace App\Repositories\Contracts;

use App\Models\TaskAssignment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface TaskAssignmentRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get paginated assignments with filtering, search, and eager loading.
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function paginateAssignments(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get assignments for a specific mitra, optionally constrained to month/year.
     *
     * @param int|string $mitraId
     * @param int|null $year
     * @param int|null $month
     * @return Collection<int, TaskAssignment>
     */
    public function getAssignmentsByMitra(int|string $mitraId, ?int $year = null, ?int $month = null): Collection;

    /**
     * Aggregate currently counted tasks and honor for a mitra in a specific start_date month.
     * Counted statuses: approved, active, completed.
     *
     * @param int|string $mitraId
     * @param int $year
     * @param int $month
     * @param int|string|null $excludeAssignmentId (useful when updating an existing assignment)
     * @return array{task_count: int, total_honor: float}
     */
    public function getCountedMonthlyStats(int|string $mitraId, int $year, int $month, int|string|null $excludeAssignmentId = null): array;
}
