<?php

namespace App\Repositories\Contracts;

use App\Models\District;
use Illuminate\Database\Eloquent\Collection;

interface DistrictRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get all active districts.
     *
     * @return Collection<int, District>
     */
    public function getActiveDistricts(): Collection;

    /**
     * Find district by official code.
     *
     * @param string $code
     * @return District|null
     */
    public function findByCode(string $code): ?District;
}
