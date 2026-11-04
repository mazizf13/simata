<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assignment\BulkAssignmentRequest;
use App\Http\Requests\Assignment\CancelAssignmentRequest;
use App\Http\Requests\Assignment\SimulateLimitRequest;
use App\Http\Requests\Assignment\StoreAssignmentRequest;
use App\Http\Requests\Assignment\UpdateAssignmentRequest;
use App\Http\Resources\TaskAssignmentResource;
use App\Models\TaskAssignment;
use App\Repositories\Contracts\TaskAssignmentRepositoryInterface;
use App\Services\AssignmentLimitService;
use App\Services\AssignmentService;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TaskAssignmentController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected AssignmentService $assignmentService,
        protected AssignmentLimitService $limitService,
        protected TaskAssignmentRepositoryInterface $assignmentRepository
    ) {}

    /**
     * Get paginated assignments with filtering.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', TaskAssignment::class);

        $filters = $request->only([
            'search',
            'mitra_id',
            'task_id',
            'status',
            'year',
            'month',
            'sort',
            'direction',
        ]);
        $perPage = (int) $request->input('per_page', 15);

        $assignments = $this->assignmentRepository->paginateAssignments($filters, $perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar penugasan mitra berhasil diambil.',
            'data' => TaskAssignmentResource::collection($assignments->items()),
            'meta' => [
                'current_page' => $assignments->currentPage(),
                'last_page' => $assignments->lastPage(),
                'per_page' => $assignments->perPage(),
                'total' => $assignments->total(),
            ],
            'links' => [
                'first' => $assignments->url(1),
                'last' => $assignments->url($assignments->lastPage()),
                'prev' => $assignments->previousPageUrl(),
                'next' => $assignments->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Create single assignment.
     */
    public function store(StoreAssignmentRequest $request): JsonResponse
    {
        Gate::authorize('create', TaskAssignment::class);

        $assignment = $this->assignmentService->createAssignment(
            $request->validated(),
            $request->user()
        );
        $assignment->load(['mitra', 'task', 'budgetAccount', 'creator']);

        return $this->created(
            new TaskAssignmentResource($assignment),
            'Penugasan mitra berhasil dibuat.'
        );
    }

    /**
     * Get assignment detail.
     */
    public function show(int|string $id): JsonResponse
    {
        /** @var TaskAssignment $assignment */
        $assignment = TaskAssignment::with(['mitra.district', 'task.team', 'budgetAccount', 'creator', 'approver', 'canceller', 'spk'])
            ->findOrFail($id);

        Gate::authorize('view', $assignment);

        return $this->ok(
            new TaskAssignmentResource($assignment),
            'Detail penugasan berhasil diambil.'
        );
    }

    /**
     * Update assignment.
     */
    public function update(UpdateAssignmentRequest $request, int|string $id): JsonResponse
    {
        /** @var TaskAssignment $assignment */
        $assignment = TaskAssignment::findOrFail($id);
        Gate::authorize('update', $assignment);

        $updated = $this->assignmentService->updateAssignment(
            $id,
            $request->validated(),
            $request->user()
        );
        $updated->load(['mitra', 'task', 'budgetAccount', 'creator']);

        return $this->ok(
            new TaskAssignmentResource($updated),
            'Data penugasan berhasil diperbarui.'
        );
    }

    /**
     * Bulk create assignments.
     */
    public function bulkStore(BulkAssignmentRequest $request): JsonResponse
    {
        Gate::authorize('create', TaskAssignment::class);

        $result = $this->assignmentService->bulkCreateAssignments(
            $request->validated(),
            $request->user()
        );

        return $this->ok($result, 'Penugasan kolektif selesai diproses.');
    }

    /**
     * Simulate bulk assignment validation before saving.
     */
    public function bulkSimulate(BulkAssignmentRequest $request): JsonResponse
    {
        Gate::authorize('create', TaskAssignment::class);

        $simulation = $this->assignmentService->simulateBulkValidation($request->validated());

        return $this->ok($simulation, 'Simulasi validasi penugasan kolektif selesai.');
    }

    /**
     * Simulate single limit validation in real time.
     */
    public function simulateLimit(SimulateLimitRequest $request): JsonResponse
    {
        Gate::authorize('create', TaskAssignment::class);

        $mitraId = $request->input('mitra_id');
        $startDate = $request->input('start_date');
        $volume = (float) $request->input('volume');
        $unitPrice = (float) $request->input('unit_price');
        $excludeId = $request->input('exclude_assignment_id');

        $totalHonor = TaskAssignment::computeTotalValue($volume, $unitPrice);

        $result = $this->limitService->checkLimits(
            $mitraId,
            $startDate,
            $totalHonor,
            1,
            $excludeId
        );

        return $this->ok($result, 'Simulasi batas penugasan berhasil dikalkulasi.');
    }

    /**
     * Submit draft assignment for approval.
     */
    public function submit(int|string $id, Request $request): JsonResponse
    {
        /** @var TaskAssignment $assignment */
        $assignment = TaskAssignment::findOrFail($id);
        Gate::authorize('update', $assignment);

        $submitted = $this->assignmentService->submitForApproval($id, $request->user());

        return $this->ok(
            new TaskAssignmentResource($submitted),
            'Penugasan berhasil diajukan untuk persetujuan.'
        );
    }

    /**
     * Approve assignment.
     */
    public function approve(int|string $id, Request $request): JsonResponse
    {
        /** @var TaskAssignment $assignment */
        $assignment = TaskAssignment::findOrFail($id);
        Gate::authorize('approve', $assignment);

        $approved = $this->assignmentService->approveAssignment($id, $request->user());
        $approved->load(['mitra', 'task', 'budgetAccount']);

        return $this->ok(
            new TaskAssignmentResource($approved),
            'Penugasan berhasil disetujui.'
        );
    }

    /**
     * Activate approved assignment.
     */
    public function activate(int|string $id, Request $request): JsonResponse
    {
        /** @var TaskAssignment $assignment */
        $assignment = TaskAssignment::findOrFail($id);
        Gate::authorize('activate', $assignment);

        $activated = $this->assignmentService->activateAssignment($id, $request->user());

        return $this->ok(
            new TaskAssignmentResource($activated),
            'Penugasan berhasil diaktifkan.'
        );
    }

    /**
     * Complete assignment.
     */
    public function complete(int|string $id, Request $request): JsonResponse
    {
        /** @var TaskAssignment $assignment */
        $assignment = TaskAssignment::findOrFail($id);
        Gate::authorize('complete', $assignment);

        $completed = $this->assignmentService->completeAssignment($id, $request->user());

        return $this->ok(
            new TaskAssignmentResource($completed),
            'Penugasan berhasil diselesaikan.'
        );
    }

    /**
     * Cancel assignment.
     */
    public function cancel(CancelAssignmentRequest $request, int|string $id): JsonResponse
    {
        /** @var TaskAssignment $assignment */
        $assignment = TaskAssignment::findOrFail($id);
        Gate::authorize('cancel', $assignment);

        $cancelled = $this->assignmentService->cancelAssignment(
            $id,
            $request->input('reason'),
            $request->user()
        );

        return $this->ok(
            new TaskAssignmentResource($cancelled),
            'Penugasan berhasil dibatalkan.'
        );
    }
}
