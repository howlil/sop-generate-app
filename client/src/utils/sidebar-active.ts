/**
 * Shared utility for determining sidebar active state across role layouts.
 */
import type { SidebarItem } from '@/components/layout/RoleLayout'

/**
 * Creates a sidebar active matcher. For each sidebar item, checks exact match
 * first, then checks if the pathname starts with any of the given sub-route prefixes.
 */
export function createSidebarActiveMatcher(
  subRoutePrefixes: Record<string, string[]>
) {
  return (pathname: string, item: SidebarItem): boolean => {
    if (pathname === item.to) return true
    const prefixes = subRoutePrefixes[item.to]
    return prefixes?.some((p) => pathname.startsWith(p)) ?? false
  }
}
