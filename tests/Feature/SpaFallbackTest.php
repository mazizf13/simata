<?php

namespace Tests\Feature;

use Tests\TestCase;

class SpaFallbackTest extends TestCase
{
    public function test_spa_root_serves_app_blade_view(): void
    {
        $response = $this->get('/app/dashboard');

        $response->assertStatus(200)
            ->assertSee('id="root"', false)
            ->assertSee('SIMATA', false);
    }

    public function test_spa_login_route_serves_app_blade_view(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200)
            ->assertSee('id="root"', false);
    }
}
