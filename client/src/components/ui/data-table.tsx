import { useState, useEffect, useMemo } from 'react'
import * as React from 'react'
import { cn } from '@/utils/cn'
import { Pagination } from '@/components/ui/pagination'

/** Wrapper overflow-x-auto; untuk scroll horizontal tabel. */
const DataTableRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('overflow-x-auto', className)} {...props} />
))
DataTableRoot.displayName = 'DataTableRoot'

/** Card + overflow: bg-white rounded-lg border border-gray-200 overflow-x-auto. */
const DataTableCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('bg-white rounded-lg border border-gray-200 overflow-x-auto', className)}
    {...props}
  />
))
DataTableCard.displayName = 'DataTableCard'

/** <table> dengan w-full text-xs. */
const DataTableTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn('w-full text-xs border-collapse', className)}
    {...props}
  />
))
DataTableTable.displayName = 'DataTableTable'

/** Baris header: border-b border-gray-200 bg-blue-50. */
const DataTableHeaderRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn('border-b border-gray-200 bg-blue-50', className)}
    {...props}
  />
))
DataTableHeaderRow.displayName = 'DataTableHeaderRow'

/** Baris body: border-b border-gray-100 hover:bg-gray-50 transition-all. */
const DataTableBodyRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn('border-b border-gray-100 hover:bg-gray-50 transition-all', className)}
    {...props}
  />
))
DataTableBodyRow.displayName = 'DataTableBodyRow'

/** <th>: py-2.5 px-3 font-medium text-gray-700. Default left; gunakan align="center" hanya untuk kolom Aksi/tengah. */
const DataTableTh = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'center' }
>(({ className, align = 'left', ...props }, ref) => (
  <th
    ref={ref}
    scope="col"
    className={cn(
      'py-2.5 px-3 font-medium text-gray-700',
      align === 'center' ? 'text-center' : 'text-left',
      className
    )}
    {...props}
  />
))
DataTableTh.displayName = 'DataTableTh'

/** <td>: py-2.5 px-3. */
const DataTableTd = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('py-2.5 px-3', className)} {...props} />
))
DataTableTd.displayName = 'DataTableTd'

// ==================== Paginated Table ====================

interface PaginatedTableProps<T> {
  /** Array data yang akan di-paginate. */
  data: T[]
  /** Jumlah item per halaman. Default 10. */
  pageSize?: number
  /** Label entitas untuk info pagination, e.g. "SOP". */
  label?: string
  /** Render function: terima data halaman saat ini + offset index dari array asal. */
  children: (pageData: T[], startIndex: number) => React.ReactNode
  className?: string
}

function PaginatedTable<T>({
  data,
  pageSize = 10,
  label,
  children,
  className,
}: PaginatedTableProps<T>) {
  const [page, setPage] = useState(1)
  const totalPages = data.length === 0 ? 1 : Math.ceil(data.length / pageSize)
  const safePage = Math.min(Math.max(1, page), totalPages)

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(1)
  }, [totalPages, page])

  const startIndex = (safePage - 1) * pageSize
  const pageData = useMemo(
    () => data.slice(startIndex, startIndex + pageSize),
    [data, startIndex, pageSize]
  )

  const showPagination = data.length > pageSize

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      {children(pageData, startIndex)}
      {showPagination && (
        <Pagination
          totalItems={data.length}
          currentPage={safePage}
          onPageChange={setPage}
          pageSize={pageSize}
          label={label}
        />
      )}
    </div>
  )
}

// ==================== Exports ====================

export {
  DataTableRoot,
  DataTableCard,
  DataTableTable,
  DataTableHeaderRow,
  DataTableBodyRow,
  DataTableTh,
  DataTableTd,
  PaginatedTable,
}

export { Pagination } from '@/components/ui/pagination'

/** Compound component untuk pemakaian: Table.Card, Table.Root, Table.Table, Table.Paginated, dll. */
export const Table = {
  Root: DataTableRoot,
  Card: DataTableCard,
  Table: DataTableTable,
  HeadRow: DataTableHeaderRow,
  BodyRow: DataTableBodyRow,
  Th: DataTableTh,
  Td: DataTableTd,
  Pagination,
  Paginated: PaginatedTable,
}
