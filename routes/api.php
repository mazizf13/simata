<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SIMATA API Routes
|--------------------------------------------------------------------------
| Base path: /api
| Standard Response: { success: bool, message: string, data: mixed }
*/

// Health Check
Route::get('/health', [HealthCheckController::class, 'index']);

// Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// Protected Verification & Role-Testing Endpoints
Route::middleware('auth:sanctum')->prefix('rbac')->group(function () {
    Route::get('/super-admin-only', function (Request $request) {
        return ApiResponse::success([
            'role' => 'super_admin',
            'user' => $request->user()->name,
        ], 'Akses Super Admin terverifikasi.');
    })->middleware('role:super_admin');

    Route::get('/admin-access', function (Request $request) {
        return ApiResponse::success([
            'authorized_roles' => ['admin', 'super_admin'],
            'user' => $request->user()->name,
        ], 'Akses Admin terverifikasi.');
    })->middleware('role:admin,super_admin');

    Route::get('/operator-access', function (Request $request) {
        return ApiResponse::success([
            'authorized_roles' => ['operator_tim', 'admin', 'super_admin'],
            'user' => $request->user()->name,
        ], 'Akses Operator Tim terverifikasi.');
    })->middleware('role:operator_tim,admin,super_admin');

    Route::get('/pimpinan-access', function (Request $request) {
        return ApiResponse::success([
            'authorized_roles' => ['pimpinan', 'super_admin'],
            'user' => $request->user()->name,
        ], 'Akses Pimpinan terverifikasi.');
    })->middleware('role:pimpinan,super_admin');
});
