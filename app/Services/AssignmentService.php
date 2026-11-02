<?php

namespace App\Services;

use App\Enums\AssignmentStatus;
use App\Models\BudgetAccount;
use App\Models\Mitra;
use App\Models\Spk;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\User;
use App\Repositories\Contracts\TaskAssignmentRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AssignmentService
{
    public function __construct(
        protected TaskAssignmentRepositoryInterface $assignmentRepository,
        protected AssignmentLimitService $limitService,
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Create a single assignment with transaction, row-locking, snapshots, and limit validation.
     *
     * @param array<string, mixed> $data
     * @param User $user
     * @return TaskAssignment
     * @throws ValidationException
     */
    public function createAssignment(array $data, User $user): TaskAssignment
    {
        return DB::transaction(function () use ($data, $user) {
            $mitraId = $data['mitra_id'];
            $taskId = $data['task_id'];
            $startDate = $data['start_date'];
            $endDate = $data['end_date'];
            $volume = (float) $data['volume'];

            // 1. Validate dates
            if (Carbon::parse($endDate)->lt(Carbon::parse($startDate))) {
                throw ValidationException::withMessages([
                    'end_date' => ['Tanggal selesai tidak boleh lebih awal dari tanggal mulai penugasan.'],
                ]);
            }

            // 2. Fetch Task and Mitra
            /** @var Task $task */
            $task = Task::with('team', 'defaultBudgetAccount')->findOrFail($taskId);
            if (!$task->is_active) {
                throw ValidationException::withMessages([
                    'task_id' => ["Kegiatan survei '{$task->name}' berstatus nonaktif dan tidak dapat dipilih untuk penugasan baru."],
                ]);
            }

            // 3. Resolve unit price and calculate total value on backend
            $unitPrice = isset($data['unit_price']) ? (float) $data['unit_price'] : (float) $task->default_rate;
            if ($unitPrice < 0) {
                throw ValidationException::withMessages([
                    'unit_price' => ['Harga satuan tidak boleh bernilai negatif.'],
                ]);
            }
            if ($volume <= 0) {
                throw ValidationException::withMessages([
                    'volume' => ['Volume beban penugasan harus lebih besar dari nol.'],
                ]);
            }

            $totalValue = TaskAssignment::computeTotalValue($volume, $unitPrice);

            // 4. Resolve Budget Account
            $budgetAccountId = $data['budget_account_id'] ?? $task->default_budget_account_id;
            $budgetAccount = $budgetAccountId ? BudgetAccount::find($budgetAccountId) : null;

            // 5. Validate SPK if provided
            $spkId = $data['spk_id'] ?? null;
            if ($spkId) {
                $spk = Spk::find($spkId);
                if (!$spk || (int) $spk->mitra_id !== (int) $mitraId) {
                    throw ValidationException::withMessages([
                        'spk_id' => ['SPK yang dipilih tidak valid atau bukan milik mitra yang bersangkutan.'],
                    ]);
                }
            }

            // 6. Determine Status
            $requestedStatus = isset($data['status'])
                ? AssignmentStatus::from($data['status'])
                : AssignmentStatus::DRAFT;

            // 7. Lock Mitra row and validate limits if status is counted
            if ($requestedStatus->isCounted()) {
                $this->limitService->lockMitra($mitraId);
                $this->limitService->validateLimitsOrFail(
                    $mitraId,
                    $startDate,
                    $totalValue,
                    1
                );
            } else {
                // Still verify mitra exists
                Mitra::findOrFail($mitraId);
            }

            // 8. Create assignment with immutable snapshots
            /** @var TaskAssignment $assignment */
            $assignment = TaskAssignment::create([
                'mitra_id' => $mitraId,
                'task_id' => $taskId,
                'spk_id' => $spkId,
                'budget_account_id' => $budgetAccountId,
                'task_name_snapshot' => $task->name,
                'team_name_snapshot' => $task->team->name,
                'budget_account_code_snapshot' => $budgetAccount?->code,
                'budget_account_name_snapshot' => $budgetAccount?->name,
                'unit_snapshot' => $data['unit'] ?? $task->default_unit,
                'unit_price_snapshot' => $unitPrice,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'volume' => $volume,
                'unit_price' => $unitPrice,
                'total_value' => $totalValue,
                'status' => $requestedStatus,
                'notes' => $data['notes'] ?? null,
                'created_by' => $user->id,
                'approved_by' => $requestedStatus === AssignmentStatus::APPROVED ? $user->id : null,
                'approved_at' => $requestedStatus === AssignmentStatus::APPROVED ? now() : null,
            ]);

            // 9. Audit log
            $this->auditLogService->log(
                'create_assignment',
                TaskAssignment::class,
                $assignment->id,
                null,
                $assignment->toArray(),
                $user->id
            );

            return $assignment;
        });
    }

    /**
     * Bulk create assignments for a single task across multiple mitras.
     * Mitra rows are locked in strict ascending ID order to prevent database deadlocks.
     *
     * @param array<string, mixed> $data
     * @param User $user
     * @return array{
     *     success: bool,
     *     created_count: int,
     *     failed_count: int,
     *     results: array<int, array>
     * }
     * @throws ValidationException
     */
    public function bulkCreateAssignments(array $data, User $user): array
    {
        $taskId = $data['task_id'];
        $startDate = $data['start_date'];
        $endDate = $data['end_date'];
        $items = $data['mitra_assignments']; // array of ['mitra_id' => ..., 'volume' => ..., 'unit_price' => ...]

        if (empty($items)) {
            throw ValidationException::withMessages([
                'mitra_assignments' => ['Daftar mitra penugasan tidak boleh kosong.'],
            ]);
        }

        if (Carbon::parse($endDate)->lt(Carbon::parse($startDate))) {
            throw ValidationException::withMessages([
                'end_date' => ['Tanggal selesai tidak boleh lebih awal dari tanggal mulai penugasan.'],
            ]);
        }

        /** @var Task $task */
        $task = Task::with('team', 'defaultBudgetAccount')->findOrFail($taskId);
        if (!$task->is_active) {
            throw ValidationException::withMessages([
                'task_id' => ["Kegiatan survei '{$task->name}' berstatus nonaktif."],
            ]);
        }

        $budgetAccountId = $data['budget_account_id'] ?? $task->default_budget_account_id;
        $budgetAccount = $budgetAccountId ? BudgetAccount::find($budgetAccountId) : null;
        $targetStatus = isset($data['status'])
            ? AssignmentStatus::from($data['status'])
            : AssignmentStatus::APPROVED;

        return DB::transaction(function () use ($items, $task, $budgetAccount, $startDate, $endDate, $targetStatus, $user) {
            // Extract and sort unique mitra IDs to lock in ascending order
            $mitraIds = collect($items)->pluck('mitra_id')->all();
            $lockedMitras = $this->limitService->lockMitras($mitraIds)->keyBy('id');

            $results = [];
            $createdCount = 0;
            $failedCount = 0;

            foreach ($items as $item) {
                $mitraId = $item['mitra_id'];
                $mitra = $lockedMitras->get($mitraId);

                if (!$mitra) {
                    $results[] = [
                        'mitra_id' => $mitraId,
                        'success' => false,
                        'reason' => 'Data mitra tidak ditemukan.',
                    ];
                    $failedCount++;
                    continue;
                }

                $volume = (float) ($item['volume'] ?? 1);
                $unitPrice = isset($item['unit_price']) ? (float) $item['unit_price'] : (float) $task->default_rate;
                $totalValue = TaskAssignment::computeTotalValue($volume, $unitPrice);

                // If target status is counted, check limits
                if ($targetStatus->isCounted()) {
                    $limitCheck = $this->limitService->checkLimits(
                        $mitraId,
                        $startDate,
                        $totalValue,
                        1
                    );

                    if (!$limitCheck['allowed']) {
                        $results[] = [
                            'mitra_id' => $mitraId,
                            'mitra_name' => $mitra->name,
                            'success' => false,
                            'reason' => $limitCheck['reason'],
                            'limit_details' => $limitCheck,
                        ];
                        $failedCount++;
                        continue;
                    }
                }

                // Create assignment record
                /** @var TaskAssignment $assignment */
                $assignment = TaskAssignment::create([
                    'mitra_id' => $mitraId,
                    'task_id' => $task->id,
                    'spk_id' => $item['spk_id'] ?? null,
                    'budget_account_id' => $budgetAccount?->id,
                    'task_name_snapshot' => $task->name,
                    'team_name_snapshot' => $task->team->name,
                    'budget_account_code_snapshot' => $budgetAccount?->code,
                    'budget_account_name_snapshot' => $budgetAccount?->name,
                    'unit_snapshot' => $task->default_unit,
                    'unit_price_snapshot' => $unitPrice,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'volume' => $volume,
                    'unit_price' => $unitPrice,
                    'total_value' => $totalValue,
                    'status' => $targetStatus,
                    'notes' => $item['notes'] ?? null,
                    'created_by' => $user->id,
                    'approved_by' => $targetStatus === AssignmentStatus::APPROVED ? $user->id : null,
                    'approved_at' => $targetStatus === AssignmentStatus::APPROVED ? now() : null,
                ]);

                $this->auditLogService->log(
                    'bulk_create_assignment',
                    TaskAssignment::class,
                    $assignment->id,
                    null,
                    $assignment->toArray(),
                    $user->id
                );

                $results[] = [
                    'mitra_id' => $mitraId,
                    'mitra_name' => $mitra->name,
                    'assignment_id' => $assignment->id,
                    'total_value' => $totalValue,
                    'success' => true,
                    'reason' => null,
                ];
                $createdCount++;
            }

            return [
                'success' => $createdCount > 0,
                'created_count' => $createdCount,
                'failed_count' => $failedCount,
                'results' => $results,
            ];
        });
    }

    /**
     * Simulate bulk assignment validation before saving.
     *
     * @param array<string, mixed> $data
     * @return array
     */
    public function simulateBulkValidation(array $data): array
    {
        $taskId = $data['task_id'];
        $startDate = $data['start_date'];
        $items = $data['mitra_assignments'] ?? [];

        /** @var Task $task */
        $task = Task::with('team')->findOrFail($taskId);
        $mitraIds = collect($items)->pluck('mitra_id')->all();
        $mitras = Mitra::whereIn('id', $mitraIds)->get()->keyBy('id');

        $simulationResults = [];
        $totalEstimatedValue = 0;
        $allPassed = true;

        foreach ($items as $item) {
            $mitraId = $item['mitra_id'];
            $mitra = $mitras->get($mitraId);
            $volume = (float) ($item['volume'] ?? 1);
            $unitPrice = isset($item['unit_price']) ? (float) $item['unit_price'] : (float) $task->default_rate;
            $totalValue = TaskAssignment::computeTotalValue($volume, $unitPrice);
            $totalEstimatedValue += $totalValue;

            $check = $this->limitService->checkLimits(
                $mitraId,
                $startDate,
                $totalValue,
                1
            );

            if (!$check['allowed']) {
                $allPassed = false;
            }

            $simulationResults[] = [
                'mitra_id' => $mitraId,
                'mitra_name' => $mitra?->name ?? 'Tidak Dikenal',
                'mitra_code' => $mitra?->mitra_code ?? '-',
                'volume' => $volume,
                'unit' => $task->default_unit,
                'unit_price' => $unitPrice,
                'total_value' => $totalValue,
                'allowed' => $check['allowed'],
                'reason' => $check['reason'],
                'current_tasks' => $check['current_tasks'],
                'current_honor' => $check['current_honor'],
                'projected_tasks' => $check['projected_tasks'],
                'projected_honor' => $check['projected_honor'],
            ];
        }

        return [
            'task_name' => $task->name,
            'team_name' => $task->team->name,
            'total_mitras' => count($items),
            'total_estimated_value' => $totalEstimatedValue,
            'all_passed' => $allPassed,
            'simulation' => $simulationResults,
        ];
    }

    /**
     * Update an assignment (draft or pending approval, or audited modification).
     *
     * @param int|string $id
     * @param array<string, mixed> $data
     * @param User $user
     * @return TaskAssignment
     * @throws ValidationException
     */
    public function updateAssignment(int|string $id, array $data, User $user): TaskAssignment
    {
        return DB::transaction(function () use ($id, $data, $user) {
            /** @var TaskAssignment $assignment */
            $assignment = TaskAssignment::findOrFail($id);

            // Block direct editing of terminal statuses
            if ($assignment->status === AssignmentStatus::CANCELLED || $assignment->status === AssignmentStatus::COMPLETED) {
                throw ValidationException::withMessages([
                    'status' => ["Penugasan berstatus {$assignment->status->label()} tidak dapat diubah."],
                ]);
            }

            $oldValues = $assignment->toArray();

            $mitraId = $data['mitra_id'] ?? $assignment->mitra_id;
            $startDate = $data['start_date'] ?? $assignment->start_date->toDateString();
            $endDate = $data['end_date'] ?? $assignment->end_date->toDateString();
            $volume = isset($data['volume']) ? (float) $data['volume'] : (float) $assignment->volume;
            $unitPrice = isset($data['unit_price']) ? (float) $data['unit_price'] : (float) $assignment->unit_price;

            if (Carbon::parse($endDate)->lt(Carbon::parse($startDate))) {
                throw ValidationException::withMessages([
                    'end_date' => ['Tanggal selesai tidak boleh lebih awal dari tanggal mulai penugasan.'],
                ]);
            }

            $totalValue = TaskAssignment::computeTotalValue($volume, $unitPrice);

            // If assignment is currently counted, validate projected limits for the target period
            if ($assignment->status->isCounted()) {
                $this->limitService->lockMitra($mitraId);
                $this->limitService->validateLimitsOrFail(
                    $mitraId,
                    $startDate,
                    $totalValue,
                    1,
                    $assignment->id // Exclude self from current counts
                );
            }

            $assignment->fill([
                'mitra_id' => $mitraId,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'volume' => $volume,
                'unit_price' => $unitPrice,
                'total_value' => $totalValue,
                'notes' => $data['notes'] ?? $assignment->notes,
            ]);

            if (array_key_exists('spk_id', $data)) {
                $spkId = $data['spk_id'];
                if ($spkId) {
                    $spk = Spk::find($spkId);
                    if (!$spk || (int) $spk->mitra_id !== (int) $mitraId) {
                        throw ValidationException::withMessages([
                            'spk_id' => ['SPK yang dipilih tidak valid atau bukan milik mitra yang bersangkutan.'],
                        ]);
                    }
                }
                $assignment->spk_id = $spkId;
            }

            if (isset($data['budget_account_id'])) {
                $account = BudgetAccount::find($data['budget_account_id']);
                $assignment->budget_account_id = $account?->id;
                $assignment->budget_account_code_snapshot = $account?->code;
                $assignment->budget_account_name_snapshot = $account?->name;
            }

            $assignment->save();

            $this->auditLogService->log(
                'update_assignment',
                TaskAssignment::class,
                $assignment->id,
                $oldValues,
                $assignment->toArray(),
                $user->id
            );

            return $assignment;
        });
    }

    /**
     * Submit draft assignment for approval.
     */
    public function submitForApproval(int|string $id, User $user): TaskAssignment
    {
        return DB::transaction(function () use ($id, $user) {
            /** @var TaskAssignment $assignment */
            $assignment = TaskAssignment::findOrFail($id);

            if ($assignment->status !== AssignmentStatus::DRAFT) {
                throw ValidationException::withMessages([
                    'status' => ['Hanya penugasan berstatus Draf yang dapat diajukan untuk persetujuan.'],
                ]);
            }

            $oldValues = $assignment->toArray();
            $assignment->status = AssignmentStatus::PENDING_APPROVAL;
            $assignment->save();

            $this->auditLogService->log(
                'submit_for_approval',
                TaskAssignment::class,
                $assignment->id,
                $oldValues,
                $assignment->toArray(),
                $user->id
            );

            return $assignment;
        });
    }

    /**
     * Approve assignment.
     * Transitions status to APPROVED and validates monthly limits with row lock.
     */
    public function approveAssignment(int|string $id, User $user): TaskAssignment
    {
        return DB::transaction(function () use ($id, $user) {
            /** @var TaskAssignment $assignment */
            $assignment = TaskAssignment::findOrFail($id);

            if (!in_array($assignment->status, [AssignmentStatus::DRAFT, AssignmentStatus::PENDING_APPROVAL], true)) {
                throw ValidationException::withMessages([
                    'status' => ["Penugasan berstatus '{$assignment->status->label()}' tidak dapat disetujui."],
                ]);
            }

            // Lock mitra row and validate monthly limits
            $this->limitService->lockMitra($assignment->mitra_id);
            $this->limitService->validateLimitsOrFail(
                $assignment->mitra_id,
                $assignment->start_date->toDateString(),
                (float) $assignment->total_value,
                1,
                $assignment->id
            );

            $oldValues = $assignment->toArray();

            $assignment->update([
                'status' => AssignmentStatus::APPROVED,
                'approved_by' => $user->id,
                'approved_at' => now(),
            ]);

            $this->auditLogService->log(
                'approve_assignment',
                TaskAssignment::class,
                $assignment->id,
                $oldValues,
                $assignment->toArray(),
                $user->id
            );

            return $assignment;
        });
    }

    /**
     * Activate an approved assignment.
     */
    public function activateAssignment(int|string $id, User $user): TaskAssignment
    {
        return DB::transaction(function () use ($id, $user) {
            /** @var TaskAssignment $assignment */
            $assignment = TaskAssignment::findOrFail($id);

            if ($assignment->status !== AssignmentStatus::APPROVED) {
                throw ValidationException::withMessages([
                    'status' => ["Hanya penugasan berstatus 'Disetujui' yang dapat diaktifkan."],
                ]);
            }

            $oldValues = $assignment->toArray();
            $assignment->status = AssignmentStatus::ACTIVE;
            $assignment->save();

            $this->auditLogService->log(
                'activate_assignment',
                TaskAssignment::class,
                $assignment->id,
                $oldValues,
                $assignment->toArray(),
                $user->id
            );

            return $assignment;
        });
    }

    /**
     * Complete an active assignment.
     */
    public function completeAssignment(int|string $id, User $user): TaskAssignment
    {
        return DB::transaction(function () use ($id, $user) {
            /** @var TaskAssignment $assignment */
            $assignment = TaskAssignment::findOrFail($id);

            if ($assignment->status !== AssignmentStatus::ACTIVE && $assignment->status !== AssignmentStatus::APPROVED) {
                throw ValidationException::withMessages([
                    'status' => ["Hanya penugasan berstatus 'Aktif' atau 'Disetujui' yang dapat diselesaikan."],
                ]);
            }

            $oldValues = $assignment->toArray();
            $assignment->status = AssignmentStatus::COMPLETED;
            $assignment->save();

            $this->auditLogService->log(
                'complete_assignment',
                TaskAssignment::class,
                $assignment->id,
                $oldValues,
                $assignment->toArray(),
                $user->id
            );

            return $assignment;
        });
    }

    /**
     * Cancel an assignment.
     * Records cancellation reason, canceller user, and removes from counted aggregates.
     */
    public function cancelAssignment(int|string $id, string $reason, User $user): TaskAssignment
    {
        return DB::transaction(function () use ($id, $reason, $user) {
            /** @var TaskAssignment $assignment */
            $assignment = TaskAssignment::findOrFail($id);

            if ($assignment->status === AssignmentStatus::CANCELLED || $assignment->status === AssignmentStatus::COMPLETED) {
                throw ValidationException::withMessages([
                    'status' => ["Penugasan berstatus '{$assignment->status->label()}' tidak dapat dibatalkan."],
                ]);
            }

            if (empty(trim($reason))) {
                throw ValidationException::withMessages([
                    'reason' => ['Alasan pembatalan penugasan wajib diisi.'],
                ]);
            }

            $oldValues = $assignment->toArray();

            $assignment->update([
                'status' => AssignmentStatus::CANCELLED,
                'cancelled_by' => $user->id,
                'cancelled_at' => now(),
                'cancellation_reason' => trim($reason),
            ]);

            $this->auditLogService->log(
                'cancel_assignment',
                TaskAssignment::class,
                $assignment->id,
                $oldValues,
                $assignment->toArray(),
                $user->id
            );

            return $assignment;
        });
    }
}
