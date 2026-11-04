<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Bast
 */
class BastResource extends JsonResource
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
            'spk_id' => $this->spk_id,
            'bast_number' => $this->bast_number,
            'bast_date' => $this->bast_date?->format('Y-m-d'),
            'formatted_bast_date' => $this->bast_date ? Carbon::parse($this->bast_date)->translatedFormat('j F Y') : '-',
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
                'variant' => $this->status->badgeVariant(),
            ],
            'notes' => $this->notes,
            'has_document' => !empty($this->document_path),
            'generated_at' => $this->generated_at?->toIso8601String(),
            'spk' => new SpkResource($this->whenLoaded('spk')),
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),
            'approver' => $this->whenLoaded('approver', function () {
                return [
                    'id' => $this->approver->id,
                    'name' => $this->approver->name,
                ];
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
