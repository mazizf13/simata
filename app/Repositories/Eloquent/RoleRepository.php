<?php

namespace App\Repositories\Eloquent;

use App\Models\Role;
use App\Repositories\Contracts\RoleRepositoryInterface;

class RoleRepository extends BaseRepository implements RoleRepositoryInterface
{
    public function __construct(Role $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function findByName(string $name): ?Role
    {
        /** @var Role|null */
        return $this->model->where('name', $name)->first();
    }
}
