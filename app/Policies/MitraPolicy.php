<?php

namespace App\Policies;

use App\Models\User;

class MitraPolicy
{
    /**
     * Determine whether the user can view any mitras.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim']);
    }

    /**
     * Determine whether the user can view the specific mitra.
     */
    public function view(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim']);
    }

    /**
     * Determine whether the user can create mitras.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin']);
    }

    /**
     * Determine whether the user can update the mitra.
     */
    public function update(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin']);
    }

    /**
     * Determine whether the user can delete/deactivate the mitra.
     */
    public function delete(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin']);
    }
}
