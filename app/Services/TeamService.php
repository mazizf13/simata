<?php

namespace App\Services;

use App\Models\Team;
use App\Repositories\Contracts\TeamRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TeamService
{
    public function __construct(
        protected TeamRepositoryInterface $teamRepository
    ) {}

    /**
     * Get all active statistical teams.
     *
     * @return Collection<int, Team>
     */
    public function getActiveTeams(): Collection
    {
        return $this->teamRepository->getActiveTeams();
    }

    /**
     * Find team by code.
     *
     * @param string $code
     * @return Team|null
     */
    public function getTeamByCode(string $code): ?Team
    {
        return $this->teamRepository->findByCode($code);
    }
}
