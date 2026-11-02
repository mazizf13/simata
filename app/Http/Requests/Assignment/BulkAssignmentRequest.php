<?php

namespace App\Http\Requests\Assignment;

use App\Enums\AssignmentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'task_id' => ['required', 'exists:tasks,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'budget_account_id' => ['nullable', 'exists:budget_accounts,id'],
            'status' => ['nullable', Rule::enum(AssignmentStatus::class)],
            'mitra_assignments' => ['required', 'array', 'min:1'],
            'mitra_assignments.*.mitra_id' => ['required', 'exists:mitras,id'],
            'mitra_assignments.*.volume' => ['required', 'numeric', 'gt:0'],
            'mitra_assignments.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'mitra_assignments.*.notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'task_id.required' => 'Kegiatan survei wajib dipilih.',
            'mitra_assignments.required' => 'Daftar alokasi mitra wajib disertakan.',
            'mitra_assignments.min' => 'Pilih minimal satu mitra untuk penugasan kolektif.',
            'end_date.after_or_equal' => 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai penugasan.',
            'mitra_assignments.*.volume.gt' => 'Setiap mitra harus memiliki volume lebih dari nol.',
        ];
    }
}
