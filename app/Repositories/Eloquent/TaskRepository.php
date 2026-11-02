<?php

namespace App\Repositories\Eloquent;

use App\Models\Task;
use App\Repositories\Contracts\TaskRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class TaskRepository extends BaseRepository implements TaskRepositoryInterface
{
    public function __construct(Task $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function findByCode(string $code): ?Task
    {
        /** @var Task|null */
        return $this->model->where('code', $code)->first();
    }

    /**
     * @inheritDoc
     */
    public function getActiveTasksByTeam(?int $teamId = null): Collection
    {
        $query = $this->model->where('is_active', true)->with(['team', 'defaultBudgetAccount']);

        if ($teamId) {
            $query->where('team_id', $teamId);
        }

        /** @var Collection<int, Task> */
        return $query->orderBy('name', 'asc')->get();
    }

    /**
     * @inheritDoc
     */
    public function paginateTasks(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->with(['team', 'defaultBudgetAccount']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['team_id'])) {
            $query->where('team_id', $filters['team_id']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        $sortField = $filters['sort'] ?? 'created_at';
        $sortDirection = $filters['direction'] ?? 'desc';
        $allowedSorts = ['code', 'name', 'default_rate', 'created_at'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate($perPage);
    }
}
