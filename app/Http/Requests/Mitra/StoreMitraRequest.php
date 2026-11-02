<?php

namespace App\Http\Requests\Mitra;

use Illuminate\Foundation\Http\FormRequest;

class StoreMitraRequest extends FormRequest
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
        return [
            'mitra_code' => ['required', 'string', 'max:30', 'unique:mitras,mitra_code'],
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
            'mitra_code.unique' => 'Kode mitra sudah terdaftar dalam sistem.',
            'name.required' => 'Nama mitra wajib diisi.',
            'district_id.required' => 'Kecamatan domisili mitra wajib dipilih.',
            'district_id.exists' => 'Kecamatan yang dipilih tidak valid dalam referensi wilayah Kabupaten Mojokerto.',
            'email.email' => 'Format alamat email tidak valid.',
        ];
    }
}
