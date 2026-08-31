import React, { useState, useEffect, useId } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender
} from '@tanstack/react-table';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';

export default function DataTable({
  data = [],
  columns,
  title,
  subtitle,
  defaultPageSize = 5,
  searchPlaceholder = 'Cari data di tabel...',
  isLoading = false,
  ariaLabel
}) {
  const tableId = useId();
  const [sorting, setSorting] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize
  });

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setGlobalFilter(searchValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const totalRows = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);
  const totalPages = table.getPageCount() || 1;

  return (
    <div className="card bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
      {/* Top Header & Global Search */}
      <div className="p-4 sm:p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {title && <h3 id={`table-title-${tableId}`} className="text-base font-bold text-[var(--forest-deep)] font-heading">{title}</h3>}
          {subtitle && <p className="text-xs text-[var(--ink-soft)] mt-0.5">{subtitle}</p>}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[var(--ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            id={`table-global-search-${tableId}`}
            type="text"
            role="searchbox"
            aria-label={title ? `Cari pada tabel ${title}` : searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-[var(--canvas)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--ink)] placeholder-[var(--ink-soft)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--forest)] focus:bg-[var(--surface)] transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table
          className="w-full text-left border-collapse"
          aria-labelledby={title ? `table-title-${tableId}` : undefined}
          aria-label={ariaLabel || (!title ? 'Tabel Data Operasional' : undefined)}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-[var(--canvas)]/80 border-b border-[var(--border)]">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={`px-4 py-3 text-[11px] font-bold text-[var(--ink-soft)] uppercase tracking-wider select-none ${
                        canSort ? 'cursor-pointer hover:text-[var(--forest-deep)] transition-colors' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}

                        {canSort && (
                          <span className="text-[var(--ink-soft)]" aria-hidden="true">
                            {sorted === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-[var(--forest)]" />
                            ) : sorted === 'desc' ? (
                              <ArrowDown className="w-3 h-3 text-[var(--forest)]" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: pageSize }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                  {columns.map((_, colIndex) => (
                    <td key={`skeleton-cell-${colIndex}`} className="px-4 py-4">
                      <div className="h-3.5 bg-[var(--canvas)] rounded-md w-4/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[var(--canvas)]/60 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5 text-xs text-[var(--ink)] font-medium">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-xs text-[var(--ink-soft)]"
                >
                  Tidak ada data yang sesuai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Descriptive Row Count Footer */}
      <div className="p-3 sm:px-5 border-t border-[var(--border)] bg-[var(--surface)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--ink-soft)]">
        <div className="flex items-center gap-2">
          <span>Tampilkan</span>
          <select
            aria-label="Jumlah baris per halaman"
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="bg-[var(--canvas)] border border-[var(--border)] rounded-lg px-2.5 py-1 text-xs text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--forest)] shadow-2xs"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>baris per halaman</span>
        </div>

        <div className="flex items-center gap-4">
          <span aria-live="polite">
            Menampilkan <strong className="text-[var(--ink)] font-semibold">{startRow}-{endRow}</strong> dari{' '}
            <strong className="text-[var(--ink)] font-semibold">{totalRows}</strong> data{' '}
            (Hal. <strong className="text-[var(--ink)] font-semibold">{pageIndex + 1}</strong>/{totalPages})
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Halaman sebelumnya"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg bg-[var(--canvas)] border border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--leaf-pale)] hover:text-[var(--forest-deep)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Halaman berikutnya"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg bg-[var(--canvas)] border border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--leaf-pale)] hover:text-[var(--forest-deep)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
