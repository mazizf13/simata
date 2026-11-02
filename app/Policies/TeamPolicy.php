<?php

namespace App\Policies;

use App\Models\User;

class TeamPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim']);
    }

    public function view(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin']);
    }

    public function update(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin']);
    }

    public function delete(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin']);
    }
}
