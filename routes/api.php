<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BudgetAccountController;
use App\Http\Controllers\Api\DistrictController;
use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Controllers\Api\HonorCalculationController;
use App\Http\Controllers\Api\MitraController;
use App\Http\Controllers\Api\TaskAssignmentController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TeamController;
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

// Master Data & Protected Business Routes
Route::middleware('auth:sanctum')->group(function () {
    // Mitra Statistik
    Route::get('/mitras', [MitraController::class, 'index']);
    Route::post('/mitras', [MitraController::class, 'store']);
    Route::get('/mitras/{id}', [MitraController::class, 'show']);
    Route::put('/mitras/{id}', [MitraController::class, 'update']);
    Route::delete('/mitras/{id}', [MitraController::class, 'deactivate']);
    Route::post('/mitras/{id}/deactivate', [MitraController::class, 'deactivate']);

    // Kegiatan Survei / Tasks
    Route::get('/tasks/active', [TaskController::class, 'active']);
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    Route::put('/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskController::class, 'deactivate']);
    Route::post('/tasks/{id}/deactivate', [TaskController::class, 'deactivate']);

    // Tim Kerja / Teams
    Route::get('/teams/active', [TeamController::class, 'active']);
    Route::get('/teams', [TeamController::class, 'index']);
    Route::post('/teams', [TeamController::class, 'store']);
    Route::get('/teams/{id}', [TeamController::class, 'show']);
    Route::put('/teams/{id}', [TeamController::class, 'update']);
    Route::delete('/teams/{id}', [TeamController::class, 'deactivate']);
    Route::post('/teams/{id}/deactivate', [TeamController::class, 'deactivate']);

    // Akun Anggaran / Budget Accounts
    Route::get('/budget-accounts/active', [BudgetAccountController::class, 'active']);
    Route::get('/budget-accounts', [BudgetAccountController::class, 'index']);
    Route::post('/budget-accounts', [BudgetAccountController::class, 'store']);
    Route::get('/budget-accounts/{id}', [BudgetAccountController::class, 'show']);
    Route::put('/budget-accounts/{id}', [BudgetAccountController::class, 'update']);
    Route::delete('/budget-accounts/{id}', [BudgetAccountController::class, 'deactivate']);
    Route::post('/budget-accounts/{id}/deactivate', [BudgetAccountController::class, 'deactivate']);

    // Kecamatan / Districts
    Route::get('/districts/active', [DistrictController::class, 'active']);
    Route::get('/districts', [DistrictController::class, 'index']);
    Route::get('/districts/{id}', [DistrictController::class, 'show']);

    // Penugasan Mitra / Task Assignments
    Route::post('/assignments/simulate-limit', [TaskAssignmentController::class, 'simulateLimit']);
    Route::post('/assignments/bulk-simulate', [TaskAssignmentController::class, 'bulkSimulate']);
    Route::post('/assignments/bulk', [TaskAssignmentController::class, 'bulkStore']);
    Route::get('/assignments', [TaskAssignmentController::class, 'index']);
    Route::post('/assignments', [TaskAssignmentController::class, 'store']);
    Route::get('/assignments/{id}', [TaskAssignmentController::class, 'show']);
    Route::put('/assignments/{id}', [TaskAssignmentController::class, 'update']);
    Route::post('/assignments/{id}/submit', [TaskAssignmentController::class, 'submit']);
    Route::post('/assignments/{id}/approve', [TaskAssignmentController::class, 'approve']);
    Route::post('/assignments/{id}/activate', [TaskAssignmentController::class, 'activate']);
    Route::post('/assignments/{id}/complete', [TaskAssignmentController::class, 'complete']);
    Route::post('/assignments/{id}/cancel', [TaskAssignmentController::class, 'cancel']);

    // Kalkulasi Honor & Kuota Bulanan Mitra
    Route::get('/mitras/{id}/honor-summary', [HonorCalculationController::class, 'summary']);
    Route::get('/mitras/{id}/honor-breakdown', [HonorCalculationController::class, 'breakdown']);
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
