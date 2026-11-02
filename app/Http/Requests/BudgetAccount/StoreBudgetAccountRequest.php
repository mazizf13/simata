<?php

namespace App\Http\Requests\BudgetAccount;

use Illuminate\Foundation\Http\FormRequest;

class StoreBudgetAccountRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:100', 'unique:budget_accounts,code'],
            'name' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.required' => 'Kode akun anggaran wajib diisi.',
            'code.unique' => 'Kode akun anggaran sudah terdaftar.',
            'name.required' => 'Nama/uraian akun anggaran wajib diisi.',
        ];
    }
}
