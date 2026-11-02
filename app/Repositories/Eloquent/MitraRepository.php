<?php

namespace App\Repositories\Eloquent;

use App\Models\Mitra;
use App\Repositories\Contracts\MitraRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class MitraRepository extends BaseRepository implements MitraRepositoryInterface
{
    public function __construct(Mitra $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function findByCode(string $code): ?Mitra
    {
        /** @var Mitra|null */
        return $this->model->with('district')->where('mitra_code', $code)->first();
    }

    /**
     * @inheritDoc
     */
    public function paginateMitras(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->with('district')->filter($filters);

        $sortField = $filters['sort'] ?? 'created_at';
        $sortDirection = $filters['direction'] ?? 'desc';
        $allowedSorts = ['mitra_code', 'name', 'status', 'created_at'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function deactivate(int|string $id): Mitra
    {
        /** @var Mitra $mitra */
        $mitra = $this->findOrFail($id);
        $mitra->update(['status' => 'inactive']);
        return $mitra;
    }
}
