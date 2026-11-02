<?php

namespace App\Http\Requests\Spk;

use Illuminate\Foundation\Http\FormRequest;

class CancelSpkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:3', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'Alasan pembatalan SPK wajib diisi.',
            'reason.min' => 'Alasan pembatalan minimal 3 karakter.',
            'reason.max' => 'Alasan pembatalan maksimal 500 karakter.',
        ];
    }
}
