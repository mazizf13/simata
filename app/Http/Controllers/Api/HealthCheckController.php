<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthCheckController extends Controller
{
    /**
     * Check application, database, and system status.
     */
    public function index(): JsonResponse
    {
        $dbConnected = false;
        $dbLatencyMs = null;

        try {
            $start = microtime(true);
            DB::select('SELECT 1');
            $dbLatencyMs = round((microtime(true) - $start) * 1000, 2);
            $dbConnected = true;
        } catch (\Throwable $e) {
            $dbConnected = false;
        }

        $status = $dbConnected ? 'healthy' : 'unhealthy';
        $httpCode = $dbConnected ? 200 : 503;

        return ApiResponse::success([
            'status' => $status,
            'app_name' => config('app.name'),
            'environment' => config('app.env'),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'database' => [
                'connection' => config('database.default'),
                'connected' => $dbConnected,
                'latency_ms' => $dbLatencyMs,
            ],
            'server_time' => now()->toIso8601String(),
            'timezone' => config('app.timezone'),
        ], 'SIMATA Service Health Status', $httpCode);
    }
}
