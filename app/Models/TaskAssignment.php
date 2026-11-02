<?php

namespace App\Models;

use App\Enums\AssignmentStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskAssignment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'mitra_id',
        'task_id',
        'spk_id',
        'budget_account_id',
        'task_name_snapshot',
        'team_name_snapshot',
        'budget_account_code_snapshot',
        'budget_account_name_snapshot',
        'unit_snapshot',
        'unit_price_snapshot',
        'start_date',
        'end_date',
        'volume',
        'unit_price',
        'total_value',
        'status',
        'notes',
        'created_by',
        'approved_by',
        'approved_at',
        'cancelled_by',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'volume' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_value' => 'decimal:2',
        'unit_price_snapshot' => 'decimal:2',
        'status' => AssignmentStatus::class,
        'approved_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Compute total value backend formula: volume * unit_price.
     */
    public static function computeTotalValue(float|int|string $volume, float|int|string $unitPrice): float
    {
        return round((float) $volume * (float) $unitPrice, 2);
    }

    /**
     * Mitra relationship.
     *
     * @return BelongsTo<Mitra, TaskAssignment>
     */
    public function mitra(): BelongsTo
    {
        return $this->belongsTo(Mitra::class);
    }

    /**
     * Task catalog relationship.
     *
     * @return BelongsTo<Task, TaskAssignment>
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * SPK relationship.
     *
     * @return BelongsTo<Spk, TaskAssignment>
     */
    public function spk(): BelongsTo
    {
        return $this->belongsTo(Spk::class);
    }

    /**
     * Budget account relationship.
     *
     * @return BelongsTo<BudgetAccount, TaskAssignment>
     */
    public function budgetAccount(): BelongsTo
    {
        return $this->belongsTo(BudgetAccount::class);
    }

    /**
     * Creator relationship.
     *
     * @return BelongsTo<User, TaskAssignment>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Approver relationship.
     *
     * @return BelongsTo<User, TaskAssignment>
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Canceller relationship.
     *
     * @return BelongsTo<User, TaskAssignment>
     */
    public function canceller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    /**
     * Scope for statuses that count toward limits.
     *
     * @param Builder<TaskAssignment> $query
     */
    public function scopeCounted(Builder $query): Builder
    {
        return $query->whereIn('status', AssignmentStatus::countedStatuses());
    }

    /**
     * Scope for target period based strictly on start_date month and year.
     *
     * @param Builder<TaskAssignment> $query
     * @param int $year
     * @param int $month
     */
    public function scopeForPeriod(Builder $query, int $year, int $month): Builder
    {
        $startDate = Carbon::create($year, $month, 1)->startOfMonth()->toDateString();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth()->toDateString();

        return $query->whereBetween('start_date', [$startDate, $endDate]);
    }

    /**
     * Scope filter for datatables and list endpoints.
     *
     * @param Builder<TaskAssignment> $query
     * @param array<string, mixed> $filters
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('task_name_snapshot', 'like', "%{$search}%")
                  ->orWhere('team_name_snapshot', 'like', "%{$search}%")
                  ->orWhere('budget_account_code_snapshot', 'like', "%{$search}%")
                  ->orWhereHas('mitra', function ($mq) use ($search) {
                      $mq->where('name', 'like', "%{$search}%")
                         ->orWhere('mitra_code', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['mitra_id'])) {
            $query->where('mitra_id', $filters['mitra_id']);
        }

        if (!empty($filters['task_id'])) {
            $query->where('task_id', $filters['task_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['year']) && !empty($filters['month'])) {
            $query->forPeriod((int) $filters['year'], (int) $filters['month']);
        }

        return $query;
    }
}
