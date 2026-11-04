<?php

namespace App\Policies;

use App\Enums\BastStatus;
use App\Models\Bast;
use App\Models\User;

class BastPolicy
{
    /**
     * Determine whether the user can view any BASTs.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim', 'pimpinan']);
    }

    /**
     * Determine whether the user can view the BAST.
     */
    public function view(User $user, Bast $bast): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim', 'pimpinan']);
    }

    /**
     * Determine whether the user can create BAST.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim']);
    }

    /**
     * Determine whether the user can update the BAST.
     */
    public function update(User $user, Bast $bast): bool
    {
        if ($bast->status === BastStatus::APPROVED || $bast->status === BastStatus::CANCELLED) {
            return false;
        }

        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim']);
    }

    /**
     * Determine whether the user can approve the BAST.
     */
    public function approve(User $user, Bast $bast): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'pimpinan']);
    }
}
