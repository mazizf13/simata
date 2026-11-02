<?php

namespace App\Enums;

enum AssignmentStatus: string
{
    case DRAFT = 'draft';
    case PENDING_APPROVAL = 'pending_approval';
    case APPROVED = 'approved';
    case ACTIVE = 'active';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    /**
     * Check if the status counts toward monthly assignment and honor limits.
     */
    public function isCounted(): bool
    {
        return in_array($this, [self::APPROVED, self::ACTIVE, self::COMPLETED], true);
    }

    /**
     * Array of statuses that count toward limits.
     *
     * @return array<string>
     */
    public static function countedStatuses(): array
    {
        return [
            self::APPROVED->value,
            self::ACTIVE->value,
            self::COMPLETED->value,
        ];
    }

    /**
     * Array of statuses that are excluded from limits.
     *
     * @return array<string>
     */
    public static function excludedStatuses(): array
    {
        return [
            self::DRAFT->value,
            self::PENDING_APPROVAL->value,
            self::CANCELLED->value,
        ];
    }

    /**
     * Human-readable label in formal Indonesian.
     */
    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draf',
            self::PENDING_APPROVAL => 'Menunggu Persetujuan',
            self::APPROVED => 'Disetujui',
            self::ACTIVE => 'Aktif Berjalan',
            self::COMPLETED => 'Selesai',
            self::CANCELLED => 'Dibatalkan',
        };
    }

    /**
     * Visual status badge variant.
     */
    public function badgeVariant(): string
    {
        return match ($this) {
            self::DRAFT => 'neutral',
            self::PENDING_APPROVAL => 'warning',
            self::APPROVED => 'primary',
            self::ACTIVE => 'success',
            self::COMPLETED => 'secondary',
            self::CANCELLED => 'error',
        };
    }

    /**
     * Determine valid transition targets from current status.
     *
     * @param AssignmentStatus $next
     * @return bool
     */
    public function canTransitionTo(self $next): bool
    {
        if ($this === $next) {
            return true;
        }

        return match ($this) {
            self::DRAFT => in_array($next, [self::PENDING_APPROVAL, self::CANCELLED, self::APPROVED], true),
            self::PENDING_APPROVAL => in_array($next, [self::APPROVED, self::DRAFT, self::CANCELLED], true),
            self::APPROVED => in_array($next, [self::ACTIVE, self::CANCELLED], true),
            self::ACTIVE => in_array($next, [self::COMPLETED, self::CANCELLED], true),
            self::COMPLETED => false, // Terminal status
            self::CANCELLED => false, // Terminal status
        };
    }
}
