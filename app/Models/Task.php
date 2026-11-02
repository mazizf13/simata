<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'team_id',
        'name',
        'default_unit',
        'default_rate',
        'default_budget_account_id',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'default_rate' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Team, Task>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * @return BelongsTo<BudgetAccount, Task>
     */
    public function defaultBudgetAccount(): BelongsTo
    {
        return $this->belongsTo(BudgetAccount::class, 'default_budget_account_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<TaskAssignment>
     */
    public function taskAssignments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TaskAssignment::class);
    }

    /**
     * Scope only active tasks.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
