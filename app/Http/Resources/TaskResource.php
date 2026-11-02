<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'team_id' => $this->team_id,
            'team' => new TeamResource($this->whenLoaded('team')),
            'default_unit' => $this->default_unit,
            'default_rate' => (float) $this->default_rate,
            'default_rate_formatted' => 'Rp ' . number_format((float) $this->default_rate, 0, ',', '.'),
            'default_budget_account_id' => $this->default_budget_account_id,
            'default_budget_account' => new BudgetAccountResource($this->whenLoaded('defaultBudgetAccount')),
            'description' => $this->description,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
