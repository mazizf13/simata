<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService
{
    public function __construct(
        protected UserRepositoryInterface $userRepository
    ) {}

    /**
     * Get paginated users with relations.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getPaginatedUsers(int $perPage = 15): LengthAwarePaginator
    {
        return $this->userRepository->paginate($perPage, ['*'], ['roles', 'teams']);
    }

    /**
     * Get all active system users.
     *
     * @return Collection<int, User>
     */
    public function getActiveUsers(): Collection
    {
        return $this->userRepository->getActiveUsers(['roles', 'teams']);
    }

    /**
     * Find user by ID with relations.
     *
     * @param int|string $id
     * @return User
     */
    public function getUserById(int|string $id): User
    {
        /** @var User */
        return $this->userRepository->findOrFail($id, ['*'], ['roles', 'teams']);
    }
}
