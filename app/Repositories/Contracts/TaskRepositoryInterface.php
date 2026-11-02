<?php

namespace App\Repositories\Contracts;

use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface TaskRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find task by code.
     *
     * @param string $code
     * @return Task|null
     */
    public function findByCode(string $code): ?Task;

    /**
     * Get active tasks, optionally filtered by team.
     *
     * @param int|null $teamId
     * @return Collection<int, Task>
     */
    public function getActiveTasksByTeam(?int $teamId = null): Collection;

    /**
     * Paginate tasks with filtering.
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function paginateTasks(array $filters = [], int $perPage = 15): LengthAwarePaginator;
}
