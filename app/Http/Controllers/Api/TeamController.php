<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Team\StoreTeamRequest;
use App\Http\Requests\Team\UpdateTeamRequest;
use App\Http\Resources\TeamResource;
use App\Http\Resources\UserResource;
use App\Models\Team;
use App\Models\User;
use App\Services\TeamService;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TeamController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected TeamService $teamService
    ) {}

    /**
     * Get list of teams.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Team::class);

        $teams = $this->teamService->getAllTeams();

        return $this->ok(TeamResource::collection($teams), 'Daftar tim kerja BPS berhasil diambil.');
    }

    /**
     * Get active teams (for dropdowns).
     */
    public function active(): JsonResponse
    {
        Gate::authorize('viewAny', Team::class);

        $teams = $this->teamService->getActiveTeams();

        return $this->ok(TeamResource::collection($teams), 'Daftar tim aktif berhasil diambil.');
    }

    /**
     * Create team.
     */
    public function store(StoreTeamRequest $request): JsonResponse
    {
        Gate::authorize('create', Team::class);

        $team = $this->teamService->createTeam($request->validated());
        $team->loadCount(['users', 'tasks']);

        return $this->created(new TeamResource($team), 'Tim kerja berhasil ditambahkan.');
    }

    /**
     * Get team detail.
     */
    public function show(int|string $id): JsonResponse
    {
        Gate::authorize('view', Team::class);

        $team = $this->teamService->getTeamById($id);

        return $this->ok(new TeamResource($team), 'Detail tim kerja berhasil diambil.');
    }

    /**
     * Update team.
     */
    public function update(UpdateTeamRequest $request, int|string $id): JsonResponse
    {
        Gate::authorize('update', Team::class);

        $team = $this->teamService->updateTeam($id, $request->validated());
        $team->loadCount(['users', 'tasks']);

        return $this->ok(new TeamResource($team), 'Data tim kerja berhasil diperbarui.');
    }

    /**
     * Deactivate team.
     */
    public function deactivate(int|string $id): JsonResponse
    {
        Gate::authorize('delete', Team::class);

        $team = $this->teamService->deactivateTeam($id);
        $team->loadCount(['users', 'tasks']);

        return $this->ok(new TeamResource($team), 'Status tim kerja berhasil dinonaktifkan.');
    }

    /**
     * Get list of users (for assigning as team operators).
     */
    public function users(): JsonResponse
    {
        Gate::authorize('viewAny', Team::class);

        $users = User::with('roles')
            ->where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();

        return $this->ok(UserResource::collection($users), 'Daftar pengguna operator berhasil diambil.');
    }
}
