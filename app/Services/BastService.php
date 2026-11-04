<?php

namespace App\Services;

use App\Enums\BastStatus;
use App\Helpers\TerbilangHelper;
use App\Models\Bast;
use App\Models\Spk;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BastService
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Get paginated BAST list with filters.
     */
    public function getPaginatedBasts(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return Bast::with([
            'spk.mitra.district',
            'spk.taskAssignments',
            'creator:id,name',
            'approver:id,name',
        ])
        ->filter($filters)
        ->latest('bast_date')
        ->paginate($perPage);
    }

    /**
     * Get BAST detail by ID.
     */
    public function getBastById(int|string $id): Bast
    {
        return Bast::with([
            'spk.mitra.district',
            'spk.taskAssignments.task',
            'spk.taskAssignments.budgetAccount',
            'creator:id,name,email',
            'approver:id,name,email',
        ])->findOrFail($id);
    }

    /**
     * Get BAST linked to a specific SPK.
     */
    public function getBastBySpkId(int|string $spkId): ?Bast
    {
        return Bast::with([
            'spk.mitra.district',
            'spk.taskAssignments.task',
            'creator:id,name',
            'approver:id,name',
        ])->where('spk_id', $spkId)->first();
    }

    /**
     * Auto-generate sequential BAST number: 001/3516/BAST.{N}/{ROMAN_MONTH}/{YEAR}
     */
    public function generateNextBastNumber(string|Carbon|null $date = null): string
    {
        $carbonDate = $date ? Carbon::parse($date) : now();
        $year = $carbonDate->year;
        $month = $carbonDate->month;
        $romanMonth = TerbilangHelper::romanMonth($month);

        $existingNumbers = Bast::query()
            ->whereYear('bast_date', $year)
            ->whereMonth('bast_date', $month)
            ->pluck('bast_number');

        $maxSeq = 0;
        foreach ($existingNumbers as $num) {
            if (preg_match('/BAST\.(\d+)/i', $num, $matches)) {
                $maxSeq = max($maxSeq, (int) $matches[1]);
            }
        }

        if ($maxSeq === 0) {
            $otherNumbers = Bast::query()
                ->where('bast_number', 'like', "%/{$romanMonth}/{$year}%")
                ->orWhere('bast_number', 'like', "%/{$year}%")
                ->pluck('bast_number');

            foreach ($otherNumbers as $num) {
                if (preg_match('/BAST\.(\d+)\/' . preg_quote($romanMonth, '/') . '\/' . $year . '/i', $num, $matches)) {
                    $maxSeq = max($maxSeq, (int) $matches[1]);
                }
            }
        }

        $nextSeq = $maxSeq + 1;

        return "001/3516/BAST.{$nextSeq}/{$romanMonth}/{$year}";
    }

    /**
     * Create a new BAST for an SPK.
     *
     * @param array<string, mixed> $data
     * @param User $user
     * @return Bast
     * @throws ValidationException
     */
    public function createBast(array $data, User $user): Bast
    {
        return DB::transaction(function () use ($data, $user) {
            $spkId = $data['spk_id'];

            /** @var Spk $spk */
            $spk = Spk::with('taskAssignments')->findOrFail($spkId);

            // Periksa apakah SPK sudah memiliki BAST aktif
            $existing = Bast::where('spk_id', $spkId)->first();
            if ($existing) {
                throw ValidationException::withMessages([
                    'spk_id' => ['SPK ini sudah memiliki Berita Acara Serah Terima (BAST).'],
                ]);
            }

            $bastDate = $data['bast_date'] ?? ($spk->period_end ? $spk->period_end->toDateString() : now()->toDateString());
            $bastNumber = !empty($data['bast_number'])
                ? trim($data['bast_number'])
                : $this->generateNextBastNumber($bastDate);

            /** @var Bast $bast */
            $bast = Bast::create([
                'spk_id' => $spkId,
                'bast_number' => $bastNumber,
                'bast_date' => $bastDate,
                'status' => BastStatus::DRAFT,
                'notes' => $data['notes'] ?? null,
                'created_by' => $user->id,
            ]);

            $this->auditLogService->log(
                action: 'create_bast',
                entityType: 'bast',
                entityId: $bast->id,
                oldValues: null,
                newValues: $bast->toArray(),
                userId: $user->id
            );

            return $this->getBastById($bast->id);
        });
    }

    /**
     * Update BAST.
     */
    public function updateBast(int|string $id, array $data, User $user): Bast
    {
        return DB::transaction(function () use ($id, $data, $user) {
            /** @var Bast $bast */
            $bast = Bast::findOrFail($id);
            $oldValues = $bast->toArray();

            $bast->update([
                'bast_number' => isset($data['bast_number']) ? trim($data['bast_number']) : $bast->bast_number,
                'bast_date' => $data['bast_date'] ?? $bast->bast_date,
                'notes' => array_key_exists('notes', $data) ? $data['notes'] : $bast->notes,
            ]);

            $this->auditLogService->log(
                action: 'update_bast',
                entityType: 'bast',
                entityId: $bast->id,
                oldValues: $oldValues,
                newValues: $bast->toArray(),
                userId: $user->id
            );

            return $this->getBastById($bast->id);
        });
    }

    /**
     * Approve BAST (Penerimaan resmi hasil pekerjaan).
     */
    public function approveBast(int|string $id, User $user): Bast
    {
        return DB::transaction(function () use ($id, $user) {
            /** @var Bast $bast */
            $bast = Bast::findOrFail($id);

            $oldStatus = $bast->status->value;
            $bast->status = BastStatus::APPROVED;
            $bast->approved_by = $user->id;
            $bast->save();

            $this->auditLogService->log(
                action: 'approve_bast',
                entityType: 'bast',
                entityId: $bast->id,
                oldValues: ['status' => $oldStatus],
                newValues: ['status' => BastStatus::APPROVED->value, 'approved_by' => $user->id],
                userId: $user->id
            );

            return $this->getBastById($bast->id);
        });
    }
}
