import { createContext, useContext, useState, type ReactNode } from 'react'
import type { BreadcrumbItem } from '@/components/ui/breadcrumb'

/**
 * PageHeaderContent - Header content structure
 * 
 * Used by PageHeaderContext to manage header state across layout.
 * Content is set by PageHeader component, displayed by HeaderProfile.
 */
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

/**
 * PageHeaderContext - Context for managing page header content
 * 
 * Provides a way for pages to declaratively set header content
 * without prop drilling through layout layers.
 * 
 * @example
 * ```tsx
 * // In RoleLayout (provider)
 * <PageHeaderProvider>
 *   <HeaderProfile />
 *   <Outlet />
 * </PageHeaderProvider>
 * 
 * // In page component (consumer)
 * <PageHeader
 *   breadcrumb={[{ label: 'Home' }]}
 *   title="Dashboard"
 *   actions={<Button>Action</Button>}
 * />
 * ```
 */
const PageHeaderContext = createContext<PageHeaderContextValue | null>(null)

/**
 * PageHeaderProvider - Provides header context to component tree
 * 
 * Must wrap RoleLayout or similar layout component.
 * Stores header content state and provides setter via context.
 */
export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [headerContent, setHeaderContent] = useState<PageHeaderContent | null>(null)
  return (
    <PageHeaderContext.Provider value={{ headerContent, setHeaderContent }}>
      {children}
    </PageHeaderContext.Provider>
  )
}

/**
 * usePageHeaderContext - Hook to access header context
 * 
 * @returns Context value with headerContent and setHeaderContent
 * @returns null if used outside PageHeaderProvider
 * 
 * @example
 * ```tsx
 * const ctx = usePageHeaderContext()
 * if (ctx) {
 *   ctx.setHeaderContent({ breadcrumb: [], title: 'New Title' })
 * }
 * ```
 */
export function usePageHeaderContext() {
  const ctx = useContext(PageHeaderContext)
  return ctx
}
