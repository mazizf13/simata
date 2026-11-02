<?php

namespace App\Policies;

use App\Enums\SpkStatus;
use App\Models\Spk;
use App\Models\User;

class SpkPolicy
{
    /**
     * Determine whether the user can view any SPKs.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim', 'pimpinan']);
    }

    /**
     * Determine whether the user can view the SPK.
     */
    public function view(User $user, Spk $spk): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim', 'pimpinan']);
    }

    /**
     * Determine whether the user can create SPKs.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim']);
    }

    /**
     * Determine whether the user can update the SPK.
     */
    public function update(User $user, Spk $spk): bool
    {
        if ($spk->status === SpkStatus::COMPLETED || $spk->status === SpkStatus::CANCELLED) {
            return false;
        }

        if ($user->hasAnyRole(['super_admin', 'admin'])) {
            return true;
        }

        if ($user->hasRole('operator_tim')) {
            return $spk->status === SpkStatus::DRAFT;
        }

        return false;
    }

    /**
     * Determine whether the user can activate the SPK.
     */
    public function activate(User $user, Spk $spk): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin']) && $spk->status === SpkStatus::DRAFT;
    }

    /**
     * Determine whether the user can complete the SPK.
     */
    public function complete(User $user, Spk $spk): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin']) && $spk->status === SpkStatus::ACTIVE;
    }

    /**
     * Determine whether the user can cancel the SPK.
     */
    public function cancel(User $user, Spk $spk): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'pimpinan']) &&
            in_array($spk->status, [SpkStatus::DRAFT, SpkStatus::ACTIVE], true);
    }

    /**
     * Determine whether the user can attach assignments to the SPK.
     */
    public function attachAssignments(User $user, Spk $spk): bool
    {
        if (in_array($spk->status, [SpkStatus::COMPLETED, SpkStatus::CANCELLED], true)) {
            return false;
        }

        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim']);
    }

    /**
     * Determine whether the user can detach assignments from the SPK.
     */
    public function detachAssignment(User $user, Spk $spk): bool
    {
        if (in_array($spk->status, [SpkStatus::COMPLETED, SpkStatus::CANCELLED], true)) {
            return false;
        }

        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim']);
    }

    /**
     * Determine whether the user can delete the SPK.
     */
    public function delete(User $user, Spk $spk): bool
    {
        if (!$user->hasAnyRole(['super_admin', 'admin'])) {
            return false;
        }

        return $spk->status === SpkStatus::DRAFT;
    }
}
