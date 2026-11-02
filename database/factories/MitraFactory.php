<?php

namespace Database\Factories;

use App\Models\District;
use App\Models\Mitra;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Mitra>
 */
class MitraFactory extends Factory
{
    protected $model = Mitra::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'mitra_code' => 'MITRA-3516-' . fake()->unique()->numerify('####'),
            'name' => fake()->name(),
            'address' => fake()->address(),
            'district_id' => District::factory(),
            'phone' => '08' . fake()->numerify('##########'),
            'email' => fake()->safeEmail(),
            'occupation' => 'Pencacah Lapangan',
            'position' => 'Mitra Statistik',
            'status' => 'active',
            'notes' => fake()->sentence(),
        ];
    }
}
