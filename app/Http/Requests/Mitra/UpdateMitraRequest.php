<?php

namespace App\Http\Requests\Mitra;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMitraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $mitraId = $this->route('mitra') ?? $this->route('id');

        return [
            'mitra_code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('mitras', 'mitra_code')->ignore($mitraId),
            ],
            'name' => ['required', 'string', 'max:150'],
            'address' => ['nullable', 'string'],
            'district_id' => ['required', 'integer', 'exists:districts,id'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'occupation' => ['nullable', 'string', 'max:100'],
            'position' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
            'notes' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'mitra_code.required' => 'Kode mitra wajib diisi.',
            'mitra_code.unique' => 'Kode mitra sudah digunakan oleh mitra lain.',
            'name.required' => 'Nama mitra wajib diisi.',
            'district_id.required' => 'Kecamatan domisili mitra wajib dipilih.',
            'district_id.exists' => 'Kecamatan yang dipilih tidak valid.',
            'email.email' => 'Format email tidak valid.',
        ];
    }
}
