<?php

namespace App\Repositories\Eloquent;

use App\Models\BudgetAccount;
use App\Repositories\Contracts\BudgetAccountRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class BudgetAccountRepository extends BaseRepository implements BudgetAccountRepositoryInterface
{
    public function __construct(BudgetAccount $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function findByCode(string $code): ?BudgetAccount
    {
        /** @var BudgetAccount|null */
        return $this->model->where('code', $code)->first();
    }

    /**
     * @inheritDoc
     */
    public function getActiveAccounts(): Collection
    {
        /** @var Collection<int, BudgetAccount> */
        return $this->model->where('is_active', true)->orderBy('code', 'asc')->get();
    }
}
