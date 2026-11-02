<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskAssignmentResource extends JsonResource
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
            'mitra_id' => $this->mitra_id,
            'task_id' => $this->task_id,
            'spk_id' => $this->spk_id,
            'budget_account_id' => $this->budget_account_id,

            // Relations
            'mitra' => new MitraResource($this->whenLoaded('mitra')),
            'task' => new TaskResource($this->whenLoaded('task')),
            'budget_account' => new BudgetAccountResource($this->whenLoaded('budgetAccount')),
            'spk' => $this->whenLoaded('spk'),

            // Immutable Snapshots
            'snapshots' => [
                'task_name' => $this->task_name_snapshot,
                'team_name' => $this->team_name_snapshot,
                'budget_account_code' => $this->budget_account_code_snapshot,
                'budget_account_name' => $this->budget_account_name_snapshot,
                'unit' => $this->unit_snapshot,
                'unit_price' => (float) $this->unit_price_snapshot,
            ],

            // Period & Quantities
            'start_date' => $this->start_date ? $this->start_date->toDateString() : null,
            'end_date' => $this->end_date ? $this->end_date->toDateString() : null,
            'volume' => (float) $this->volume,
            'unit_price' => (float) $this->unit_price,
            'total_value' => (float) $this->total_value,
            'formatted_total_value' => 'Rp ' . number_format((float) $this->total_value, 0, ',', '.'),

            // Status & Workflow
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
                'badge_variant' => $this->status->badgeVariant(),
                'is_counted' => $this->status->isCounted(),
            ],
            'notes' => $this->notes,

            // Tracking & Audits
            'created_by' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ]),
            'approved_by' => $this->whenLoaded('approver', fn () => [
                'id' => $this->approver->id,
                'name' => $this->approver->name,
            ]),
            'approved_at' => $this->approved_at ? $this->approved_at->toISOString() : null,
            'cancelled_by' => $this->whenLoaded('canceller', fn () => [
                'id' => $this->canceller->id,
                'name' => $this->canceller->name,
            ]),
            'cancelled_at' => $this->cancelled_at ? $this->cancelled_at->toISOString() : null,
            'cancellation_reason' => $this->cancellation_reason,

            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
}
