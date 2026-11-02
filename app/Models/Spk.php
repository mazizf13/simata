<?php

namespace App\Models;

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
}
