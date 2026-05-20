import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Table } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import type { PaginationMetaDto } from '@/types/dto/evaluasi.dto'
import { cn } from '@/utils/cn'

export interface ExpandableGroupedTableProps<TGroup> {
  groups: TGroup[]
  getGroupId: (group: TGroup) => string
  renderGroupTitle: (group: TGroup) => ReactNode
  renderGroupMeta?: (group: TGroup) => ReactNode
  renderGroupAside?: (group: TGroup) => ReactNode
  renderRows: (group: TGroup) => ReactNode
  emptyContent?: ReactNode
  isLoading?: boolean
  loadingContent?: ReactNode
  pagination?: PaginationMetaDto | null
  onPageChange?: (page: number) => void
  className?: string
}

export function ExpandableGroupedTable<TGroup>({
  groups,
  getGroupId,
  renderGroupTitle,
  renderGroupMeta,
  renderGroupAside,
  renderRows,
  emptyContent,
  isLoading = false,
  loadingContent,
  pagination,
  onPageChange,
  className,
}: ExpandableGroupedTableProps<TGroup>) {
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>([])

  useEffect(() => {
    if (isLoading) return
    setExpandedGroupIds((prev) => {
      const prevSet = new Set(prev)
      const existingIds = groups.map(getGroupId)
      const persisted = existingIds.filter((id) => prevSet.has(id))
      const next = persisted.length > 0 ? persisted : existingIds
      if (prev.length === next.length && prev.every((id, index) => id === next[index])) {
        return prev
      }
      return next
    })
  }, [getGroupId, groups, isLoading])

  const toggleGroup = (groupId: string) => {
    setExpandedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {isLoading ? loadingContent : null}
      {!isLoading && groups.length === 0 ? emptyContent : null}
      {!isLoading
        ? groups.map((group) => {
            const groupId = getGroupId(group)
            const isExpanded = expandedGroupIds.includes(groupId)
            return (
              <div
                key={groupId}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full px-4 py-3 border-b border-gray-100 bg-gray-50/70 hover:bg-gray-100/70 transition-colors"
                  onClick={() => toggleGroup(groupId)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                      )}
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {renderGroupTitle(group)}
                      </span>
                      {renderGroupMeta ? (
                        <Badge variant="default" className="text-[11px] font-medium shrink-0">
                          {renderGroupMeta(group)}
                        </Badge>
                      ) : null}
                    </div>
                    {renderGroupAside ? (
                      <span className="text-xs text-gray-600 whitespace-nowrap">
                        {renderGroupAside(group)}
                      </span>
                    ) : null}
                  </div>
                </button>
                {isExpanded ? renderRows(group) : null}
              </div>
            )
          })
        : null}
      {pagination && onPageChange ? (
        <div className="bg-white rounded-lg border border-gray-200">
          <Pagination
            totalItems={pagination.totalItems}
            currentPage={pagination.page}
            onPageChange={onPageChange}
            pageSize={pagination.limit}
            label="pengajuan"
          />
        </div>
      ) : null}
    </div>
  )
}

export function GroupedTableState({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table.Table>
        <tbody>{children}</tbody>
      </Table.Table>
    </div>
  )
}
