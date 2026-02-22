import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import type { BreadcrumbItem } from '@/components/ui/breadcrumb'

export interface PageHeaderContent {
  breadcrumb: BreadcrumbItem[]
  title: string
  description?: string
  leading?: ReactNode
  actions?: ReactNode
}

interface PageHeaderContextValue {
  headerContent: PageHeaderContent | null
  setHeaderContent: (content: PageHeaderContent | null) => void
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null)

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [headerContent, setHeaderContent] = useState<PageHeaderContent | null>(null)
  const value = useMemo(
    () => ({ headerContent, setHeaderContent }),
    [headerContent]
  )
  return (
    <PageHeaderContext.Provider value={value}>
      {children}
    </PageHeaderContext.Provider>
  )
}

export function usePageHeaderContext() {
  const ctx = useContext(PageHeaderContext)
  return ctx
}
