<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Mitra\StoreMitraRequest;
use App\Http\Requests\Mitra\UpdateMitraRequest;
use App\Http\Resources\MitraResource;
use App\Models\Mitra;
use App\Services\MitraService;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class MitraController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected MitraService $mitraService
    ) {}

    /**
     * Get paginated mitras with filters.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Mitra::class);

        $filters = $request->only(['search', 'district_id', 'status', 'sort', 'direction']);
        $perPage = (int) $request->input('per_page', 15);

        $mitras = $this->mitraService->getPaginatedMitras($filters, $perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar mitra statistik berhasil diambil.',
            'data' => MitraResource::collection($mitras->items()),
            'meta' => [
                'current_page' => $mitras->currentPage(),
                'last_page' => $mitras->lastPage(),
                'per_page' => $mitras->perPage(),
                'total' => $mitras->total(),
            ],
            'links' => [
                'first' => $mitras->url(1),
                'last' => $mitras->url($mitras->lastPage()),
                'prev' => $mitras->previousPageUrl(),
                'next' => $mitras->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Create new mitra.
     */
    public function store(StoreMitraRequest $request): JsonResponse
    {
        Gate::authorize('create', Mitra::class);

        $mitra = $this->mitraService->createMitra($request->validated());
        $mitra->load('district');

        return $this->created(new MitraResource($mitra), 'Mitra baru berhasil ditambahkan.');
    }

    /**
     * Get mitra details.
     */
    public function show(int|string $id): JsonResponse
    {
        Gate::authorize('view', Mitra::class);

        $mitra = $this->mitraService->getMitraById($id);

        return $this->ok(new MitraResource($mitra), 'Detail mitra berhasil diambil.');
    }

    /**
     * Update mitra.
     */
    public function update(UpdateMitraRequest $request, int|string $id): JsonResponse
    {
        Gate::authorize('update', Mitra::class);

        $mitra = $this->mitraService->updateMitra($id, $request->validated());
        $mitra->load('district');

        return $this->ok(new MitraResource($mitra), 'Data mitra berhasil diperbarui.');
    }

    /**
     * Deactivate mitra.
     */
    public function deactivate(int|string $id): JsonResponse
    {
        Gate::authorize('delete', Mitra::class);

        $mitra = $this->mitraService->deactivateMitra($id);
        $mitra->load('district');

        return $this->ok(new MitraResource($mitra), 'Status mitra berhasil dinonaktifkan.');
    }
}
