<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function findByEmail(string $email, array $relations = []): ?User
    {
        /** @var User|null */
        return $this->model->with($relations)->where('email', $email)->first();
    }

    /**
     * @inheritDoc
     */
    public function getActiveUsers(array $relations = []): Collection
    {
        /** @var Collection<int, User> */
        return $this->model->with($relations)->where('is_active', true)->get();
    }

    /**
     * @inheritDoc
     */
    public function syncRoles(int|string $userId, array $roleIds): void
    {
        /** @var User $user */
        $user = $this->findOrFail($userId);
        $user->roles()->sync($roleIds);
    }

    /**
     * @inheritDoc
     */
    public function syncTeams(int|string $userId, array $teamIds): void
    {
        /** @var User $user */
        $user = $this->findOrFail($userId);
        $user->teams()->sync($teamIds);
    }
}
