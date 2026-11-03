<?php

namespace App\Services;

use App\Models\Task;
use App\Repositories\Contracts\TaskRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class TaskService
{
    public function __construct(
        protected TaskRepositoryInterface $taskRepository
    ) {}

    public function getPaginatedTasks(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->taskRepository->paginateTasks($filters, $perPage);
    }

    /**
     * @return Collection<int, Task>
     */
    public function getActiveTasksByTeam(?int $teamId = null): Collection
    {
        return $this->taskRepository->getActiveTasksByTeam($teamId);
    }

    public function getTaskById(int|string $id): Task
    {
        /** @var Task */
        return $this->taskRepository->findOrFail($id, ['*'], ['team', 'defaultBudgetAccount']);
    }

    public function createTask(array $data): Task
    {
        /** @var Task */
        return $this->taskRepository->create($data);
    }

    public function updateTask(int|string $id, array $data): Task
    {
        /** @var Task */
        return $this->taskRepository->update($id, $data);
    }

    public function deactivateTask(int|string $id): Task
    {
        /** @var Task */
        $task = $this->taskRepository->findOrFail($id);
        $task->update(['is_active' => false]);
        return $task;
    }

    /**
     * Auto-generate sequential task code per team: SURV-{TEAM_CODE}-{YEAR}-{INDEX}
     */
    public function generateNextCode(?int $teamId = null): string
    {
        $team = $teamId ? \App\Models\Team::find($teamId) : null;
        $teamCode = $team ? strtoupper(trim($team->code)) : 'BPS';
        $year = date('Y');

        $prefix = "SURV-{$teamCode}-{$year}-";

        $existingCodes = Task::query()
            ->where('code', 'like', "{$prefix}%")
            ->pluck('code');

        $maxSeq = 0;
        foreach ($existingCodes as $c) {
            if (preg_match('/' . preg_quote($prefix, '/') . '(\d+)$/i', $c, $matches)) {
                $maxSeq = max($maxSeq, (int) $matches[1]);
            }
        }

        $nextSeq = str_pad((string) ($maxSeq + 1), 2, '0', STR_PAD_LEFT);

        return "{$prefix}{$nextSeq}";
    }
}
