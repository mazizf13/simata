<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

interface BaseRepositoryInterface
{
    /**
     * Get all records.
     *
     * @param array<string> $columns
     * @param array<string> $relations
     * @return Collection<int, Model>
     */
    public function all(array $columns = ['*'], array $relations = []): Collection;

    /**
     * Find record by ID.
     *
     * @param int|string $id
     * @param array<string> $columns
     * @param array<string> $relations
     * @return Model|null
     */
    public function findById(int|string $id, array $columns = ['*'], array $relations = []): ?Model;

    /**
     * Find record by ID or throw ModelNotFoundException.
     *
     * @param int|string $id
     * @param array<string> $columns
     * @param array<string> $relations
     * @return Model
     */
    public function findOrFail(int|string $id, array $columns = ['*'], array $relations = []): Model;

    /**
     * Paginate records.
     *
     * @param int $perPage
     * @param array<string> $columns
     * @param array<string> $relations
     * @return LengthAwarePaginator
     */
    public function paginate(int $perPage = 15, array $columns = ['*'], array $relations = []): LengthAwarePaginator;

    /**
     * Create a new record.
     *
     * @param array<string, mixed> $attributes
     * @return Model
     */
    public function create(array $attributes): Model;

    /**
     * Update an existing record.
     *
     * @param int|string $id
     * @param array<string, mixed> $attributes
     * @return Model
     */
    public function update(int|string $id, array $attributes): Model;

    /**
     * Delete a record by ID.
     *
     * @param int|string $id
     * @return bool
     */
    public function delete(int|string $id): bool;
}
