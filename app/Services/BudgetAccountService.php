<?php

namespace App\Services;

use App\Models\BudgetAccount;
use App\Repositories\Contracts\BudgetAccountRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class BudgetAccountService
{
    public function __construct(
        protected BudgetAccountRepositoryInterface $budgetAccountRepository
    ) {}

    /**
     * @return Collection<int, BudgetAccount>
     */
    public function getActiveAccounts(): Collection
    {
        return $this->budgetAccountRepository->getActiveAccounts();
    }

    public function getPaginatedAccounts(int $perPage = 25): LengthAwarePaginator
    {
        return $this->budgetAccountRepository->paginate($perPage);
    }

    public function getAccountById(int|string $id): BudgetAccount
    {
        /** @var BudgetAccount */
        return $this->budgetAccountRepository->findOrFail($id);
    }

    public function createAccount(array $data): BudgetAccount
    {
        /** @var BudgetAccount */
        return $this->budgetAccountRepository->create($data);
    }

    public function updateAccount(int|string $id, array $data): BudgetAccount
    {
        /** @var BudgetAccount */
        return $this->budgetAccountRepository->update($id, $data);
    }

    public function deactivateAccount(int|string $id): BudgetAccount
    {
        /** @var BudgetAccount */
        $account = $this->budgetAccountRepository->findOrFail($id);
        $account->update(['is_active' => false]);
        return $account;
    }
}
