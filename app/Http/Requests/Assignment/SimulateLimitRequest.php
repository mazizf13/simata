<?php

namespace App\Http\Requests\Assignment;

use Illuminate\Foundation\Http\FormRequest;

class SimulateLimitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mitra_id' => ['required', 'exists:mitras,id'],
            'start_date' => ['required', 'date'],
            'volume' => ['required', 'numeric', 'gt:0'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'exclude_assignment_id' => ['nullable', 'integer'],
        ];
    }
}
