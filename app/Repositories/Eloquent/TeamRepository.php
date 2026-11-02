<?php

namespace App\Repositories\Eloquent;

use App\Models\Team;
use App\Repositories\Contracts\TeamRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TeamRepository extends BaseRepository implements TeamRepositoryInterface
{
    public function __construct(Team $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function findByCode(string $code): ?Team
    {
        /** @var Team|null */
        return $this->model->where('code', $code)->first();
    }

    /**
     * @inheritDoc
     */
    public function getActiveTeams(): Collection
    {
        /** @var Collection<int, Team> */
        return $this->model->where('is_active', true)->orderBy('name', 'asc')->get();
    }
}
