<?php

namespace App\Repositories\Eloquent;

use App\Enums\SpkStatus;
use App\Models\Spk;
use App\Repositories\Contracts\SpkRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class SpkRepository extends BaseRepository implements SpkRepositoryInterface
{
    public function __construct(Spk $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function paginateSpks(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(['mitra:id,mitra_code,name,phone,district_id', 'mitra.district:id,code,name', 'creator:id,name'])
            ->withCount('taskAssignments')
            ->filter($filters);

        $sortField = $filters['sort'] ?? 'contract_date';
        $direction = strtolower($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        if (in_array($sortField, ['spk_number', 'contract_date', 'period_start', 'period_end', 'status', 'created_at'], true)) {
            $query->orderBy($sortField, $direction);
        } else {
            $query->orderBy('contract_date', 'desc')->orderBy('id', 'desc');
        }

        return $query->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function getSpksByMitra(int|string $mitraId, ?string $status = null): Collection
    {
        $query = $this->model->newQuery()
            ->where('mitra_id', $mitraId)
            ->withCount('taskAssignments')
            ->orderBy('contract_date', 'desc');

        if ($status) {
            $query->where('status', $status);
        }

        return $query->get();
    }

    /**
     * @inheritDoc
     */
    public function hasOverlappingSpk(int|string $mitraId, string $periodStart, string $periodEnd, int|string|null $excludeSpkId = null): bool
    {
        $query = $this->model->newQuery()
            ->where('mitra_id', $mitraId)
            ->where('status', '!=', SpkStatus::CANCELLED->value)
            ->whereNotNull('period_start')
            ->whereNotNull('period_end')
            ->where(function ($q) use ($periodStart, $periodEnd) {
                // (StartA <= EndB) and (EndA >= StartB)
                $q->where('period_start', '<=', $periodEnd)
                  ->where('period_end', '>=', $periodStart);
            });

        if ($excludeSpkId !== null) {
            $query->where('id', '!=', $excludeSpkId);
        }

        return $query->exists();
    }
}
