/**
 * Sidebar active matcher utility
 */
import type { SidebarItem } from '@/components/layout/RoleLayout'

export function createSidebarActiveMatcher(
  subRoutePrefixes: Record<string, string[]>
) {
  return (pathname: string, item: SidebarItem): boolean => {
    if (pathname === item.to) return true
    const prefixes = subRoutePrefixes[item.to]
    return prefixes?.some((p) => pathname.startsWith(p)) ?? false
  }
}
