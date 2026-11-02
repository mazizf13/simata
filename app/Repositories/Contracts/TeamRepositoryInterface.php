<?php

namespace App\Repositories\Contracts;

use App\Models\Team;
use Illuminate\Database\Eloquent\Collection;

interface TeamRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find team by code (e.g. PROD, SOS).
     *
     * @param string $code
     * @return Team|null
     */
    public function findByCode(string $code): ?Team;

    /**
     * Get all active teams.
     *
     * @return Collection<int, Team>
     */
    public function getActiveTeams(): Collection;
}
