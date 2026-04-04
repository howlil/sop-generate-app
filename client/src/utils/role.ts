/**
 * Role-based utilities with hierarchical RBAC support
 */

import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/utils/constants'
import type { RoleKey } from '@/types/common'

/**
 * Role Hierarchy Definition
 * Higher roles inherit permissions from lower roles
 * Level 5 (highest) → Level 1 (lowest)
 */
export const ROLE_HIERARCHY: Record<RoleKey, number> = {
  'BIRO_ORGANISASI': 5,
  'KEPALA_OPD': 4,
  'TIM_EVALUASI': 3,
  'KOORDINATOR_TIM_PENYUSUN': 2,
  'TIM_PENYUSUN': 1,
} as const

/**
 * Permission definitions for each role
 * This allows fine-grained access control beyond simple role matching
 */
export const PERMISSIONS = {
  // Core permissions
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_SOP: 'manage_sop',
  EVALUATE_SOP: 'evaluate_sop',
  VERIFY_SOP: 'verify_sop',
  APPROVE_SOP: 'approve_sop',
  MANAGE_USERS: 'manage_users',
  MANAGE_OPD: 'manage_opd',
  MANAGE_TIM: 'manage_tim',
  VIEW_REPORTS: 'view_reports',
  CHANGE_PASSWORD: 'change_password',
  SIGN_DOCUMENTS: 'sign_documents',
} as const

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS]

/**
 * Role to Permissions Mapping
 * Each role gets a set of permissions
 */
export const ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  'TIM_PENYUSUN': [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_SOP,
    PERMISSIONS.CHANGE_PASSWORD,
    PERMISSIONS.SIGN_DOCUMENTS,
  ],
  'KOORDINATOR_TIM_PENYUSUN': [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_SOP,
    PERMISSIONS.CHANGE_PASSWORD,
    PERMISSIONS.SIGN_DOCUMENTS,
    PERMISSIONS.APPROVE_SOP, // Coordinators can approve
  ],
  'KEPALA_OPD': [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CHANGE_PASSWORD,
    PERMISSIONS.SIGN_DOCUMENTS,
    PERMISSIONS.APPROVE_SOP, // Kepala OPD can approve
  ],
  'TIM_EVALUASI': [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.EVALUATE_SOP,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CHANGE_PASSWORD,
  ],
  'BIRO_ORGANISASI': [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_SOP,
    PERMISSIONS.EVALUATE_SOP,
    PERMISSIONS.VERIFY_SOP,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_OPD,
    PERMISSIONS.MANAGE_TIM,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CHANGE_PASSWORD,
    PERMISSIONS.SIGN_DOCUMENTS,
  ],
} as const

/**
 * Get OPD ID for Kepala OPD role
 */
export function getKepalaOPDOpdId(): string {
  const user = useAuthStore.getState().user
  return user?.opdId ?? ''
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(permission: PermissionKey): boolean {
  const user = useAuthStore.getState().user
  if (!user) return false

  const userRole = user.peran as RoleKey
  const userPermissions = ROLE_PERMISSIONS[userRole] || []
  return userPermissions.includes(permission)
}

/**
 * Check if user has ANY of the specified permissions
 */
export function hasAnyPermission(permissions: PermissionKey[]): boolean {
  return permissions.some(hasPermission)
}

/**
 * Check if user has ALL of the specified permissions
 */
export function hasAllPermissions(permissions: PermissionKey[]): boolean {
  return permissions.every(hasPermission)
}

/**
 * Check if user's role meets the minimum hierarchy level
 */
export function hasMinRoleLevel(minLevel: number): boolean {
  const user = useAuthStore.getState().user
  if (!user) return false

  const userRole = user.peran as RoleKey
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  return userLevel >= minLevel
}

/**
 * Route guard: requires specific role (exact match)
 * Wrapper for single role compatibility
 */
export function requireRoleBeforeLoad(requiredRole: RoleKey) {
  return requireRolesBeforeLoad([requiredRole])
}

/**
 * Route guard: requires ONE of the specified roles (OR logic)
 * Example: requireRolesBeforeLoad(['BIRO_ORGANISASI', 'TIM_EVALUASI'])
 */
export function requireRolesBeforeLoad(requiredRoles: RoleKey[]) {
  return ({ location }: { location: { href: string } }) => {
    const user = useAuthStore.getState().user

    if (!user) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      })
    }

    if (!requiredRoles.includes(user.peran as RoleKey)) {
      throw redirect({
        to: ROUTES.HOME,
        search: {
          denied: requiredRoles.join(','),
          redirect: location.href,
        },
      })
    }
  }
}

/**
 * Route guard: requires minimum role level (hierarchy-based)
 * Example: requireMinRoleLevel(3) allows TIM_EVALUASI, KEPALA_OPD, BIRO_ORGANISASI
 */
export function requireMinRoleLevel(minLevel: number) {
  return ({ location }: { location: { href: string } }) => {
    const user = useAuthStore.getState().user

    if (!user) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      })
    }

    const userRole = user.peran as RoleKey
    const userLevel = ROLE_HIERARCHY[userRole] || 0

    if (userLevel < minLevel) {
      throw redirect({
        to: ROUTES.HOME,
        search: {
          denied: `min_level_${minLevel}`,
          redirect: location.href,
        },
      })
    }
  }
}

/**
 * Route guard: requires specific permissions
 * Example: requirePermissions([PERMISSIONS.MANAGE_SOP, PERMISSIONS.APPROVE_SOP])
 */
export function requirePermissions(permissions: PermissionKey[], requireAll = false) {
  return ({ location }: { location: { href: string } }) => {
    const user = useAuthStore.getState().user

    if (!user) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      })
    }

    const userRole = user.peran as RoleKey
    const userPermissions = ROLE_PERMISSIONS[userRole] || []

    const hasRequired = requireAll
      ? permissions.every(p => userPermissions.includes(p))
      : permissions.some(p => userPermissions.includes(p))

    if (!hasRequired) {
      throw redirect({
        to: ROUTES.HOME,
        search: {
          denied: `permissions:${permissions.join(',')}`,
          redirect: location.href,
        },
      })
    }
  }
}
