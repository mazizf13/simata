<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Bast\StoreBastRequest;
use App\Http\Requests\Bast\UpdateBastRequest;
use App\Http\Resources\BastResource;
use App\Models\Bast;
use App\Services\BastDocumentService;
use App\Services\BastService;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BastController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected BastService $bastService,
        protected BastDocumentService $documentService
    ) {}

    /**
     * Get auto-generated next BAST number for a given date.
     */
    public function nextNumber(Request $request): JsonResponse
    {
        Gate::authorize('create', Bast::class);

        $date = $request->query('date', now()->toDateString());
        $bastNumber = $this->bastService->generateNextBastNumber($date);

        return $this->ok(
            ['bast_number' => $bastNumber],
            'Nomor BAST berikutnya berhasil dibuat otomatis.'
        );
    }

    /**
     * Display a listing of BASTs.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Bast::class);

        $filters = $request->only(['search', 'status', 'year', 'month', 'mitra_id']);
        $perPage = (int) $request->input('per_page', 15);

        $basts = $this->bastService->getPaginatedBasts($filters, $perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar BAST berhasil diambil.',
            'data' => BastResource::collection($basts->items()),
            'meta' => [
                'current_page' => $basts->currentPage(),
                'last_page' => $basts->lastPage(),
                'per_page' => $basts->perPage(),
                'total' => $basts->total(),
            ],
        ]);
    }

    /**
     * Store a newly created BAST.
     */
    public function store(StoreBastRequest $request): JsonResponse
    {
        Gate::authorize('create', Bast::class);

        $bast = $this->bastService->createBast($request->validated(), $request->user());

        return $this->created(
            new BastResource($bast),
            'Berita Acara Serah Terima (BAST) berhasil dibuat.'
        );
    }

    /**
     * Display the specified BAST.
     */
    public function show(int|string $id): JsonResponse
    {
        $bast = $this->bastService->getBastById($id);
        Gate::authorize('view', $bast);

        return $this->ok(
            new BastResource($bast),
            'Detail BAST berhasil diambil.'
        );
    }

    /**
     * Get BAST linked to a specific SPK.
     */
    public function bySpk(int|string $spkId): JsonResponse
    {
        Gate::authorize('viewAny', Bast::class);

        $bast = $this->bastService->getBastBySpkId($spkId);

        return $this->ok(
            $bast ? new BastResource($bast) : null,
            $bast ? 'BAST SPK berhasil diambil.' : 'Belum ada BAST untuk SPK ini.'
        );
    }

    /**
     * Update the specified BAST.
     */
    public function update(UpdateBastRequest $request, int|string $id): JsonResponse
    {
        $bast = $this->bastService->getBastById($id);
        Gate::authorize('update', $bast);

        $updated = $this->bastService->updateBast($id, $request->validated(), $request->user());

        return $this->ok(
            new BastResource($updated),
            'Data BAST berhasil diperbarui.'
        );
    }

    /**
     * Approve BAST (Resmi menerima hasil pekerjaan).
     */
    public function approve(int|string $id, Request $request): JsonResponse
    {
        $bast = $this->bastService->getBastById($id);
        Gate::authorize('approve', $bast);

        $approved = $this->bastService->approveBast($id, $request->user());

        return $this->ok(
            new BastResource($approved),
            'BAST berhasil disetujui dan disahkan.'
        );
    }

    /**
     * Generate BAST Word (.docx) document.
     */
    public function generateDocument(int|string $id): JsonResponse
    {
        $bast = $this->bastService->getBastById($id);
        Gate::authorize('view', $bast);

        $this->documentService->generate($bast);
        $bast->refresh();

        return $this->ok(
            new BastResource($bast),
            'Dokumen BAST berhasil dibuat dan diarsipkan.'
        );
    }

    /**
     * Download BAST Word (.docx) document.
     */
    public function downloadDocument(int|string $id): StreamedResponse
    {
        $bast = $this->bastService->getBastById($id);
        Gate::authorize('view', $bast);

        return $this->documentService->download($bast);
    }
}
