<?php

namespace App\Http\Requests\Assignment;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mitra_id' => ['sometimes', 'required', 'exists:mitras,id'],
            'budget_account_id' => ['nullable', 'exists:budget_accounts,id'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
            'volume' => ['sometimes', 'required', 'numeric', 'gt:0'],
            'unit_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'end_date.after_or_equal' => 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai penugasan.',
            'volume.gt' => 'Volume beban tugas harus lebih besar dari nol.',
            'unit_price.min' => 'Harga satuan tidak boleh bernilai negatif.',
        ];
    }
}
