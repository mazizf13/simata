<?php

namespace App\Services;

use App\Models\Mitra;
use App\Repositories\Contracts\MitraRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class MitraService
{
    public function __construct(
        protected MitraRepositoryInterface $mitraRepository
    ) {}

    public function getPaginatedMitras(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->mitraRepository->paginateMitras($filters, $perPage);
    }

    public function getMitraById(int|string $id): Mitra
    {
        /** @var Mitra */
        return $this->mitraRepository->findOrFail($id, ['*'], ['district']);
    }

    public function createMitra(array $data): Mitra
    {
        /** @var Mitra */
        return $this->mitraRepository->create($data);
    }

    public function updateMitra(int|string $id, array $data): Mitra
    {
        /** @var Mitra */
        return $this->mitraRepository->update($id, $data);
    }

    public function deactivateMitra(int|string $id): Mitra
    {
        return $this->mitraRepository->deactivate($id);
    }
}
