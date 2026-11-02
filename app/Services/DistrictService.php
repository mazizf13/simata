<?php

namespace App\Services;

use App\Models\District;
use App\Repositories\Contracts\DistrictRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class DistrictService
{
    public function __construct(
        protected DistrictRepositoryInterface $districtRepository
    ) {}

    /**
     * @return Collection<int, District>
     */
    public function getActiveDistricts(): Collection
    {
        return $this->districtRepository->getActiveDistricts();
    }

    public function getPaginatedDistricts(int $perPage = 25): LengthAwarePaginator
    {
        return $this->districtRepository->paginate($perPage);
    }

    public function getDistrictById(int|string $id): District
    {
        /** @var District */
        return $this->districtRepository->findOrFail($id);
    }

    public function createDistrict(array $data): District
    {
        /** @var District */
        return $this->districtRepository->create($data);
    }

    public function updateDistrict(int|string $id, array $data): District
    {
        /** @var District */
        return $this->districtRepository->update($id, $data);
    }
}
