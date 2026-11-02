<?php

namespace App\Http\Requests\BudgetAccount;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBudgetAccountRequest extends FormRequest
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
        $accountId = $this->route('budget_account') ?? $this->route('id');

        return [
            'code' => [
                'required',
                'string',
                'max:100',
                Rule::unique('budget_accounts', 'code')->ignore($accountId),
            ],
            'name' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
