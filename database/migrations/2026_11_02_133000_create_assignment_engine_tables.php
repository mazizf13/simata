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
        // 1. Surat Perintah Kerja (SPK) foundation
        Schema::create('spks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mitra_id')->constrained('mitras')->restrictOnDelete();
            $table->string('spk_number', 100)->unique();
            $table->date('contract_date');
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->string('occupation', 150)->nullable();
            $table->string('position', 100)->nullable();
            $table->text('work_address')->nullable();
            $table->string('status', 30)->default('draft');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['mitra_id', 'period_start', 'period_end']);
        });

        // 2. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 50);
            $table->string('entity_type', 100);
            $table->unsignedBigInteger('entity_id');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['entity_type', 'entity_id']);
            $table->index(['user_id', 'action']);
        });

        // 3. Task Assignments (Penugasan Mitra)
        Schema::create('task_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mitra_id')->constrained('mitras')->restrictOnDelete();
            $table->foreignId('task_id')->constrained('tasks')->restrictOnDelete();
            $table->foreignId('spk_id')->nullable()->constrained('spks')->nullOnDelete();
            $table->foreignId('budget_account_id')->nullable()->constrained('budget_accounts')->nullOnDelete();

            // Historical Snapshots
            $table->string('task_name_snapshot', 200);
            $table->string('team_name_snapshot', 100);
            $table->string('budget_account_code_snapshot', 100)->nullable();
            $table->string('budget_account_name_snapshot', 200)->nullable();
            $table->string('unit_snapshot', 50);
            $table->decimal('unit_price_snapshot', 15, 2);

            // Assignment Parameters & Values
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('volume', 12, 2);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_value', 15, 2);

            // Workflow Status & Audit Columns
            $table->string('status', 30)->default('draft');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // High performance indexes for limit checks and monthly aggregates
            $table->index(['mitra_id', 'start_date', 'status'], 'idx_assignment_mitra_date_status');
            $table->index(['task_id', 'start_date'], 'idx_assignment_task_date');
            $table->index(['status', 'start_date'], 'idx_assignment_status_date');
            $table->index(['spk_id'], 'idx_assignment_spk');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_assignments');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('spks');
    }
};
