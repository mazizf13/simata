<?php

namespace App\Repositories\Eloquent;

use App\Enums\AssignmentStatus;
use App\Models\AuditLog;
use App\Models\Mitra;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\Team;
use App\Repositories\Contracts\ReportRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection as BaseCollection;
use Illuminate\Support\Facades\DB;

class ReportRepository implements ReportRepositoryInterface
{
    /**
     * The statuses that count towards limits and honor load.
     *
     * @var array<string>
     */
    protected array $countedStatuses = ['approved', 'active', 'completed'];

    /**
     * @inheritDoc
     */
    public function getDashboardStats(int $year, int $month, ?int $teamId = null): array
    {
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth()->toDateString();
        $endOfMonth = Carbon::createFromDate($year, $month, 1)->endOfMonth()->toDateString();

        // 1. Total Active Mitras in master data
        $totalActiveMitras = Mitra::where('status', 'active')->count();

        // 2. Base query for counted assignments in this month
        $baseQuery = TaskAssignment::query()
            ->whereBetween('start_date', [$startOfMonth, $endOfMonth])
            ->whereIn('status', $this->countedStatuses);

        if ($teamId) {
            $baseQuery->whereHas('task', fn ($q) => $q->where('team_id', $teamId));
        }

        // Summary counts
        $totalAssignments = (clone $baseQuery)->count();
        $totalHonorValue = (float) (clone $baseQuery)->sum('total_value');

        // Active assignments count
        $activeAssignmentsCountQuery = TaskAssignment::query()
            ->whereBetween('start_date', [$startOfMonth, $endOfMonth])
            ->where('status', AssignmentStatus::ACTIVE->value);
        if ($teamId) {
            $activeAssignmentsCountQuery->whereHas('task', fn ($q) => $q->where('team_id', $teamId));
        }
        $activeAssignmentsCount = $activeAssignmentsCountQuery->count();

        // 3. Mitra Limit Statistics in this month (regardless of team filter to see true limit state of mitras)
        $mitraAggregates = DB::table('task_assignments')
            ->select('mitra_id', DB::raw('COUNT(id) as total_tasks'), DB::raw('SUM(total_value) as total_honor'))
            ->whereNull('deleted_at')
            ->whereBetween('start_date', [$startOfMonth, $endOfMonth])
            ->whereIn('status', $this->countedStatuses)
            ->groupBy('mitra_id')
            ->get();

        $reachedTaskLimitCount = 0;
        $reachedHonorLimitCount = 0;
        $nearLimitMitraIds = [];

        foreach ($mitraAggregates as $agg) {
            $tasks = (int) $agg->total_tasks;
            $honor = (float) $agg->total_honor;

            if ($tasks >= 10) {
                $reachedTaskLimitCount++;
            }
            if ($honor >= 4000000) {
                $reachedHonorLimitCount++;
            }

            // Near limit: tasks >= 8 OR honor >= 3.200.000 (80%)
            if ($tasks >= 8 || $honor >= 3200000) {
                $nearLimitMitraIds[$agg->mitra_id] = [
                    'tasks' => $tasks,
                    'honor' => $honor,
                ];
            }
        }

        // Fetch details of mitras near or at limit
        $nearLimitMitras = [];
        if (!empty($nearLimitMitraIds)) {
            $mitras = Mitra::with('district')
                ->whereIn('id', array_keys($nearLimitMitraIds))
                ->get();

            foreach ($mitras as $mitra) {
                $data = $nearLimitMitraIds[$mitra->id];
                $tasks = $data['tasks'];
                $honor = $data['honor'];

                $statusLabel = 'Aman';
                $statusVariant = 'success';

                if ($tasks >= 10 && $honor >= 4000000) {
                    $statusLabel = 'Batas Tugas & Honor Tercapai';
                    $statusVariant = 'danger';
                } elseif ($tasks >= 10) {
                    $statusLabel = 'Batas Tugas Tercapai (10/10)';
                    $statusVariant = 'danger';
                } elseif ($honor >= 4000000) {
                    $statusLabel = 'Batas Honor Tercapai';
                    $statusVariant = 'danger';
                } elseif ($tasks >= 8 || $honor >= 3200000) {
                    $statusLabel = 'Mendekati Batas';
                    $statusVariant = 'warning';
                }

                $nearLimitMitras[] = [
                    'mitra_id' => $mitra->id,
                    'mitra_code' => $mitra->mitra_code,
                    'name' => $mitra->name,
                    'district' => $mitra->district?->name ?? '-',
                    'total_tasks' => $tasks,
                    'total_honor' => $honor,
                    'remaining_tasks' => max(0, 10 - $tasks),
                    'remaining_honor' => max(0, 4000000 - $honor),
                    'status_label' => $statusLabel,
                    'status_variant' => $statusVariant,
                ];
            }

            // Sort descending by honor
            usort($nearLimitMitras, fn ($a, $b) => $b['total_honor'] <=> $a['total_honor']);
        }

        // 4. Team distribution
        $teamRecap = $this->getTeamRecap($year, $month);

        // 5. Recent activities from audit_logs
        $recentActivities = AuditLog::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'entity_type' => class_basename($log->entity_type),
                'entity_id' => $log->entity_id,
                'user_name' => $log->user?->name ?? 'Sistem',
                'created_at' => $log->created_at ? $log->created_at->toIso8601String() : null,
            ]);

        return [
            'period' => [
                'year' => $year,
                'month' => $month,
                'month_name' => Carbon::createFromDate($year, $month, 1)->translatedFormat('F'),
                'start_date' => $startOfMonth,
                'end_date' => $endOfMonth,
            ],
            'metrics' => [
                'total_active_mitras' => $totalActiveMitras,
                'total_assignments' => $totalAssignments,
                'total_honor_value' => $totalHonorValue,
                'active_assignments_count' => $activeAssignmentsCount,
                'mitras_reached_task_limit' => $reachedTaskLimitCount,
                'mitras_reached_honor_limit' => $reachedHonorLimitCount,
            ],
            'team_distribution' => $teamRecap,
            'mitras_near_limit' => array_slice($nearLimitMitras, 0, 10),
            'recent_activities' => $recentActivities,
        ];
    }

    /**
     * @inheritDoc
     */
    public function getMonthlyMitraRecap(int $year, int $month, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth()->toDateString();
        $endOfMonth = Carbon::createFromDate($year, $month, 1)->endOfMonth()->toDateString();

        // Query active mitras with their assignments in the target month
        $query = Mitra::query()
            ->with(['district:id,code,name'])
            ->with(['taskAssignments' => function ($q) use ($startOfMonth, $endOfMonth, $filters) {
                $q->whereBetween('start_date', [$startOfMonth, $endOfMonth])
                  ->whereIn('status', $this->countedStatuses);

                if (!empty($filters['team_id'])) {
                    $q->whereHas('task', fn ($tq) => $tq->where('team_id', $filters['team_id']));
                }
            }]);

        // Search
        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('mitra_code', 'like', "%{$search}%");
            });
        }

        // District filter
        if (!empty($filters['district_id'])) {
            $query->where('district_id', $filters['district_id']);
        }

        // Filter status master mitra (default active)
        if (!empty($filters['mitra_status'])) {
            $query->where('status', $filters['mitra_status']);
        }

        $paginator = $query->orderBy('name', 'asc')->paginate($perPage);

        // Transform collection to include calculated quota, honor, and limit status
        $paginator->getCollection()->transform(function (Mitra $mitra) {
            $totalTasks = $mitra->taskAssignments->count();
            $totalHonor = (float) $mitra->taskAssignments->sum('total_value');
            $remainingTasks = max(0, 10 - $totalTasks);
            $remainingHonor = max(0, 4000000 - $honor = $totalHonor);

            $limitStatus = 'aman';
            $limitStatusLabel = 'Aman';
            $badgeVariant = 'success';

            if ($totalTasks >= 10 && $totalHonor >= 4000000) {
                $limitStatus = 'limit_both';
                $limitStatusLabel = 'Batas Tugas & Honor Tercapai';
                $badgeVariant = 'danger';
            } elseif ($totalTasks >= 10) {
                $limitStatus = 'limit_task';
                $limitStatusLabel = 'Batas Tugas Tercapai (10/10)';
                $badgeVariant = 'danger';
            } elseif ($totalHonor >= 4000000) {
                $limitStatus = 'limit_honor';
                $limitStatusLabel = 'Batas Honor Tercapai';
                $badgeVariant = 'danger';
            } elseif ($totalTasks >= 8 || $totalHonor >= 3200000) {
                $limitStatus = 'near_limit';
                $limitStatusLabel = 'Mendekati Batas';
                $badgeVariant = 'warning';
            }

            return [
                'id' => $mitra->id,
                'mitra_code' => $mitra->mitra_code,
                'name' => $mitra->name,
                'district_name' => $mitra->district?->name ?? '-',
                'phone' => $mitra->phone,
                'occupation' => $mitra->occupation,
                'total_tasks' => $totalTasks,
                'total_honor' => $totalHonor,
                'formatted_total_honor' => 'Rp ' . number_format($totalHonor, 0, ',', '.'),
                'remaining_tasks' => $remainingTasks,
                'remaining_honor' => $remainingHonor,
                'formatted_remaining_honor' => 'Rp ' . number_format($remainingHonor, 0, ',', '.'),
                'limit_status' => $limitStatus,
                'limit_status_label' => $limitStatusLabel,
                'badge_variant' => $badgeVariant,
            ];
        });

        // Filter limit_status in-memory if specified in filters
        if (!empty($filters['limit_status'])) {
            $filtered = $paginator->getCollection()->filter(function ($item) use ($filters) {
                return $item['limit_status'] === $filters['limit_status'];
            })->values();

            $paginator->setCollection($filtered);
        }

        return $paginator;
    }

    /**
     * @inheritDoc
     */
    public function getAllMonthlyMitraRecap(int $year, int $month, array $filters = []): BaseCollection
    {
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth()->toDateString();
        $endOfMonth = Carbon::createFromDate($year, $month, 1)->endOfMonth()->toDateString();

        $query = Mitra::query()
            ->with(['district:id,code,name'])
            ->with(['taskAssignments' => function ($q) use ($startOfMonth, $endOfMonth, $filters) {
                $q->whereBetween('start_date', [$startOfMonth, $endOfMonth])
                  ->whereIn('status', $this->countedStatuses);

                if (!empty($filters['team_id'])) {
                    $q->whereHas('task', fn ($tq) => $tq->where('team_id', $filters['team_id']));
                }
            }]);

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('mitra_code', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['district_id'])) {
            $query->where('district_id', $filters['district_id']);
        }

        return $query->orderBy('name', 'asc')->get()->map(function (Mitra $mitra) {
            $totalTasks = $mitra->taskAssignments->count();
            $totalHonor = (float) $mitra->taskAssignments->sum('total_value');
            $remainingTasks = max(0, 10 - $totalTasks);
            $remainingHonor = max(0, 4000000 - $totalHonor);

            $limitStatusLabel = 'Aman';
            if ($totalTasks >= 10 && $totalHonor >= 4000000) {
                $limitStatusLabel = 'Batas Tugas & Honor Tercapai';
            } elseif ($totalTasks >= 10) {
                $limitStatusLabel = 'Batas Tugas Tercapai';
            } elseif ($totalHonor >= 4000000) {
                $limitStatusLabel = 'Batas Honor Tercapai';
            } elseif ($totalTasks >= 8 || $totalHonor >= 3200000) {
                $limitStatusLabel = 'Mendekati Batas';
            }

            return [
                'mitra_code' => $mitra->mitra_code,
                'name' => $mitra->name,
                'district' => $mitra->district?->name ?? '-',
                'phone' => $mitra->phone ?? '-',
                'total_tasks' => $totalTasks,
                'total_honor' => $totalHonor,
                'remaining_tasks' => $remainingTasks,
                'remaining_honor' => $remainingHonor,
                'limit_status' => $limitStatusLabel,
            ];
        });
    }

    /**
     * @inheritDoc
     */
    public function getTeamRecap(int $year, int $month): BaseCollection
    {
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth()->toDateString();
        $endOfMonth = Carbon::createFromDate($year, $month, 1)->endOfMonth()->toDateString();

        $teams = Team::where('is_active', true)->orderBy('name', 'asc')->get();

        $recap = $teams->map(function (Team $team) use ($startOfMonth, $endOfMonth) {
            // Distinct tasks that have assignments in this month
            $assignments = TaskAssignment::query()
                ->whereBetween('start_date', [$startOfMonth, $endOfMonth])
                ->whereIn('status', $this->countedStatuses)
                ->whereHas('task', fn ($q) => $q->where('team_id', $team->id))
                ->get();

            $totalAssignments = $assignments->count();
            $totalHonor = (float) $assignments->sum('total_value');
            $distinctMitras = $assignments->pluck('mitra_id')->unique()->count();
            $distinctTasks = $assignments->pluck('task_id')->unique()->count();

            return [
                'team_id' => $team->id,
                'team_code' => $team->code,
                'team_name' => $team->name,
                'description' => $team->description,
                'tasks_count' => $distinctTasks,
                'mitras_count' => $distinctMitras,
                'assignments_count' => $totalAssignments,
                'total_honor' => $totalHonor,
                'formatted_total_honor' => 'Rp ' . number_format($totalHonor, 0, ',', '.'),
            ];
        });

        return $recap;
    }

    /**
     * @inheritDoc
     */
    public function getTeamRecapDrilldown(int $teamId, int $year, int $month): array
    {
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth()->toDateString();
        $endOfMonth = Carbon::createFromDate($year, $month, 1)->endOfMonth()->toDateString();

        /** @var Team $team */
        $team = Team::findOrFail($teamId);

        // Fetch tasks of this team that have assignments in this month
        $tasks = Task::where('team_id', $teamId)
            ->with(['taskAssignments' => function ($q) use ($startOfMonth, $endOfMonth) {
                $q->whereBetween('start_date', [$startOfMonth, $endOfMonth])
                  ->whereIn('status', $this->countedStatuses)
                  ->with(['mitra:id,mitra_code,name,phone,district_id', 'mitra.district:id,name', 'budgetAccount:id,code,name']);
            }])
            ->get();

        $taskDetails = [];
        $teamTotalHonor = 0;
        $teamTotalAssignments = 0;
        $allMitraIds = [];

        foreach ($tasks as $task) {
            $assignments = $task->taskAssignments;
            $taskHonor = (float) $assignments->sum('total_value');
            $taskAssignmentsCount = $assignments->count();
            $taskMitras = $assignments->pluck('mitra_id')->unique();

            $teamTotalHonor += $taskHonor;
            $teamTotalAssignments += $taskAssignmentsCount;
            foreach ($taskMitras as $mId) {
                $allMitraIds[] = $mId;
            }

            $assignmentList = $assignments->map(fn ($a) => [
                'id' => $a->id,
                'mitra_id' => $a->mitra_id,
                'mitra_code' => $a->mitra?->mitra_code,
                'mitra_name' => $a->mitra?->name,
                'mitra_district' => $a->mitra?->district?->name ?? '-',
                'start_date' => $a->start_date ? $a->start_date->toDateString() : null,
                'end_date' => $a->end_date ? $a->end_date->toDateString() : null,
                'volume' => (float) $a->volume,
                'unit' => $a->unit_snapshot,
                'unit_price' => (float) $a->unit_price,
                'total_value' => (float) $a->total_value,
                'status' => $a->status->value,
                'budget_account' => $a->budgetAccount?->code ?? '-',
            ]);

            $taskDetails[] = [
                'task_id' => $task->id,
                'task_code' => $task->task_code,
                'task_name' => $task->name,
                'unit' => $task->default_unit,
                'default_rate' => (float) $task->default_rate,
                'assignments_count' => $taskAssignmentsCount,
                'mitras_count' => $taskMitras->count(),
                'total_honor' => $taskHonor,
                'assignments' => $assignmentList,
            ];
        }

        return [
            'team' => [
                'id' => $team->id,
                'code' => $team->code,
                'name' => $team->name,
            ],
            'period' => [
                'year' => $year,
                'month' => $month,
                'month_name' => Carbon::createFromDate($year, $month, 1)->translatedFormat('F'),
            ],
            'summary' => [
                'tasks_count' => count($taskDetails),
                'assignments_count' => $teamTotalAssignments,
                'mitras_count' => count(array_unique($allMitraIds)),
                'total_honor' => $teamTotalHonor,
                'formatted_total_honor' => 'Rp ' . number_format($teamTotalHonor, 0, ',', '.'),
            ],
            'tasks' => $taskDetails,
        ];
    }

    /**
     * @inheritDoc
     */
    public function getCalendarEvents(int $year, int $month, ?int $teamId = null, ?int $taskId = null): Collection
    {
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth()->toDateString();
        $endOfMonth = Carbon::createFromDate($year, $month, 1)->endOfMonth()->toDateString();

        // An event spans the month if start_date <= monthEnd AND end_date >= monthStart
        $query = TaskAssignment::with([
            'mitra:id,mitra_code,name,district_id',
            'mitra.district:id,name',
            'task:id,task_code,name,team_id',
            'task.team:id,code,name',
        ])
        ->where('start_date', '<=', $endOfMonth)
        ->where('end_date', '>=', $startOfMonth)
        ->where('status', '!=', AssignmentStatus::CANCELLED->value);

        if ($teamId) {
            $query->whereHas('task', fn ($q) => $q->where('team_id', $teamId));
        }

        if ($taskId) {
            $query->where('task_id', $taskId);
        }

        return $query->orderBy('start_date', 'asc')->get();
    }

    /**
     * @inheritDoc
     */
    public function getKanbanAssignments(int $year, int $month, ?int $teamId = null, ?string $search = null): array
    {
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth()->toDateString();
        $endOfMonth = Carbon::createFromDate($year, $month, 1)->endOfMonth()->toDateString();

        $query = TaskAssignment::with([
            'mitra:id,mitra_code,name',
            'task:id,task_code,name,team_id',
            'task.team:id,code,name',
        ])
        ->whereBetween('start_date', [$startOfMonth, $endOfMonth]);

        if ($teamId) {
            $query->whereHas('task', fn ($q) => $q->where('team_id', $teamId));
        }

        if ($search) {
            $s = trim($search);
            $query->where(function ($q) use ($s) {
                $q->where('task_name_snapshot', 'like', "%{$s}%")
                  ->orWhereHas('mitra', fn ($mq) => $mq->where('name', 'like', "%{$s}%"));
            });
        }

        $all = $query->orderBy('start_date', 'desc')->get();

        $columns = [
            'draft' => [],
            'pending_approval' => [],
            'approved' => [],
            'active' => [],
            'completed' => [],
        ];

        foreach ($all as $item) {
            $statusVal = $item->status->value;
            if (isset($columns[$statusVal])) {
                $columns[$statusVal][] = [
                    'id' => $item->id,
                    'task_name' => $item->task_name_snapshot ?? $item->task?->name,
                    'team_name' => $item->team_name_snapshot ?? $item->task?->team?->name ?? 'Umum',
                    'mitra_name' => $item->mitra?->name ?? '-',
                    'mitra_code' => $item->mitra?->mitra_code ?? '-',
                    'start_date' => $item->start_date ? $item->start_date->toDateString() : null,
                    'end_date' => $item->end_date ? $item->end_date->toDateString() : null,
                    'volume' => (float) $item->volume,
                    'unit' => $item->unit_snapshot,
                    'total_value' => (float) $item->total_value,
                    'formatted_total_value' => 'Rp ' . number_format($item->total_value, 0, ',', '.'),
                    'status' => $statusVal,
                ];
            }
        }

        return $columns;
    }
}
