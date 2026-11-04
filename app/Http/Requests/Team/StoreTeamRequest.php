<?php

namespace App\Http\Requests\Team;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeamRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:30', 'unique:teams,code'],
            'name' => ['required', 'string', 'max:100', 'unique:teams,name'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.required' => 'Kode tim wajib diisi.',
            'code.unique' => 'Kode tim sudah digunakan.',
            'name.required' => 'Nama tim wajib diisi.',
            'name.unique' => 'Nama tim sudah terdaftar.',
        ];
    }
}
