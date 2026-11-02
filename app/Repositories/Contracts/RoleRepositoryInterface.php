<?php

namespace App\Repositories\Contracts;

use App\Models\Role;

interface RoleRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find role by unique system name.
     *
     * @param string $name
     * @return Role|null
     */
    public function findByName(string $name): ?Role;
}
