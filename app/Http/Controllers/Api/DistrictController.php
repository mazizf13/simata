<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DistrictResource;
use App\Models\District;
use App\Services\DistrictService;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class DistrictController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected DistrictService $districtService
    ) {}

    /**
     * Get paginated or list of districts.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', District::class);

        $perPage = (int) $request->input('per_page', 25);
        $districts = $this->districtService->getPaginatedDistricts($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar kecamatan berhasil diambil.',
            'data' => DistrictResource::collection($districts->items()),
            'meta' => [
                'current_page' => $districts->currentPage(),
                'last_page' => $districts->lastPage(),
                'per_page' => $districts->perPage(),
                'total' => $districts->total(),
            ],
            'links' => [
                'first' => $districts->url(1),
                'last' => $districts->url($districts->lastPage()),
                'prev' => $districts->previousPageUrl(),
                'next' => $districts->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Get active districts for dropdowns (18 official districts of Mojokerto).
     */
    public function active(): JsonResponse
    {
        Gate::authorize('viewAny', District::class);

        $districts = $this->districtService->getActiveDistricts();

        return $this->ok(DistrictResource::collection($districts), 'Daftar kecamatan aktif berhasil diambil.');
    }

    /**
     * Get district details.
     */
    public function show(int|string $id): JsonResponse
    {
        Gate::authorize('view', District::class);

        $district = $this->districtService->getDistrictById($id);

        return $this->ok(new DistrictResource($district), 'Detail kecamatan berhasil diambil.');
    }
}
