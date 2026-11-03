<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Spk\AttachAssignmentsRequest;
use App\Http\Requests\Spk\CancelSpkRequest;
use App\Http\Requests\Spk\StoreSpkRequest;
use App\Http\Requests\Spk\UpdateSpkRequest;
use App\Http\Resources\SpkResource;
use App\Models\Spk;
use App\Services\SpkDocumentService;
use App\Services\SpkService;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SpkController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected SpkService $spkService,
        protected SpkDocumentService $documentService
    ) {}

    /**
     * Display a listing of SPKs with filtering & pagination.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Spk::class);

        $filters = $request->only([
            'search',
            'mitra_id',
            'status',
            'year',
            'month',
            'sort',
            'direction',
        ]);
        $perPage = (int) $request->input('per_page', 15);

        $spks = $this->spkService->getPaginatedSpks($filters, $perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar SPK berhasil diambil.',
            'data' => SpkResource::collection($spks->items()),
            'meta' => [
                'current_page' => $spks->currentPage(),
                'last_page' => $spks->lastPage(),
                'per_page' => $spks->perPage(),
                'total' => $spks->total(),
            ],
        ]);
    }

    /**
     * Store a newly created SPK in storage.
     */
    public function store(StoreSpkRequest $request): JsonResponse
    {
        Gate::authorize('create', Spk::class);

        $spk = $this->spkService->createSpk($request->validated(), $request->user());

        return $this->created(
            new SpkResource($spk),
            'Surat Perjanjian Kerja (SPK) berhasil dibuat.'
        );
    }

    /**
     * Display the specified SPK.
     */
    public function show(int|string $id): JsonResponse
    {
        $spk = $this->spkService->getSpkById($id);
        Gate::authorize('view', $spk);

        return $this->ok(
            new SpkResource($spk),
            'Detail SPK berhasil diambil.'
        );
    }

    /**
     * Update the specified SPK in storage.
     */
    public function update(UpdateSpkRequest $request, int|string $id): JsonResponse
    {
        $spk = $this->spkService->getSpkById($id);
        Gate::authorize('update', $spk);

        $updatedSpk = $this->spkService->updateSpk($id, $request->validated(), $request->user());

        return $this->ok(
            new SpkResource($updatedSpk),
            'Data SPK berhasil diperbarui.'
        );
    }

    /**
     * Activate the specified SPK.
     */
    public function activate(int|string $id, Request $request): JsonResponse
    {
        $spk = $this->spkService->getSpkById($id);
        Gate::authorize('activate', $spk);

        $activatedSpk = $this->spkService->activateSpk($id, $request->user());

        return $this->ok(
            new SpkResource($activatedSpk),
            'SPK berhasil diaktifkan.'
        );
    }

    /**
     * Complete the specified SPK.
     */
    public function complete(int|string $id, Request $request): JsonResponse
    {
        $spk = $this->spkService->getSpkById($id);
        Gate::authorize('complete', $spk);

        $completedSpk = $this->spkService->completeSpk($id, $request->user());

        return $this->ok(
            new SpkResource($completedSpk),
            'SPK berhasil diselesaikan.'
        );
    }

    /**
     * Cancel the specified SPK with a reason.
     */
    public function cancel(CancelSpkRequest $request, int|string $id): JsonResponse
    {
        $spk = $this->spkService->getSpkById($id);
        Gate::authorize('cancel', $spk);

        $cancelledSpk = $this->spkService->cancelSpk($id, $request->validated('reason'), $request->user());

        return $this->ok(
            new SpkResource($cancelledSpk),
            'SPK berhasil dibatalkan.'
        );
    }

    /**
     * Attach task assignments to the specified SPK.
     */
    public function attachAssignments(AttachAssignmentsRequest $request, int|string $id): JsonResponse
    {
        $spk = $this->spkService->getSpkById($id);
        Gate::authorize('attachAssignments', $spk);

        $updatedSpk = $this->spkService->attachAssignments($id, $request->validated('assignment_ids'), $request->user());

        return $this->ok(
            new SpkResource($updatedSpk),
            'Penugasan berhasil dilampirkan ke SPK.'
        );
    }

    /**
     * Detach a task assignment from the specified SPK.
     */
    public function detachAssignment(Request $request, int|string $id, int|string $assignmentId): JsonResponse
    {
        $spk = $this->spkService->getSpkById($id);
        Gate::authorize('detachAssignment', $spk);

        $updatedSpk = $this->spkService->detachAssignment($id, $assignmentId, $request->user());

        return $this->ok(
            new SpkResource($updatedSpk),
            'Penugasan berhasil dilepas dari SPK.'
        );
    }

    /**
     * Get all SPKs belonging to a specific mitra.
     */
    public function byMitra(Request $request, int|string $mitraId): JsonResponse
    {
        Gate::authorize('viewAny', Spk::class);

        $status = $request->query('status');
        $spks = $this->spkService->getSpksByMitra($mitraId, $status);

        return $this->ok(
            SpkResource::collection($spks),
            'Daftar SPK mitra berhasil diambil.'
        );
    }

    /**
     * Generate SPK Word (.docx) document.
     */
    public function generateDocument(int|string $id): JsonResponse
    {
        $spk = $this->spkService->getSpkById($id);
        Gate::authorize('view', $spk);

        $this->documentService->generate($spk);
        $spk->refresh();

        return $this->ok(
            new SpkResource($spk),
            'Dokumen SPK berhasil dibuat dan diarsipkan.'
        );
    }

    /**
     * Download SPK Word (.docx) document.
     */
    public function downloadDocument(int|string $id): StreamedResponse
    {
        $spk = $this->spkService->getSpkById($id);
        Gate::authorize('view', $spk);

        return $this->documentService->download($spk);
    }
}
