<?php

namespace App\Http\Middleware;

use App\Http\Responses\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTeamAccess
{
    /**
     * Handle an incoming request for team-scoped resources.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $paramName = 'team_id'): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Sesi autentikasi tidak ditemukan.', 401, [], 'UNAUTHENTICATED');
        }

        // Super Admin, Admin, and Pimpinan can view across all teams
        if ($user->hasAnyRole(['super_admin', 'admin', 'pimpinan'])) {
            return $next($request);
        }

        // For Operator Tim, check if they belong to the requested team
        $requestedTeamId = $request->input($paramName) ?? $request->route($paramName);

        if ($requestedTeamId && ! $user->belongsToTeam((int) $requestedTeamId)) {
            return ApiResponse::error('Anda tidak memiliki wewenang mengakses data di luar tim Anda.', 403, [], 'FORBIDDEN_TEAM');
        }

        return $next($request);
    }
}
