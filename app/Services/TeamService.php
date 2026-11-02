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
     * Get all teams with user counts.
     *
     * @return Collection<int, Team>
     */
    public function getAllTeams(): Collection
    {
        return Team::withCount(['users', 'tasks'])
            ->with(['users:id,name,email,phone'])
            ->orderBy('name', 'asc')
            ->get();
    }

    public function getTeamById(int|string $id): Team
    {
        /** @var Team */
        return Team::with(['users:id,name,email,phone'])->withCount(['users', 'tasks'])->findOrFail($id);
    }

    public function createTeam(array $data): Team
    {
        /** @var Team */
        return $this->teamRepository->create($data);
    }

    public function updateTeam(int|string $id, array $data): Team
    {
        /** @var Team */
        return $this->teamRepository->update($id, $data);
    }

    public function deactivateTeam(int|string $id): Team
    {
        /** @var Team */
        $team = Team::findOrFail($id);
        $team->update(['is_active' => false]);
        return $team;
    }
}
