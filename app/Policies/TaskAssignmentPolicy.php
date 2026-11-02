<?php

namespace App\Policies;

use App\Enums\AssignmentStatus;
use App\Models\TaskAssignment;
use App\Models\User;

class TaskAssignmentPolicy
{
    /**
     * Determine whether the user can view any assignments.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim', 'pimpinan']);
    }

    /**
     * Determine whether the user can view the assignment.
     */
    public function view(User $user, TaskAssignment $assignment): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim', 'pimpinan']);
    }

    /**
     * Determine whether the user can create assignments.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim']);
    }

    /**
     * Determine whether the user can update the assignment.
     */
    public function update(User $user, TaskAssignment $assignment): bool
    {
        if ($user->hasAnyRole(['super_admin', 'admin'])) {
            return $assignment->status !== AssignmentStatus::CANCELLED && $assignment->status !== AssignmentStatus::COMPLETED;
        }

        if ($user->hasRole('operator_tim')) {
            // Operator can only edit if still in draft or pending approval
            return in_array($assignment->status, [AssignmentStatus::DRAFT, AssignmentStatus::PENDING_APPROVAL], true);
        }

        return false;
    }

    /**
     * Determine whether the user can approve assignments.
     */
    public function approve(User $user, TaskAssignment $assignment): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'pimpinan']);
    }

    /**
     * Determine whether the user can activate assignments.
     */
    public function activate(User $user, TaskAssignment $assignment): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim']);
    }

    /**
     * Determine whether the user can complete assignments.
     */
    public function complete(User $user, TaskAssignment $assignment): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'operator_tim']);
    }

    /**
     * Determine whether the user can cancel assignments.
     */
    public function cancel(User $user, TaskAssignment $assignment): bool
    {
        if ($user->hasAnyRole(['super_admin', 'admin', 'pimpinan'])) {
            return $assignment->status !== AssignmentStatus::CANCELLED && $assignment->status !== AssignmentStatus::COMPLETED;
        }

        if ($user->hasRole('operator_tim')) {
            return $assignment->status === AssignmentStatus::DRAFT;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the assignment record.
     */
    public function delete(User $user, TaskAssignment $assignment): bool
    {
        return $user->hasRole('super_admin');
    }
}
