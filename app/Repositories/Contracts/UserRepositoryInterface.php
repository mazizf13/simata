<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find user by email address.
     *
     * @param string $email
     * @param array<string> $relations
     * @return User|null
     */
    public function findByEmail(string $email, array $relations = []): ?User;

    /**
     * Get all active users.
     *
     * @param array<string> $relations
     * @return Collection<int, User>
     */
    public function getActiveUsers(array $relations = []): Collection;

    /**
     * Synchronize roles for a user.
     *
     * @param int|string $userId
     * @param array<int> $roleIds
     */
    public function syncRoles(int|string $userId, array $roleIds): void;

    /**
     * Synchronize teams for a user.
     *
     * @param int|string $userId
     * @param array<int> $teamIds
     */
    public function syncTeams(int|string $userId, array $teamIds): void;
}
