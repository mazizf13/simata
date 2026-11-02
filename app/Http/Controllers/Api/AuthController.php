<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Http\Responses\ApiResponse;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * Handle login attempt.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->login($request);

        return ApiResponse::success([
            'user' => new UserResource($user),
        ], 'Login berhasil. Selamat datang di SIMATA.');
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request);

        return ApiResponse::success(null, 'Sesi telah ditutup. Anda berhasil logout.');
    }

    /**
     * Get currently authenticated user profile with roles and teams.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Sesi tidak aktif.', 401, [], 'UNAUTHENTICATED');
        }

        $user->load(['roles', 'teams']);

        return ApiResponse::success([
            'user' => new UserResource($user),
        ], 'Profil pengguna aktif.');
    }
}
