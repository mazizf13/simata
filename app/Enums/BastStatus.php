<?php

namespace App\Enums;

enum BastStatus: string
{
    case DRAFT = 'draft';
    case SUBMITTED = 'submitted';
    case APPROVED = 'approved';
    case CANCELLED = 'cancelled';

    /**
     * Human-readable label in formal Indonesian.
     */
    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draf',
            self::SUBMITTED => 'Diserahkan Mitra',
            self::APPROVED => 'Diterima & Disahkan',
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
            self::SUBMITTED => 'warning',
            self::APPROVED => 'success',
            self::CANCELLED => 'error',
        };
    }

    /**
     * State machine transitions.
     */
    public function canTransitionTo(self $next): bool
    {
        if ($this === $next) {
            return true;
        }

        return match ($this) {
            self::DRAFT => in_array($next, [self::SUBMITTED, self::APPROVED, self::CANCELLED], true),
            self::SUBMITTED => in_array($next, [self::APPROVED, self::CANCELLED], true),
            self::APPROVED => false,
            self::CANCELLED => false,
        };
    }
}
