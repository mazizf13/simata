<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\TaskService;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TaskController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected TaskService $taskService
    ) {}

    /**
     * Get paginated tasks with filters.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Task::class);

        $filters = $request->only(['search', 'team_id', 'is_active', 'sort', 'direction']);
        $perPage = (int) $request->input('per_page', 15);

        $tasks = $this->taskService->getPaginatedTasks($filters, $perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar kegiatan survei berhasil diambil.',
            'data' => TaskResource::collection($tasks->items()),
            'meta' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
            'links' => [
                'first' => $tasks->url(1),
                'last' => $tasks->url($tasks->lastPage()),
                'prev' => $tasks->previousPageUrl(),
                'next' => $tasks->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Get active tasks (for assignment dropdowns, etc.).
     */
    public function active(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Task::class);

        $teamId = $request->has('team_id') ? (int) $request->input('team_id') : null;
        $tasks = $this->taskService->getActiveTasksByTeam($teamId);

        return $this->ok(TaskResource::collection($tasks), 'Daftar kegiatan aktif berhasil diambil.');
    }

    /**
     * Create new task.
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        Gate::authorize('create', Task::class);

        $task = $this->taskService->createTask($request->validated());
        $task->load(['team', 'defaultBudgetAccount']);

        return $this->created(new TaskResource($task), 'Kegiatan survei berhasil ditambahkan.');
    }

    /**
     * Get task detail.
     */
    public function show(int|string $id): JsonResponse
    {
        Gate::authorize('view', Task::class);

        $task = $this->taskService->getTaskById($id);

        return $this->ok(new TaskResource($task), 'Detail kegiatan berhasil diambil.');
    }

    /**
     * Update task.
     */
    public function update(UpdateTaskRequest $request, int|string $id): JsonResponse
    {
        Gate::authorize('update', Task::class);

        $task = $this->taskService->updateTask($id, $request->validated());
        $task->load(['team', 'defaultBudgetAccount']);

        return $this->ok(new TaskResource($task), 'Data kegiatan berhasil diperbarui.');
    }

    /**
     * Deactivate task.
     */
    public function deactivate(int|string $id): JsonResponse
    {
        Gate::authorize('delete', Task::class);

        $task = $this->taskService->deactivateTask($id);
        $task->load(['team', 'defaultBudgetAccount']);

        return $this->ok(new TaskResource($task), 'Status kegiatan berhasil dinonaktifkan.');
    }
}
