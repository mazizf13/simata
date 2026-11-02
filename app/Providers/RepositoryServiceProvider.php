<?php

namespace App\Providers;

use App\Repositories\Contracts\BudgetAccountRepositoryInterface;
use App\Repositories\Contracts\DistrictRepositoryInterface;
use App\Repositories\Contracts\MitraRepositoryInterface;
use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Repositories\Contracts\TaskAssignmentRepositoryInterface;
use App\Repositories\Contracts\TaskRepositoryInterface;
use App\Repositories\Contracts\TeamRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\BudgetAccountRepository;
use App\Repositories\Eloquent\DistrictRepository;
use App\Repositories\Eloquent\MitraRepository;
use App\Repositories\Eloquent\RoleRepository;
use App\Repositories\Eloquent\TaskAssignmentRepository;
use App\Repositories\Eloquent\TaskRepository;
use App\Repositories\Eloquent\TeamRepository;
use App\Repositories\Eloquent\UserRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register repository bindings.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(RoleRepositoryInterface::class, RoleRepository::class);
        $this->app->bind(TeamRepositoryInterface::class, TeamRepository::class);
        $this->app->bind(DistrictRepositoryInterface::class, DistrictRepository::class);
        $this->app->bind(BudgetAccountRepositoryInterface::class, BudgetAccountRepository::class);
        $this->app->bind(TaskRepositoryInterface::class, TaskRepository::class);
        $this->app->bind(MitraRepositoryInterface::class, MitraRepository::class);
        $this->app->bind(TaskAssignmentRepositoryInterface::class, TaskAssignmentRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
