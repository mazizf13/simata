<?php

namespace App\Models;

use App\Enums\BastStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bast extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'spk_id',
        'bast_number',
        'bast_date',
        'status',
        'notes',
        'document_path',
        'document_hash',
        'generated_at',
        'approved_by',
        'created_by',
    ];

    protected $casts = [
        'bast_date' => 'date',
        'generated_at' => 'datetime',
        'status' => BastStatus::class,
    ];

    /**
     * Parent SPK reference.
     *
     * @return BelongsTo<Spk, Bast>
     */
    public function spk(): BelongsTo
    {
        return $this->belongsTo(Spk::class);
    }

    /**
     * User creator.
     *
     * @return BelongsTo<User, Bast>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * User who approved this BAST.
     *
     * @return BelongsTo<User, Bast>
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope filter for datatable and queries.
     *
     * @param Builder<Bast> $query
     * @param array<string, mixed> $filters
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('bast_number', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhereHas('spk', function ($sq) use ($search) {
                      $sq->where('spk_number', 'like', "%{$search}%")
                         ->orWhereHas('mitra', function ($mq) use ($search) {
                             $mq->where('name', 'like', "%{$search}%")
                                ->orWhere('mitra_code', 'like', "%{$search}%");
                         });
                  });
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['year'])) {
            $query->whereYear('bast_date', (int) $filters['year']);
        }

        if (!empty($filters['month'])) {
            $query->whereMonth('bast_date', (int) $filters['month']);
        }

        if (!empty($filters['mitra_id'])) {
            $query->whereHas('spk', function ($sq) use ($filters) {
                $sq->where('mitra_id', $filters['mitra_id']);
            });
        }

        return $query;
    }
}
