<?php

namespace App\Http\Requests\Spk;

use Illuminate\Foundation\Http\FormRequest;

class StoreSpkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (empty($this->spk_number) && !empty($this->contract_date)) {
            $this->merge([
                'spk_number' => app(\App\Services\SpkService::class)->generateNextSpkNumber($this->contract_date),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'mitra_id' => ['required', 'exists:mitras,id'],
            'spk_number' => ['required', 'string', 'max:100', 'unique:spks,spk_number'],
            'contract_date' => ['required', 'date'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'occupation' => ['nullable', 'string', 'max:100'],
            'position' => ['nullable', 'string', 'max:100'],
            'work_address' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'assignment_ids' => ['nullable', 'array'],
            'assignment_ids.*' => ['integer', 'exists:task_assignments,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'mitra_id.required' => 'Mitra statistik wajib dipilih.',
            'mitra_id.exists' => 'Mitra yang dipilih tidak ditemukan.',
            'spk_number.required' => 'Nomor SPK wajib diisi.',
            'spk_number.unique' => 'Nomor SPK sudah digunakan.',
            'contract_date.required' => 'Tanggal SPK wajib diisi.',
            'period_start.required' => 'Tanggal awal periode kontrak wajib diisi.',
            'period_end.required' => 'Tanggal akhir periode kontrak wajib diisi.',
            'period_end.after_or_equal' => 'Tanggal akhir periode tidak boleh lebih awal dari tanggal awal periode.',
        ];
    }
}
