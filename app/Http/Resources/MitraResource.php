<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MitraResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'mitra_code' => $this->mitra_code,
            'name' => $this->name,
            'address' => $this->address,
            'district_id' => $this->district_id,
            'district' => new DistrictResource($this->whenLoaded('district')),
            'phone' => $this->phone,
            'email' => $this->email,
            'occupation' => $this->occupation,
            'position' => $this->position,
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
