import { create } from 'zustand'
import { persist, PersistStorage } from 'zustand/middleware'

export const ROLES = {
  KEPALA_OPD: 'kepala-opd',
  KEPALA_BIRO_ORGANISASI: 'kepala-biro-organisasi',
  TIM_EVALUASI: 'tim-evaluasi',
  TIM_PENYUSUN: 'tim-penyusun',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export type ToastType = 'success' | 'error'

interface ToastState {
  message: string | null
  type: ToastType
}

interface AppState {
  role: Role | null
  toast: ToastState
  setRole: (role: Role | null) => void
  clearRole: () => void
  showToast: (message: string, type?: ToastType) => void
  clearToast: () => void
}

const initialToast: ToastState = { message: null, type: 'success' }

const PERSIST_KEY = 'biro-organisasi-role'

/** Kompatibel dengan format lama: localStorage pernah simpan role sebagai string. */
const roleStorage: PersistStorage<{ role: Role | null }> = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(name)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as { state?: { role: Role | null }; version?: number }
      if (parsed?.state != null) return parsed
      return null
    } catch {
      const valid = Object.values(ROLES).includes(raw as Role)
      return { state: { role: valid ? (raw as Role) : null }, version: 0 }
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

export function getRole(): Role | null {
  return useAppStore.getState().role
}

export function setRole(role: Role): void {
  useAppStore.getState().setRole(role)
}

export function clearRole(): void {
  useAppStore.getState().clearRole()
}

export function showToast(message: string, type: ToastType = 'success'): void {
  useAppStore.getState().showToast(message, type)
}

const ROLE_LABELS: Record<Role, string> = {
  [ROLES.KEPALA_OPD]: 'Kepala OPD',
  [ROLES.KEPALA_BIRO_ORGANISASI]: 'Kepala Biro Organisasi',
  [ROLES.TIM_EVALUASI]: 'Tim Evaluasi',
  [ROLES.TIM_PENYUSUN]: 'Tim Penyusun',
}

const ROLE_NIPS: Record<Role, string> = {
  [ROLES.KEPALA_OPD]: '197001011990031001',
  [ROLES.KEPALA_BIRO_ORGANISASI]: '196512311988021002',
  [ROLES.TIM_EVALUASI]: '198003051999031003',
  [ROLES.TIM_PENYUSUN]: '198512152010121004',
}

export function getRoleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? role
}

/** NIP dummy per aktor sampai terhubung ke data user/auth. */
export function getRoleNip(role: Role): string {
  return ROLE_NIPS[role] ?? '-'
}

export function isKepalaBiroOrganisasi(): boolean {
  return getRole() === ROLES.KEPALA_BIRO_ORGANISASI
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
