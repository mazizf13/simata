<?php

namespace App\Services;

use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthService
{
    /**
     * Authenticate user and regenerate session if available.
     */
    public function login(LoginRequest $request): User
    {
        $request->authenticate();

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        /** @var User $user */
        $user = Auth::user();
        $user->load(['roles', 'teams']);

        Log::info('User berhasil login ke SIMATA', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
        ]);

        return $user;
    }

    /**
     * Log user out and invalidate session if available.
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

        Log::info('User logout dari SIMATA', [
            'user_id' => $userId,
            'ip' => $request->ip(),
        ]);
    }
}
