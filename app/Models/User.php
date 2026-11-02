<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'is_active',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsToMany<Role, User>
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user')->withTimestamps();
    }

    /**
     * @return BelongsToMany<Team, User>
     */
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_user')->withTimestamps();
    }

    public function hasRole(string|UserRole $role): bool
    {
        $roleValue = $role instanceof UserRole ? $role->value : $role;
        return $this->roles->contains('name', $roleValue);
    }

    /**
     * @param array<string|UserRole> $roles
     */
    public function hasAnyRole(array $roles): bool
    {
        foreach ($roles as $role) {
            if ($this->hasRole($role)) {
                return true;
            }
        }
        return false;
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole(UserRole::SUPER_ADMIN);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(UserRole::ADMIN);
    }

    public function isOperator(): bool
    {
        return $this->hasRole(UserRole::OPERATOR_TIM);
    }

    public function isPimpinan(): bool
    {
        return $this->hasRole(UserRole::PIMPINAN);
    }

    public function belongsToTeam(int|string|Team $team): bool
    {
        if ($team instanceof Team) {
            return $this->teams->contains('id', $team->id);
        }

        if (is_numeric($team)) {
            return $this->teams->contains('id', (int) $team);
        }

        return $this->teams->contains('code', $team);
    }

    /**
     * @return array<int>
     */
    public function teamIds(): array
    {
        return $this->teams->pluck('id')->all();
    }

    public function primaryRole(): ?Role
    {
        return $this->roles->first();
    }
}
