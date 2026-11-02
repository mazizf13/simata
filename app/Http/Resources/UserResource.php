<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'is_active' => (bool) $this->is_active,
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            'teams' => TeamResource::collection($this->whenLoaded('teams')),
            'primary_role' => $this->roles->first()?->name ?? null,
            'permissions' => [
                'can_manage_users' => $this->hasAnyRole(['super_admin', 'admin']),
                'can_manage_master' => $this->hasAnyRole(['super_admin', 'admin']),
                'can_approve_assignments' => $this->hasAnyRole(['super_admin', 'admin']),
                'can_view_audit_logs' => $this->hasAnyRole(['super_admin', 'admin']),
                'can_view_all_reports' => $this->hasAnyRole(['super_admin', 'admin', 'pimpinan']),
            ],
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
