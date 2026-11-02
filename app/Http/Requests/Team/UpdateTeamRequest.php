<?php

namespace App\Http\Requests\Team;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeamRequest extends FormRequest
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
        $teamId = $this->route('team') ?? $this->route('id');

        return [
            'code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('teams', 'code')->ignore($teamId),
            ],
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('teams', 'name')->ignore($teamId),
            ],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
