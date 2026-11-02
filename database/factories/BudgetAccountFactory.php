<?php

namespace Database\Factories;

use App\Models\BudgetAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BudgetAccount>
 */
class BudgetAccountFactory extends Factory
{
    protected $model = BudgetAccount::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->numerify('####.BMA.###.###.######'),
            'name' => 'Akun Anggaran ' . fake()->words(3, true),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
