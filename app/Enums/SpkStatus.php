<?php

namespace App\Enums;

enum SpkStatus: string
{
    case DRAFT = 'draft';
    case ACTIVE = 'active';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    /**
     * Human-readable label in formal Indonesian.
     */
    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draf',
            self::ACTIVE => 'Aktif',
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
            self::ACTIVE => 'success',
            self::COMPLETED => 'secondary',
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
            self::DRAFT => in_array($next, [self::ACTIVE, self::CANCELLED], true),
            self::ACTIVE => in_array($next, [self::COMPLETED, self::CANCELLED], true),
            self::COMPLETED => false,
            self::CANCELLED => false,
        };
    }
}
