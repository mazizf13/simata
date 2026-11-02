<?php

namespace App\Traits;

use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

trait ApiResponses
{
    /**
     * Return standardized success JSON response.
     */
    protected function ok(mixed $data = null, string $message = 'Data berhasil diproses', int $statusCode = 200): JsonResponse
    {
        return ApiResponse::success($data, $message, $statusCode);
    }

    /**
     * Return standardized created response (201).
     */
    protected function created(mixed $data = null, string $message = 'Data berhasil dibuat'): JsonResponse
    {
        return ApiResponse::success($data, $message, 201);
    }

    /**
     * Return standardized error response.
     */
    protected function error(string $message, int $statusCode = 400, array $errors = [], ?string $errorCode = null): JsonResponse
    {
        return ApiResponse::error($message, $statusCode, $errors, $errorCode);
    }

    /**
     * Return standardized paginated response.
     */
    protected function paginated(LengthAwarePaginator $paginator, string $message = 'Data berhasil diambil'): JsonResponse
    {
        return ApiResponse::paginate($paginator, $message);
    }
}
