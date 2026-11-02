<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BudgetAccount\StoreBudgetAccountRequest;
use App\Http\Requests\BudgetAccount\UpdateBudgetAccountRequest;
use App\Http\Resources\BudgetAccountResource;
use App\Models\BudgetAccount;
use App\Services\BudgetAccountService;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class BudgetAccountController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected BudgetAccountService $budgetAccountService
    ) {}

    /**
     * Get paginated budget accounts.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', BudgetAccount::class);

        $perPage = (int) $request->input('per_page', 25);
        $accounts = $this->budgetAccountService->getPaginatedAccounts($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar akun anggaran berhasil diambil.',
            'data' => BudgetAccountResource::collection($accounts->items()),
            'meta' => [
                'current_page' => $accounts->currentPage(),
                'last_page' => $accounts->lastPage(),
                'per_page' => $accounts->perPage(),
                'total' => $accounts->total(),
            ],
            'links' => [
                'first' => $accounts->url(1),
                'last' => $accounts->url($accounts->lastPage()),
                'prev' => $accounts->previousPageUrl(),
                'next' => $accounts->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Get active budget accounts for dropdowns.
     */
    public function active(): JsonResponse
    {
        Gate::authorize('viewAny', BudgetAccount::class);

        $accounts = $this->budgetAccountService->getActiveAccounts();

        return $this->ok(BudgetAccountResource::collection($accounts), 'Daftar akun anggaran aktif berhasil diambil.');
    }

    /**
     * Create budget account.
     */
    public function store(StoreBudgetAccountRequest $request): JsonResponse
    {
        Gate::authorize('create', BudgetAccount::class);

        $account = $this->budgetAccountService->createAccount($request->validated());

        return $this->created(new BudgetAccountResource($account), 'Akun anggaran berhasil ditambahkan.');
    }

    /**
     * Get budget account details.
     */
    public function show(int|string $id): JsonResponse
    {
        Gate::authorize('view', BudgetAccount::class);

        $account = $this->budgetAccountService->getAccountById($id);

        return $this->ok(new BudgetAccountResource($account), 'Detail akun anggaran berhasil diambil.');
    }

    /**
     * Update budget account.
     */
    public function update(UpdateBudgetAccountRequest $request, int|string $id): JsonResponse
    {
        Gate::authorize('update', BudgetAccount::class);

        $account = $this->budgetAccountService->updateAccount($id, $request->validated());

        return $this->ok(new BudgetAccountResource($account), 'Akun anggaran berhasil diperbarui.');
    }

    /**
     * Deactivate budget account.
     */
    public function deactivate(int|string $id): JsonResponse
    {
        Gate::authorize('delete', BudgetAccount::class);

        $account = $this->budgetAccountService->deactivateAccount($id);

        return $this->ok(new BudgetAccountResource($account), 'Status akun anggaran berhasil dinonaktifkan.');
    }
}
