<?php

namespace App\Http\Requests\Assignment;

use App\Enums\AssignmentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mitra_id' => ['required', 'exists:mitras,id'],
            'task_id' => ['required', 'exists:tasks,id'],
            'spk_id' => ['nullable', 'exists:spks,id'],
            'budget_account_id' => ['nullable', 'exists:budget_accounts,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'volume' => ['required', 'numeric', 'gt:0'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', Rule::enum(AssignmentStatus::class)],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'mitra_id.required' => 'Mitra statistik wajib dipilih.',
            'mitra_id.exists' => 'Mitra yang dipilih tidak valid.',
            'task_id.required' => 'Kegiatan survei wajib dipilih.',
            'task_id.exists' => 'Kegiatan survei yang dipilih tidak valid.',
            'start_date.required' => 'Tanggal mulai penugasan wajib diisi.',
            'end_date.required' => 'Tanggal selesai penugasan wajib diisi.',
            'end_date.after_or_equal' => 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai penugasan.',
            'volume.required' => 'Volume beban tugas wajib diisi.',
            'volume.gt' => 'Volume beban tugas harus lebih besar dari nol.',
            'unit_price.min' => 'Harga satuan tidak boleh bernilai negatif.',
        ];
    }
}
