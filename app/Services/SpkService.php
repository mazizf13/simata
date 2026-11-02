<?php

namespace App\Services;

use App\Enums\SpkStatus;
use App\Models\Mitra;
use App\Models\Spk;
use App\Models\TaskAssignment;
use App\Models\User;
use App\Repositories\Contracts\SpkRepositoryInterface;
use App\Repositories\Contracts\TaskAssignmentRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SpkService
{
    public function __construct(
        protected SpkRepositoryInterface $spkRepository,
        protected TaskAssignmentRepositoryInterface $assignmentRepository,
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Get paginated SPK list with filters.
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getPaginatedSpks(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->spkRepository->paginateSpks($filters, $perPage);
    }

    /**
     * Get SPK detail by ID.
     *
     * @param int|string $id
     * @return Spk
     */
    public function getSpkById(int|string $id): Spk
    {
        /** @var Spk $spk */
        $spk = Spk::with([
            'mitra.district',
            'creator:id,name,email',
            'taskAssignments' => function ($query) {
                $query->with(['task:id,name,code', 'budgetAccount:id,code,name', 'creator:id,name'])
                    ->orderBy('start_date', 'asc');
            },
        ])->findOrFail($id);

        return $spk;
    }

    /**
     * Get all SPKs belonging to a mitra.
     *
     * @param int|string $mitraId
     * @param string|null $status
     * @return Collection
     */
    public function getSpksByMitra(int|string $mitraId, ?string $status = null): Collection
    {
        return $this->spkRepository->getSpksByMitra($mitraId, $status);
    }

    /**
     * Create a new SPK.
     *
     * @param array<string, mixed> $data
     * @param User $user
     * @return Spk
     * @throws ValidationException
     */
    public function createSpk(array $data, User $user): Spk
    {
        return DB::transaction(function () use ($data, $user) {
            $mitraId = $data['mitra_id'];
            $periodStart = $data['period_start'];
            $periodEnd = $data['period_end'];

            // 1. Verify period logic
            if (Carbon::parse($periodEnd)->lt(Carbon::parse($periodStart))) {
                throw ValidationException::withMessages([
                    'period_end' => ['Tanggal akhir periode tidak boleh lebih awal dari tanggal awal periode.'],
                ]);
            }

            // 2. Overlap validation
            if ($this->spkRepository->hasOverlappingSpk($mitraId, $periodStart, $periodEnd)) {
                throw ValidationException::withMessages([
                    'period_start' => ['Mitra sudah memiliki SPK aktif/terdaftar pada rentang periode yang bertabrakan.'],
                ]);
            }

            // 3. Verify Mitra exists and is active
            /** @var Mitra $mitra */
            $mitra = Mitra::findOrFail($mitraId);
            if ($mitra->status !== 'active') {
                throw ValidationException::withMessages([
                    'mitra_id' => ['Mitra terpilih berstatus tidak aktif.'],
                ]);
            }

            // 4. Create SPK
            /** @var Spk $spk */
            $spk = Spk::create([
                'mitra_id' => $mitraId,
                'spk_number' => trim($data['spk_number']),
                'contract_date' => $data['contract_date'],
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'occupation' => $data['occupation'] ?? 'Mitra Statistik',
                'position' => $data['position'] ?? null,
                'work_address' => $data['work_address'] ?? null,
                'status' => SpkStatus::DRAFT,
                'notes' => $data['notes'] ?? null,
                'created_by' => $user->id,
            ]);

            // 5. Attach initial assignments if provided
            if (!empty($data['assignment_ids']) && is_array($data['assignment_ids'])) {
                $this->attachAssignments($spk->id, $data['assignment_ids'], $user);
            }

            // 6. Audit log
            $this->auditLogService->log(
                action: 'create_spk',
                entityType: 'spk',
                entityId: $spk->id,
                oldValues: null,
                newValues: $spk->toArray(),
                userId: $user->id
            );

            return $this->getSpkById($spk->id);
        });
    }

    /**
     * Update SPK (only when DRAFT or ACTIVE).
     *
     * @param int|string $id
     * @param array<string, mixed> $data
     * @param User $user
     * @return Spk
     * @throws ValidationException
     */
    public function updateSpk(int|string $id, array $data, User $user): Spk
    {
        return DB::transaction(function () use ($id, $data, $user) {
            /** @var Spk $spk */
            $spk = Spk::lockForUpdate()->findOrFail($id);

            if ($spk->status === SpkStatus::COMPLETED || $spk->status === SpkStatus::CANCELLED) {
                throw ValidationException::withMessages([
                    'status' => ['SPK yang sudah selesai atau dibatalkan tidak dapat diubah.'],
                ]);
            }

            $periodStart = $data['period_start'] ?? $spk->period_start->toDateString();
            $periodEnd = $data['period_end'] ?? $spk->period_end->toDateString();

            if (Carbon::parse($periodEnd)->lt(Carbon::parse($periodStart))) {
                throw ValidationException::withMessages([
                    'period_end' => ['Tanggal akhir periode tidak boleh lebih awal dari tanggal awal periode.'],
                ]);
            }

            $mitraId = $data['mitra_id'] ?? $spk->mitra_id;

            // Check overlap if dates or mitra changed
            if ($this->spkRepository->hasOverlappingSpk($mitraId, $periodStart, $periodEnd, $spk->id)) {
                throw ValidationException::withMessages([
                    'period_start' => ['Mitra sudah memiliki SPK aktif/terdaftar pada rentang periode yang bertabrakan.'],
                ]);
            }

            // If changing mitra, verify none of existing attached assignments conflict
            if ((int) $mitraId !== (int) $spk->mitra_id) {
                $hasAttachedAssignments = $spk->taskAssignments()->exists();
                if ($hasAttachedAssignments) {
                    throw ValidationException::withMessages([
                        'mitra_id' => ['Tidak dapat mengubah mitra karena SPK ini sudah memiliki penugasan terlampir.'],
                    ]);
                }
            }

            $oldValues = $spk->toArray();

            $spk->update([
                'mitra_id' => $mitraId,
                'spk_number' => isset($data['spk_number']) ? trim($data['spk_number']) : $spk->spk_number,
                'contract_date' => $data['contract_date'] ?? $spk->contract_date,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'occupation' => $data['occupation'] ?? $spk->occupation,
                'position' => $data['position'] ?? $spk->position,
                'work_address' => $data['work_address'] ?? $spk->work_address,
                'notes' => array_key_exists('notes', $data) ? $data['notes'] : $spk->notes,
            ]);

            $this->auditLogService->log(
                action: 'update_spk',
                entityType: 'spk',
                entityId: $spk->id,
                oldValues: $oldValues,
                newValues: $spk->toArray(),
                userId: $user->id
            );

            return $this->getSpkById($spk->id);
        });
    }

    /**
     * Attach task assignments to an SPK.
     *
     * @param int|string $spkId
     * @param array<int|string> $assignmentIds
     * @param User $user
     * @return Spk
     * @throws ValidationException
     */
    public function attachAssignments(int|string $spkId, array $assignmentIds, User $user): Spk
    {
        return DB::transaction(function () use ($spkId, $assignmentIds, $user) {
            /** @var Spk $spk */
            $spk = Spk::lockForUpdate()->findOrFail($spkId);

            if ($spk->status === SpkStatus::CANCELLED || $spk->status === SpkStatus::COMPLETED) {
                throw ValidationException::withMessages([
                    'status' => ['Tidak dapat menambahkan penugasan pada SPK yang sudah selesai atau dibatalkan.'],
                ]);
            }

            $assignments = TaskAssignment::whereIn('id', $assignmentIds)->get();

            if ($assignments->count() !== count(array_unique($assignmentIds))) {
                throw ValidationException::withMessages([
                    'assignment_ids' => ['Beberapa ID penugasan tidak ditemukan.'],
                ]);
            }

            foreach ($assignments as $assignment) {
                // Rule: assignment mitra MUST match SPK mitra
                if ((int) $assignment->mitra_id !== (int) $spk->mitra_id) {
                    throw ValidationException::withMessages([
                        'assignment_ids' => ["Penugasan ID #{$assignment->id} bukan milik mitra pemilik SPK."],
                    ]);
                }

                // Rule: cancelled assignments cannot be attached
                if ($assignment->status->value === 'cancelled') {
                    throw ValidationException::withMessages([
                        'assignment_ids' => ["Penugasan ID #{$assignment->id} telah dibatalkan dan tidak dapat dimasukkan ke SPK."],
                    ]);
                }

                $oldSpkId = $assignment->spk_id;
                $assignment->spk_id = $spk->id;
                $assignment->save();

                $this->auditLogService->log(
                    action: 'attach_assignment_to_spk',
                    entityType: 'task_assignment',
                    entityId: $assignment->id,
                    oldValues: ['spk_id' => $oldSpkId],
                    newValues: ['spk_id' => $spk->id],
                    userId: $user->id
                );
            }

            $this->auditLogService->log(
                action: 'spk_attached_assignments',
                entityType: 'spk',
                entityId: $spk->id,
                oldValues: null,
                newValues: ['attached_assignment_ids' => $assignmentIds],
                userId: $user->id
            );

            return $this->getSpkById($spk->id);
        });
    }

    /**
     * Detach a task assignment from an SPK.
     *
     * @param int|string $spkId
     * @param int|string $assignmentId
     * @param User $user
     * @return Spk
     * @throws ValidationException
     */
    public function detachAssignment(int|string $spkId, int|string $assignmentId, User $user): Spk
    {
        return DB::transaction(function () use ($spkId, $assignmentId, $user) {
            /** @var Spk $spk */
            $spk = Spk::lockForUpdate()->findOrFail($spkId);

            if ($spk->status === SpkStatus::CANCELLED || $spk->status === SpkStatus::COMPLETED) {
                throw ValidationException::withMessages([
                    'status' => ['Tidak dapat melepas penugasan dari SPK yang sudah selesai atau dibatalkan.'],
                ]);
            }

            /** @var TaskAssignment $assignment */
            $assignment = TaskAssignment::where('id', $assignmentId)
                ->where('spk_id', $spk->id)
                ->first();

            if (!$assignment) {
                throw ValidationException::withMessages([
                    'assignment_id' => ['Penugasan tidak ditemukan pada SPK ini.'],
                ]);
            }

            $assignment->spk_id = null;
            $assignment->save();

            $this->auditLogService->log(
                action: 'detach_assignment_from_spk',
                entityType: 'task_assignment',
                entityId: $assignment->id,
                oldValues: ['spk_id' => $spk->id],
                newValues: ['spk_id' => null],
                userId: $user->id
            );

            $this->auditLogService->log(
                action: 'spk_detached_assignment',
                entityType: 'spk',
                entityId: $spk->id,
                oldValues: ['detached_assignment_id' => $assignmentId],
                newValues: null,
                userId: $user->id
            );

            return $this->getSpkById($spk->id);
        });
    }

    /**
     * Transition SPK to Active status.
     *
     * @param int|string $id
     * @param User $user
     * @return Spk
     * @throws ValidationException
     */
    public function activateSpk(int|string $id, User $user): Spk
    {
        return DB::transaction(function () use ($id, $user) {
            /** @var Spk $spk */
            $spk = Spk::lockForUpdate()->findOrFail($id);

            if (!$spk->status->canTransitionTo(SpkStatus::ACTIVE)) {
                throw ValidationException::withMessages([
                    'status' => ["SPK berstatus '{$spk->status->label()}' tidak dapat diaktifkan."],
                ]);
            }

            $oldStatus = $spk->status->value;
            $spk->status = SpkStatus::ACTIVE;
            $spk->save();

            $this->auditLogService->log(
                action: 'activate_spk',
                entityType: 'spk',
                entityId: $spk->id,
                oldValues: ['status' => $oldStatus],
                newValues: ['status' => SpkStatus::ACTIVE->value],
                userId: $user->id
            );

            return $this->getSpkById($spk->id);
        });
    }

    /**
     * Transition SPK to Completed status.
     *
     * @param int|string $id
     * @param User $user
     * @return Spk
     * @throws ValidationException
     */
    public function completeSpk(int|string $id, User $user): Spk
    {
        return DB::transaction(function () use ($id, $user) {
            /** @var Spk $spk */
            $spk = Spk::lockForUpdate()->findOrFail($id);

            if (!$spk->status->canTransitionTo(SpkStatus::COMPLETED)) {
                throw ValidationException::withMessages([
                    'status' => ["SPK berstatus '{$spk->status->label()}' tidak dapat diselesaikan."],
                ]);
            }

            $oldStatus = $spk->status->value;
            $spk->status = SpkStatus::COMPLETED;
            $spk->save();

            $this->auditLogService->log(
                action: 'complete_spk',
                entityType: 'spk',
                entityId: $spk->id,
                oldValues: ['status' => $oldStatus],
                newValues: ['status' => SpkStatus::COMPLETED->value],
                userId: $user->id
            );

            return $this->getSpkById($spk->id);
        });
    }

    /**
     * Cancel SPK with reason.
     *
     * @param int|string $id
     * @param string $reason
     * @param User $user
     * @return Spk
     * @throws ValidationException
     */
    public function cancelSpk(int|string $id, string $reason, User $user): Spk
    {
        return DB::transaction(function () use ($id, $reason, $user) {
            /** @var Spk $spk */
            $spk = Spk::lockForUpdate()->findOrFail($id);

            if (!$spk->status->canTransitionTo(SpkStatus::CANCELLED)) {
                throw ValidationException::withMessages([
                    'status' => ["SPK berstatus '{$spk->status->label()}' tidak dapat dibatalkan."],
                ]);
            }

            $oldStatus = $spk->status->value;
            $oldNotes = $spk->notes;

            $cancellationNote = "Dibatalkan oleh {$user->name} pada " . now()->format('Y-m-d H:i:s') . ". Alasan: {$reason}";
            $newNotes = $spk->notes ? "{$spk->notes}\n[BATAL]: {$cancellationNote}" : "[BATAL]: {$cancellationNote}";

            $spk->status = SpkStatus::CANCELLED;
            $spk->notes = $newNotes;
            $spk->save();

            $this->auditLogService->log(
                action: 'cancel_spk',
                entityType: 'spk',
                entityId: $spk->id,
                oldValues: ['status' => $oldStatus, 'notes' => $oldNotes],
                newValues: ['status' => SpkStatus::CANCELLED->value, 'reason' => $reason, 'notes' => $newNotes],
                userId: $user->id
            );

            return $this->getSpkById($spk->id);
        });
    }
}
