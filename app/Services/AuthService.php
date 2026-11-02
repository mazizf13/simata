<?php

namespace App\Services;

use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthService
{
    public function __construct(
        protected UserRepositoryInterface $userRepository
    ) {}

    /**
     * Authenticate user, regenerate session, and return user model with relations.
     */
    public function login(LoginRequest $request): User
    {
        $request->authenticate();

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        /** @var User $currentUser */
        $currentUser = Auth::user();
        
        // Eager load roles and teams via repository find
        /** @var User $user */
        $user = $this->userRepository->findOrFail($currentUser->id, ['*'], ['roles', 'teams']);

        Log::info('Pengguna berhasil melakukan otentikasi SIMATA', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
        ]);

        return $user;
    }

    /**
     * Log user out and invalidate current session/tokens safely.
     */
    public function logout(Request $request): void
    {
        $user = $request->user();
        $userId = $user?->id ?? Auth::id();

        Auth::guard('web')->logout();

        if ($user && method_exists($user, 'currentAccessToken') && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        Log::info('Pengguna berhasil menutup sesi SIMATA', [
            'user_id' => $userId,
            'ip' => $request->ip(),
        ]);
    }
}
