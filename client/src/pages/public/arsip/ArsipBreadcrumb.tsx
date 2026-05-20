import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { ROUTES } from '@/utils/constants'

export interface ArsipBreadcrumbItem {
  label: string
  to?: string
  params?: Record<string, string>
  search?: Record<string, string | undefined>
}

export interface ArsipBreadcrumbProps {
  items: ArsipBreadcrumbItem[]
}

export function ArsipBreadcrumb({ items }: ArsipBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-600">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
            {index > 0 ? <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden /> : null}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                params={item.params}
                search={item.search}
                className="rounded px-1 py-0.5 font-medium text-blue-700 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-slate-900' : undefined} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export function arsipHomeCrumb(): ArsipBreadcrumbItem {
  return { label: 'Arsip SOP', to: ROUTES.ARSIP.PREFIX }
}
