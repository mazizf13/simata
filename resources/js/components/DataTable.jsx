import React from 'react';
import { Pagination } from '@idds/react';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

export const DataTable = ({
    columns = [],
    data = [],
    isLoading = false,
    emptyTitle = 'Tidak Ada Data',
    emptyDescription = 'Belum ada data untuk ditampilkan pada tabel ini.',
    emptyAction = null,
    emptyState = null,
    pagination,
    onRowClick,
    keyExtractor = (row, index) => row.id ?? index,
    className = '',
}) => {
    return (
        <div className={`w-full bg-white border border-gray-200 rounded-b-lg overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {columns.map((col, idx) => {
                                const alignClass =
                                    col.align === 'right'
                                        ? 'text-right'
                                        : col.align === 'center'
                                        ? 'text-center'
                                        : 'text-left';

                                return (
                                    <th
                                        key={col.key || idx}
                                        style={col.width ? { width: col.width } : undefined}
                                        className={`px-4 py-3 ${alignClass} ${col.className || ''}`}
                                    >
                                        {col.header}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-800">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="py-12">
                                    <LoadingState message="Memuat baris data..." />
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8">
                                    <EmptyState
                                        title={emptyState?.title || emptyTitle}
                                        description={emptyState?.description || emptyDescription}
                                        action={emptyState?.action || emptyAction}
                                        className="border-none py-8"
                                    />
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIdx) => {
                                const key = keyExtractor(row, rowIdx);
                                const isClickable = !!onRowClick;

                                return (
                                    <tr
                                        key={key}
                                        onClick={isClickable ? () => onRowClick(row) : undefined}
                                        className={`transition-colors ${
                                            isClickable
                                                ? 'cursor-pointer hover:bg-blue-50/40'
                                                : 'hover:bg-gray-50/60'
                                        }`}
                                    >
                                        {columns.map((col, colIdx) => {
                                            const alignClass =
                                                col.align === 'right'
                                                    ? 'text-right'
                                                    : col.align === 'center'
                                                    ? 'text-center'
                                                    : 'text-left';

                                            const cellContent = col.render
                                                ? col.render(row, rowIdx)
                                                : row[col.key] ?? '-';

                                            return (
                                                <td
                                                    key={col.key || colIdx}
                                                    className={`px-4 py-3.5 ${alignClass} ${col.className || ''}`}
                                                >
                                                    {cellContent}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {pagination && pagination.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                    <div>
                        {(pagination.total !== undefined || pagination.totalItems !== undefined) && (
                            <span>
                                Total <strong>{pagination.total ?? pagination.totalItems}</strong> data tercatat
                            </span>
                        )}
                    </div>
                    <div>
                        <Pagination
                            currentPage={pagination.currentPage || 1}
                            totalPages={pagination.totalPages || 1}
                            pageSize={pagination.perPage || 15}
                            pageSizeOptions={pagination.pageSizeOptions || [10, 15, 25, 50]}
                            onPageChange={pagination.onPageChange || (() => {})}
                            onPageSizeChange={pagination.onPageSizeChange || (() => {})}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
