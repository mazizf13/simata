<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * Handle user login.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->login($request);

        return $this->ok([
            'user' => new UserResource($user),
        ], 'Login berhasil. Selamat datang di SIMATA.');
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request);

        return $this->ok(null, 'Sesi telah ditutup. Anda berhasil logout.');
    }

    /**
     * Fetch authenticated user details.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->error('Sesi tidak aktif.', 401, [], 'UNAUTHENTICATED');
        }

        $user->load(['roles', 'teams']);

        return $this->ok([
            'user' => new UserResource($user),
        ], 'Profil pengguna aktif.');
    }
}
