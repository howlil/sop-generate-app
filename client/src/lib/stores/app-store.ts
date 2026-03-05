import { create } from 'zustand'
import { persist, PersistStorage } from 'zustand/middleware'
import { ROLE_NIPS as SEED_ROLE_NIPS, ROLE_DISPLAY_NAMES, ROLE_USER_NAMES } from '@/lib/seed/user-seed'
import { ROLES, ROLE_LABELS, type RoleKey } from '@/lib/constants/roles'

export { ROLES } from '@/lib/constants/roles'
export type { RoleKey as Role } from '@/lib/constants/roles'

export type ToastType = 'success' | 'error'

interface ToastState {
  message: string | null
  type: ToastType
}

interface AppState {
  role: RoleKey | null
  toast: ToastState
  setRole: (role: RoleKey | null) => void
  clearRole: () => void
  showToast: (message: string, type?: ToastType) => void
  clearToast: () => void
}

const initialToast: ToastState = { message: null, type: 'success' }

const PERSIST_KEY = 'biro-organisasi-role'

/** Kompatibel dengan format lama: localStorage pernah simpan role sebagai string. */
const roleStorage: PersistStorage<{ role: RoleKey | null }> = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(name)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as { state?: { role: RoleKey | null }; version?: number }
      if (parsed?.state != null) return parsed as { state: { role: RoleKey | null }; version?: number }
      return null
    } catch {
      const valid = Object.values(ROLES).includes(raw as RoleKey)
      return { state: { role: valid ? (raw as RoleKey) : null }, version: 0 }
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(name, JSON.stringify(value))
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(name)
  },
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: null,
      toast: initialToast,
      setRole: (role) => set({ role }),
      clearRole: () => set({ role: null }),
      showToast: (message, type = 'success') => set({ toast: { message, type } }),
      clearToast: () => set({ toast: initialToast }),
    }),
    {
      name: PERSIST_KEY,
      storage: roleStorage,
      partialize: (s) => ({ role: s.role }),
    }
  )
)

export function getRole(): RoleKey | null {
  return useAppStore.getState().role
}

export function setRole(role: RoleKey): void {
  useAppStore.getState().setRole(role)
}

export function clearRole(): void {
  useAppStore.getState().clearRole()
}

export function showToast(message: string, type: ToastType = 'success'): void {
  useAppStore.getState().showToast(message, type)
}

export function getRoleLabel(role: RoleKey): string {
  return ROLE_LABELS[role] ?? role
}

export function getRoleNip(role: RoleKey): string {
  return SEED_ROLE_NIPS[role] ?? '-'
}

export function getRoleDisplayName(role: RoleKey): string {
  return ROLE_DISPLAY_NAMES[role] ?? getRoleLabel(role)
}

/** Nama orang (user) untuk role, dipakai di evaluator/penandatangan. */
export function getRoleUserName(role: RoleKey): string {
  return ROLE_USER_NAMES[role] ?? getRoleDisplayName(role)
}

export function isBiroOrganisasi(): boolean {
  return getRole() === ROLES.BIRO_ORGANISASI
}

export function isKepalaOPD(): boolean {
  return getRole() === ROLES.KEPALA_OPD
}

export function isTimEvaluasi(): boolean {
  return getRole() === ROLES.TIM_EVALUASI
}

export function isTimPenyusun(): boolean {
  return getRole() === ROLES.TIM_PENYUSUN
}
