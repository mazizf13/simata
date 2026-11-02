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
}
