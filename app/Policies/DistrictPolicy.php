<?php

namespace App\Policies;

use App\Models\User;

class DistrictPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // Anyone logged in can view districts (needed for forms and filters)
    }

    public function view(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('super_admin');
    }

    public function update(User $user): bool
    {
        return $user->hasRole('super_admin');
    }

    public function delete(User $user): bool
    {
        return $user->hasRole('super_admin');
    }
}
