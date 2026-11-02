<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
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
        $taskId = $this->route('task') ?? $this->route('id');

        return [
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('tasks', 'code')->ignore($taskId),
            ],
            'team_id' => ['required', 'integer', 'exists:teams,id'],
            'name' => ['required', 'string', 'max:200'],
            'default_unit' => ['required', 'string', 'max:50'],
            'default_rate' => ['required', 'numeric', 'min:0'],
            'default_budget_account_id' => ['nullable', 'integer', 'exists:budget_accounts,id'],
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
            'code.unique' => 'Kode tugas sudah digunakan kegiatan lain.',
            'team_id.required' => 'Tim penanggung jawab wajib dipilih.',
            'team_id.exists' => 'Tim yang dipilih tidak valid.',
            'name.required' => 'Nama kegiatan wajib diisi.',
            'default_unit.required' => 'Satuan standar wajib diisi.',
            'default_rate.required' => 'Tarif standar wajib diisi.',
        ];
    }
}
