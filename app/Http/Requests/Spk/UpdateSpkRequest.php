<?php

namespace App\Http\Requests\Spk;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSpkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $spk = $this->route('spk');
        $spkId = is_object($spk) ? $spk->id : $spk;

        return [
            'mitra_id' => ['sometimes', 'required', 'exists:mitras,id'],
            'spk_number' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('spks', 'spk_number')->ignore($spkId),
            ],
            'contract_date' => ['sometimes', 'required', 'date'],
            'period_start' => ['sometimes', 'required', 'date'],
            'period_end' => ['sometimes', 'required', 'date', 'after_or_equal:period_start'],
            'occupation' => ['nullable', 'string', 'max:100'],
            'position' => ['nullable', 'string', 'max:100'],
            'work_address' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
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
