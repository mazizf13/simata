<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([UserRole::SUPER_ADMIN, UserRole::ADMIN]);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return $user->hasAnyRole([UserRole::SUPER_ADMIN, UserRole::ADMIN]) || $user->id === $model->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole([UserRole::SUPER_ADMIN, UserRole::ADMIN]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        if ($user->hasRole(UserRole::SUPER_ADMIN)) {
            return true;
        }

        // Admin cannot edit Super Admin
        if ($model->hasRole(UserRole::SUPER_ADMIN)) {
            return false;
        }

        return $user->hasRole(UserRole::ADMIN);
    }

    /**
     * Determine whether the user can delete/deactivate the model.
     */
    public function delete(User $user, User $model): bool
    {
        // Cannot deactivate oneself
        if ($user->id === $model->id) {
            return false;
        }

        if ($user->hasRole(UserRole::SUPER_ADMIN)) {
            return true;
        }

        if ($model->hasRole(UserRole::SUPER_ADMIN)) {
            return false;
        }

        return $user->hasRole(UserRole::ADMIN);
    }
}
