<?php

namespace App\Repositories\Eloquent;

use App\Enums\AssignmentStatus;
use App\Models\TaskAssignment;
use App\Repositories\Contracts\TaskAssignmentRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class TaskAssignmentRepository extends BaseRepository implements TaskAssignmentRepositoryInterface
{
    public function __construct(TaskAssignment $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function paginateAssignments(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(['mitra:id,mitra_code,name,phone', 'task:id,code,name,team_id', 'budgetAccount:id,code,name', 'creator:id,name', 'spk:id,spk_number,status'])
            ->filter($filters);

        $sortField = $filters['sort'] ?? 'start_date';
        $direction = strtolower($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        if (in_array($sortField, ['start_date', 'end_date', 'total_value', 'status', 'created_at'], true)) {
            $query->orderBy($sortField, $direction);
        } else {
            $query->orderBy('start_date', 'desc')->orderBy('id', 'desc');
        }

        return $query->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function getAssignmentsByMitra(int|string $mitraId, ?int $year = null, ?int $month = null): Collection
    {
        $query = $this->model->newQuery()
            ->where('mitra_id', $mitraId)
            ->with(['task:id,code,name', 'budgetAccount:id,code,name'])
            ->orderBy('start_date', 'desc');

        if ($year && $month) {
            $query->forPeriod($year, $month);
        }

        return $query->get();
    }

    /**
     * @inheritDoc
     */
    public function getCountedMonthlyStats(int|string $mitraId, int $year, int $month, int|string|null $excludeAssignmentId = null): array
    {
        $startDate = Carbon::create($year, $month, 1)->startOfMonth()->toDateString();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth()->toDateString();

        $query = $this->model->newQuery()
            ->where('mitra_id', $mitraId)
            ->whereIn('status', AssignmentStatus::countedStatuses())
            ->whereBetween('start_date', [$startDate, $endDate]);

        if ($excludeAssignmentId !== null) {
            $query->where('id', '!=', $excludeAssignmentId);
        }

        $result = $query->selectRaw('COUNT(*) as task_count, COALESCE(SUM(total_value), 0) as total_honor')->first();

        return [
            'task_count' => (int) ($result->task_count ?? 0),
            'total_honor' => (float) ($result->total_honor ?? 0.0),
        ];
    }
}
