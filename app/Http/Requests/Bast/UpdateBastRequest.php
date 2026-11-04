<?php

namespace App\Http\Requests\Bast;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBastRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $bastId = $this->route('id') ?? $this->route('bast');

        return [
            'bast_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('basts', 'bast_number')->ignore($bastId),
            ],
            'bast_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'bast_number.required' => 'Nomor BAST wajib diisi.',
            'bast_number.unique' => 'Nomor BAST sudah digunakan.',
            'bast_date.required' => 'Tanggal BAST wajib diisi.',
        ];
    }
}
