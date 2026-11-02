<?php

namespace App\Http\Middleware;

use App\Http\Responses\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Sesi autentikasi tidak ditemukan. Silakan login kembali.', 401, [], 'UNAUTHENTICATED');
        }

        if (! $user->is_active) {
            return ApiResponse::error('Akun Anda dinonaktifkan.', 403, [], 'USER_INACTIVE');
        }

        // Super Admin always bypasses role check
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        if (! $user->hasAnyRole($roles)) {
            return ApiResponse::error('Anda tidak memiliki wewenang untuk mengakses sumber daya ini.', 403, [], 'FORBIDDEN_ROLE');
        }

        return $next($request);
    }
}
