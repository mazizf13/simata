<?php

namespace Database\Factories;

use App\Models\BudgetAccount;
use App\Models\Task;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => 'TASK-' . fake()->unique()->numerify('####'),
            'team_id' => Team::factory(),
            'name' => 'Survei ' . fake()->words(3, true),
            'default_unit' => 'Dokumen',
            'default_rate' => fake()->randomElement([50000, 75000, 100000, 150000]),
            'default_budget_account_id' => BudgetAccount::factory(),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
