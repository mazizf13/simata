<?php

namespace App\Http\Requests\Spk;

use Illuminate\Foundation\Http\FormRequest;

class AttachAssignmentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assignment_ids' => ['required', 'array', 'min:1'],
            'assignment_ids.*' => ['required', 'integer', 'exists:task_assignments,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'assignment_ids.required' => 'Daftar penugasan wajib disertakan.',
            'assignment_ids.min' => 'Pilih minimal satu penugasan untuk dilampirkan.',
            'assignment_ids.*.exists' => 'Penugasan yang dipilih tidak ditemukan.',
        ];
    }
}
