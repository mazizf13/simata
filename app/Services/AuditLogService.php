<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    /**
     * Log a state or record change.
     *
     * @param string $action
     * @param string $entityType
     * @param int|string $entityId
     * @param array<string, mixed>|null $oldValues
     * @param array<string, mixed>|null $newValues
     * @param int|string|null $userId
     * @return AuditLog
     */
    public function log(
        string $action,
        string $entityType,
        int|string $entityId,
        ?array $oldValues = null,
        ?array $newValues = null,
        int|string|null $userId = null
    ): AuditLog {
        return AuditLog::create([
            'user_id' => $userId ?? Auth::id(),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'created_at' => now(),
        ]);
    }
}
