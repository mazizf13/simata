<?php

namespace App\Repositories\Contracts;

use App\Models\Spk;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface SpkRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get paginated SPKs with eager loading and filtering.
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function paginateSpks(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get all SPKs belonging to a mitra.
     *
     * @param int|string $mitraId
     * @param string|null $status
     * @return Collection<int, Spk>
     */
    public function getSpksByMitra(int|string $mitraId, ?string $status = null): Collection;

    /**
     * Check if mitra already has an active/draft SPK with an overlapping period.
     * Overlap rule: (StartA <= EndB) and (EndA >= StartB).
     *
     * @param int|string $mitraId
     * @param string $periodStart
     * @param string $periodEnd
     * @param int|string|null $excludeSpkId
     * @return bool
     */
    public function hasOverlappingSpk(int|string $mitraId, string $periodStart, string $periodEnd, int|string|null $excludeSpkId = null): bool;
}
