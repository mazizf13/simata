<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ReportRepositoryInterface
{
    /**
     * Get aggregate statistics for dashboard by month/year and optional team.
     *
     * @param int $year
     * @param int $month
     * @param int|null $teamId
     * @return array<string, mixed>
     */
    public function getDashboardStats(int $year, int $month, ?int $teamId = null): array;

    /**
     * Get paginated monthly recap per mitra.
     *
     * @param int $year
     * @param int $month
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getMonthlyMitraRecap(int $year, int $month, array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get unpaginated monthly recap per mitra for export.
     *
     * @param int $year
     * @param int $month
     * @param array<string, mixed> $filters
     * @return \Illuminate\Support\Collection
     */
    public function getAllMonthlyMitraRecap(int $year, int $month, array $filters = []): \Illuminate\Support\Collection;

    /**
     * Get team recap summary for the specified month/year.
     *
     * @param int $year
     * @param int $month
     * @return \Illuminate\Support\Collection
     */
    public function getTeamRecap(int $year, int $month): \Illuminate\Support\Collection;

    /**
     * Get drill-down hierarchy for a specific team: Team -> Tasks -> Assignments -> Mitra.
     *
     * @param int $teamId
     * @param int $year
     * @param int $month
     * @return array<string, mixed>
     */
    public function getTeamRecapDrilldown(int $teamId, int $year, int $month): array;

    /**
     * Get calendar assignments within the specified month/year range.
     * Supports cross-month spanning based on start_date and end_date.
     *
     * @param int $year
     * @param int $month
     * @param int|null $teamId
     * @param int|null $taskId
     * @return Collection
     */
    public function getCalendarEvents(int $year, int $month, ?int $teamId = null, ?int $taskId = null): Collection;

    /**
     * Get assignments grouped by status columns for Kanban view.
     *
     * @param int $year
     * @param int $month
     * @param int|null $teamId
     * @param string|null $search
     * @return array<string, mixed>
     */
    public function getKanbanAssignments(int $year, int $month, ?int $teamId = null, ?string $search = null): array;
}
