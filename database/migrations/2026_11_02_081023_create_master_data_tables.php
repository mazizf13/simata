<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Districts (Kecamatan 3516)
        Schema::create('districts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name', 100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'name']);
        });

        // 2. Budget Accounts (Akun Anggaran)
        Schema::create('budget_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 100)->unique();
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'code']);
        });

        // 3. Tasks (Katalog Tugas / Kegiatan Survei & Sensus)
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->nullable()->unique();
            $table->foreignId('team_id')->constrained('teams')->restrictOnDelete();
            $table->string('name', 200);
            $table->string('default_unit', 50);
            $table->decimal('default_rate', 15, 2)->default(0);
            $table->foreignId('default_budget_account_id')->nullable()->constrained('budget_accounts')->nullOnDelete();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['team_id', 'is_active']);
            $table->index(['name']);
        });

        // 4. Mitras (Data Mitra Statistik BPS)
        Schema::create('mitras', function (Blueprint $table) {
            $table->id();
            $table->string('mitra_code', 30)->unique();
            $table->string('name', 150);
            $table->text('address')->nullable();
            $table->foreignId('district_id')->constrained('districts')->restrictOnDelete();
            $table->string('phone', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('occupation', 100)->nullable();
            $table->string('position', 100)->nullable();
            $table->string('status', 20)->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['district_id', 'status']);
            $table->index(['status', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mitras');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('budget_accounts');
        Schema::dropIfExists('districts');
    }
};
