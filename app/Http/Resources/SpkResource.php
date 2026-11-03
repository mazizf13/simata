<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SpkResource extends JsonResource
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
            'spk_number' => $this->spk_number,
            'contract_date' => $this->contract_date ? $this->contract_date->toDateString() : null,
            'period_start' => $this->period_start ? $this->period_start->toDateString() : null,
            'period_end' => $this->period_end ? $this->period_end->toDateString() : null,
            'occupation' => $this->occupation,
            'position' => $this->position,
            'work_address' => $this->work_address,
            'notes' => $this->notes,
            'document_path' => $this->document_path,
            'document_hash' => $this->document_hash,
            'has_document' => !empty($this->document_path),
            'generated_at' => $this->generated_at ? $this->generated_at->toISOString() : null,

            // Status
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
                'badge_variant' => $this->status->badgeVariant(),
            ],

            // Derived totals
            'total_value' => (float) $this->total_value,
            'formatted_total_value' => 'Rp ' . number_format((float) $this->total_value, 0, ',', '.'),
            'tasks_count' => $this->whenCounted('taskAssignments', $this->task_assignments_count, function () {
                return $this->relationLoaded('taskAssignments') ? $this->taskAssignments->count() : $this->taskAssignments()->count();
            }),

            // Relations
            'mitra' => new MitraResource($this->whenLoaded('mitra')),
            'creator' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'email' => $this->creator->email,
            ]),
            'task_assignments' => TaskAssignmentResource::collection($this->whenLoaded('taskAssignments')),

            // Timestamps
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toIso8601String() : null,
        ];
    }
}
