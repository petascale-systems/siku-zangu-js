'use client';

import React, { useState } from 'react';
import {
  columnFilteringFeature,
  type RowData,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { Button, Spinner, TextInput } from 'flowbite-react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

/**
 * Feature set for every admin table: sort, search, paginate.
 *
 * `globalFilteringFeature` requires `columnFilteringFeature`, and each row-model
 * slot must follow its feature — the types enforce both.
 */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortFns,
  sortedRowModel: createSortedRowModel(),
  columnFilteringFeature,
  globalFilteringFeature,
  filterFns,
  filteredRowModel: createFilteredRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

export type DataTableFeatures = typeof dataTableFeatures;

/** Column helper bound to the shared feature set. */
export const createDataTableColumns = <TData extends RowData>() =>
  createColumnHelper<DataTableFeatures, TData>();

export type WUIDataTableProps<TData extends RowData> = {
  data: TData[];
  columns: any[];
  isLoading?: boolean;
  error?: string | null;
  /** Shown when there is genuinely no data, as opposed to a failed load. */
  emptyMessage?: string;
  searchPlaceholder?: string;
  /** Hide the search box for short, fixed lists. */
  enableSearch?: boolean;
  pageSize?: number;
  onRetry?: () => void;
  /** Row click target, e.g. navigating to a detail page. */
  onRowClick?: (row: TData) => void;
};

/**
 * Shared admin table.
 *
 * Replaces hand-rolled markup that had no sorting, no search, and no
 * distinction between "still loading", "nothing here" and "the request
 * failed" — all three rendered as an empty table, which reads as data loss.
 *
 * Sorting and paging are client-side over the current page, because the API
 * exposes only `page`/`size`/`q` and always orders by `created_at DESC`.
 */
export function WUIDataTable<TData extends RowData>({
  data,
  columns,
  isLoading = false,
  error = null,
  emptyMessage = 'Nothing to show yet.',
  searchPlaceholder = 'Search…',
  enableSearch = true,
  pageSize = 10,
  onRetry,
  onRowClick,
}: WUIDataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageIndex: 0, pageSize } },
  }, (state) => ({ pagination: state.pagination }));

  const rows = table.getRowModel().rows;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const pageIndex = table.state.pagination.pageIndex;
  const columnCount = columns.length || 1;

  return (
    <div className="flex flex-col gap-3">
      {enableSearch && (
        <div className="flex items-center justify-between gap-3">
          <TextInput
            className="w-72"
            icon={MagnifyingGlassIcon}
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            aria-label={searchPlaceholder}
          />
          <span className="text-sm text-gray-500">
            {globalFilter
              ? `${filteredCount} of ${data.length} rows`
              : `${data.length} rows`}
          </span>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th key={header.id} scope="col" className="px-4 py-3">
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-gray-900"
                          // Sort state must reach assistive tech; a caret alone
                          // is colour/shape only.
                          aria-label={`Sort by ${String(header.column.id)}`}
                        >
                          <table.FlexRender header={header} />
                          {sorted === 'asc' ? (
                            <ArrowUpIcon className="size-3" />
                          ) : sorted === 'desc' ? (
                            <ArrowDownIcon className="size-3" />
                          ) : (
                            <ArrowsUpDownIcon className="size-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-200">
            {isLoading && (
              <tr>
                <td
                  colSpan={columnCount}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  <Spinner size="md" />
                  <span className="ml-2">Loading…</span>
                </td>
              </tr>
            )}

            {/* A failed load must never look like an empty list. */}
            {!isLoading && error && (
              <tr>
                <td colSpan={columnCount} className="px-4 py-10 text-center">
                  <p className="mb-3 text-red-600">{error}</p>
                  {onRetry && (
                    <Button size="xs" color="light" onClick={onRetry}>
                      Try again
                    </Button>
                  )}
                </td>
              </tr>
            )}

            {!isLoading && !error && rows.length === 0 && (
              <tr>
                <td
                  colSpan={columnCount}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  {globalFilter
                    ? `No results for “${globalFilter}”.`
                    : emptyMessage}
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={`bg-white ${
                    onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                  }`}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                >
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!isLoading && !error && pageCount > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Page {pageIndex + 1} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button
              size="xs"
              color="light"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              Previous
            </Button>
            <Button
              size="xs"
              color="light"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
