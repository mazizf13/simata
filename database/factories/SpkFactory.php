<?php

namespace Database\Factories;

use App\Enums\SpkStatus;
use App\Models\Mitra;
use App\Models\Spk;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Spk>
 */
class SpkFactory extends Factory
{
    protected $model = Spk::class;

    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('now', '+1 month');
        $endDate = (clone $startDate)->modify('+14 days');

        return [
            'mitra_id' => Mitra::factory(),
            'spk_number' => 'SPK-3516/' . fake()->unique()->numerify('####/2026'),
            'contract_date' => now()->toDateString(),
            'period_start' => $startDate->format('Y-m-d'),
            'period_end' => $endDate->format('Y-m-d'),
            'occupation' => 'Mitra Statistik',
            'position' => 'Pencacah Lapangan',
            'work_address' => 'Kabupaten Mojokerto',
            'status' => SpkStatus::DRAFT,
            'notes' => fake()->sentence(),
            'created_by' => User::factory(),
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => ['status' => SpkStatus::ACTIVE]);
    }

    public function completed(): static
    {
        return $this->state(fn () => ['status' => SpkStatus::COMPLETED]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => ['status' => SpkStatus::CANCELLED]);
    }
}
