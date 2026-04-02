/**
 * Utils - Unified Export
 * Small utilities merged for convenience
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SidebarItem } from '@/components/layout/RoleLayout'

export { requireAuthBeforeLoad, requireRoleBeforeLoad } from './role'

/**
 * Class name merger (clsx + tailwind-merge)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Generates a unique ID using crypto.randomUUID with an optional prefix
 */
export function generateId(prefix?: string): string {
  const uuid = crypto.randomUUID()
  return prefix ? `${prefix}-${uuid}` : uuid
}

/**
 * Creates a sidebar active matcher for role layouts
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
