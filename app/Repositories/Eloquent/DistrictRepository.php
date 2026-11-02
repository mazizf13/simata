<?php

namespace App\Repositories\Eloquent;

use App\Models\District;
use App\Repositories\Contracts\DistrictRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class DistrictRepository extends BaseRepository implements DistrictRepositoryInterface
{
    public function __construct(District $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function getActiveDistricts(): Collection
    {
        /** @var Collection<int, District> */
        return $this->model->where('is_active', true)->orderBy('code', 'asc')->get();
    }

    /**
     * @inheritDoc
     */
    public function findByCode(string $code): ?District
    {
        /** @var District|null */
        return $this->model->where('code', $code)->first();
    }
}
