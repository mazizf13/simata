<?php

namespace App\Repositories\Contracts;

use App\Models\BudgetAccount;
use Illuminate\Database\Eloquent\Collection;

interface BudgetAccountRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find budget account by code.
     *
     * @param string $code
     * @return BudgetAccount|null
     */
    public function findByCode(string $code): ?BudgetAccount;

    /**
     * Get all active budget accounts.
     *
     * @return Collection<int, BudgetAccount>
     */
    public function getActiveAccounts(): Collection;
}
