<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\RoleResource;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use ApiResponses;

    /**
     * Get paginated users with roles and teams.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $query = User::with(['roles', 'teams'])
            ->orderBy('is_active', 'desc')
            ->orderBy('name', 'asc');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active') && $request->input('is_active') !== '') {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = (int) $request->input('per_page', 15);
        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengguna berhasil diambil.',
            'data' => UserResource::collection($users->items()),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Get list of all available roles.
     */
    public function roles(): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $roles = Role::orderBy('id', 'asc')->get();

        return $this->ok(RoleResource::collection($roles), 'Daftar role pengguna berhasil diambil.');
    }

    /**
     * Create new user account.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        Gate::authorize('create', User::class);

        $validated = $request->validated();

        $user = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            if (!empty($validated['role_ids'])) {
                $user->roles()->sync($validated['role_ids']);
            }

            if (isset($validated['team_ids'])) {
                $user->teams()->sync($validated['team_ids']);
            }

            return $user;
        });

        $user->load(['roles', 'teams']);

        return $this->created(new UserResource($user), 'Akun pengguna pegawai berhasil dibuat.');
    }

    /**
     * Get specific user details.
     */
    public function show(int|string $id): JsonResponse
    {
        $user = User::with(['roles', 'teams'])->findOrFail($id);
        Gate::authorize('view', $user);

        return $this->ok(new UserResource($user), 'Detail pengguna berhasil diambil.');
    }

    /**
     * Update user account.
     */
    public function update(UpdateUserRequest $request, int|string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        Gate::authorize('update', $user);

        $validated = $request->validated();

        DB::transaction(function () use ($user, $validated) {
            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'is_active' => $validated['is_active'] ?? $user->is_active,
            ];

            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $user->update($updateData);

            if (!empty($validated['role_ids'])) {
                $user->roles()->sync($validated['role_ids']);
            }

            if (isset($validated['team_ids'])) {
                $user->teams()->sync($validated['team_ids']);
            }
        });

        $user->load(['roles', 'teams']);

        return $this->ok(new UserResource($user), 'Data pengguna pegawai berhasil diperbarui.');
    }

    /**
     * Deactivate / toggle active status of user account.
     */
    public function deactivate(int|string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        Gate::authorize('delete', $user);

        $user->update(['is_active' => !$user->is_active]);

        $statusMsg = $user->is_active ? 'diaktifkan kembali' : 'dinonaktifkan';

        return $this->ok(new UserResource($user->load(['roles', 'teams'])), "Akun pengguna berhasil {$statusMsg}.");
    }
}
