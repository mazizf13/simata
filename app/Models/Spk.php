<?php

namespace App\Models;

use App\Enums\SpkStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Spk extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'mitra_id',
        'spk_number',
        'contract_date',
        'period_start',
        'period_end',
        'occupation',
        'position',
        'work_address',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'contract_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
        'status' => SpkStatus::class,
    ];

    /**
     * Mitra owner of this SPK.
     *
     * @return BelongsTo<Mitra, Spk>
     */
    public function mitra(): BelongsTo
    {
        return $this->belongsTo(Mitra::class);
    }

    /**
     * User creator.
     *
     * @return BelongsTo<User, Spk>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Task assignments bound to this SPK.
     *
     * @return HasMany<TaskAssignment>
     */
    public function taskAssignments(): HasMany
    {
        return $this->hasMany(TaskAssignment::class);
    }

    /**
     * Calculate total contract value from linked task assignments.
     */
    public function getTotalValueAttribute(): float
    {
        if ($this->relationLoaded('taskAssignments')) {
            return (float) $this->taskAssignments->sum('total_value');
        }

        return (float) $this->taskAssignments()->sum('total_value');
    }

    /**
     * Filter scope for SPK datatable.
     *
     * @param Builder<Spk> $query
     * @param array<string, mixed> $filters
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('spk_number', 'like', "%{$search}%")
                  ->orWhere('occupation', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%")
                  ->orWhereHas('mitra', function ($mq) use ($search) {
                      $mq->where('name', 'like', "%{$search}%")
                         ->orWhere('mitra_code', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['mitra_id'])) {
            $query->where('mitra_id', $filters['mitra_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['start_date'])) {
            $query->where('period_start', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->where('period_end', '<=', $filters['end_date']);
        }

        return $query;
    }
}
