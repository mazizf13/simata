<?php

namespace App\Http\Requests\Bast;

use Illuminate\Foundation\Http\FormRequest;

class StoreBastRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (empty($this->bast_number) && !empty($this->bast_date)) {
            $this->merge([
                'bast_number' => app(\App\Services\BastService::class)->generateNextBastNumber($this->bast_date),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'spk_id' => ['required', 'exists:spks,id', 'unique:basts,spk_id'],
            'bast_number' => ['required', 'string', 'max:100', 'unique:basts,bast_number'],
            'bast_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'spk_id.required' => 'SPK rujukan wajib dipilih.',
            'spk_id.exists' => 'SPK rujukan tidak ditemukan.',
            'spk_id.unique' => 'SPK ini sudah memiliki Berita Acara Serah Terima (BAST).',
            'bast_number.required' => 'Nomor BAST wajib diisi.',
            'bast_number.unique' => 'Nomor BAST sudah digunakan.',
            'bast_date.required' => 'Tanggal BAST wajib diisi.',
        ];
    }
}
