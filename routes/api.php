<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BastController;
use App\Http\Controllers\Api\BudgetAccountController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DistrictController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Controllers\Api\HonorCalculationController;
use App\Http\Controllers\Api\MitraController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SpkController;
use App\Http\Controllers\Api\TaskAssignmentController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\UserController;
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
    Route::get('/mitras/template', [MitraController::class, 'downloadTemplate']);
    Route::get('/mitras/export', [MitraController::class, 'export']);
    Route::post('/mitras/import', [MitraController::class, 'import']);
    Route::get('/mitras', [MitraController::class, 'index']);
    Route::post('/mitras', [MitraController::class, 'store']);
    Route::get('/mitras/{id}', [MitraController::class, 'show']);
    Route::put('/mitras/{id}', [MitraController::class, 'update']);
    Route::delete('/mitras/{id}', [MitraController::class, 'deactivate']);
    Route::post('/mitras/{id}/deactivate', [MitraController::class, 'deactivate']);

    // Kegiatan Survei / Tasks
    Route::get('/tasks/next-code', [TaskController::class, 'nextCode']);
    Route::get('/tasks/active', [TaskController::class, 'active']);
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    Route::put('/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskController::class, 'deactivate']);
    Route::post('/tasks/{id}/deactivate', [TaskController::class, 'deactivate']);

    // Tim Kerja / Teams
    Route::get('/teams/active', [TeamController::class, 'active']);
    Route::get('/teams/users', [TeamController::class, 'users']);
    Route::get('/teams', [TeamController::class, 'index']);
    Route::post('/teams', [TeamController::class, 'store']);
    Route::get('/teams/{id}', [TeamController::class, 'show']);
    Route::put('/teams/{id}', [TeamController::class, 'update']);
    Route::delete('/teams/{id}', [TeamController::class, 'deactivate']);
    Route::post('/teams/{id}/deactivate', [TeamController::class, 'deactivate']);

    // Manajemen Pengguna Pegawai (Users & Roles)
    Route::get('/users/roles', [UserController::class, 'roles']);
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'deactivate']);
    Route::post('/users/{id}/deactivate', [UserController::class, 'deactivate']);

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

    // Surat Perjanjian Kerja / SPK
    Route::get('/spks/next-number', [SpkController::class, 'nextNumber']);
    Route::get('/spks', [SpkController::class, 'index']);
    Route::post('/spks', [SpkController::class, 'store']);
    Route::get('/spks/{id}', [SpkController::class, 'show']);
    Route::put('/spks/{id}', [SpkController::class, 'update']);
    Route::post('/spks/{id}/activate', [SpkController::class, 'activate']);
    Route::post('/spks/{id}/complete', [SpkController::class, 'complete']);
    Route::post('/spks/{id}/cancel', [SpkController::class, 'cancel']);
    Route::post('/spks/{id}/generate-document', [SpkController::class, 'generateDocument']);
    Route::get('/spks/{id}/download-document', [SpkController::class, 'downloadDocument']);
    Route::post('/spks/{id}/attach-assignments', [SpkController::class, 'attachAssignments']);
    Route::post('/spks/{id}/detach-assignment/{assignmentId}', [SpkController::class, 'detachAssignment']);
    Route::get('/mitras/{id}/spks', [SpkController::class, 'byMitra']);
    Route::get('/spks/{id}/bast', [BastController::class, 'bySpk']);

    // Berita Acara Serah Terima / BAST
    Route::get('/basts/next-number', [BastController::class, 'nextNumber']);
    Route::get('/basts', [BastController::class, 'index']);
    Route::post('/basts', [BastController::class, 'store']);
    Route::get('/basts/{id}', [BastController::class, 'show']);
    Route::put('/basts/{id}', [BastController::class, 'update']);
    Route::post('/basts/{id}/approve', [BastController::class, 'approve']);
    Route::post('/basts/{id}/generate-document', [BastController::class, 'generateDocument']);
    Route::get('/basts/{id}/download-document', [BastController::class, 'downloadDocument']);

    // Dashboard Analytics (Phase 5)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Monitoring & Reporting (Phase 5)
    Route::get('/reports/monthly', [ReportController::class, 'monthly']);
    Route::get('/reports/teams', [ReportController::class, 'teams']);
    Route::get('/reports/teams/{teamId}/drilldown', [ReportController::class, 'teamDrilldown']);
    Route::get('/reports/calendar', [ReportController::class, 'calendar']);
    Route::get('/reports/kanban', [ReportController::class, 'kanban']);

    // Exports (Phase 5)
    Route::get('/exports/monthly', [ExportController::class, 'monthly']);
    Route::get('/exports/teams', [ExportController::class, 'teams']);
    Route::get('/exports/assignments', [ExportController::class, 'assignments']);
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
