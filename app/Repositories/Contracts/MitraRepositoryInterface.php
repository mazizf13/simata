<?php

namespace App\Repositories\Contracts;

use App\Models\Mitra;
use Illuminate\Pagination\LengthAwarePaginator;

interface MitraRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find mitra by unique code.
     *
     * @param string $code
     * @return Mitra|null
     */
    public function findByCode(string $code): ?Mitra;

    /**
     * Paginate mitras with searching and filtering.
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function paginateMitras(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Deactivate mitra.
     *
     * @param int|string $id
     * @return Mitra
     */
    public function deactivate(int|string $id): Mitra;
}
