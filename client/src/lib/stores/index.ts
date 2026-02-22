/**
 * Store global (role, toast). Store lain: evaluasi-store, penugasan-store, sop-status-store, peraturan-store.
 */
export {
  useAppStore,
  getRole,
  setRole,
  clearRole,
  showToast,
  getRoleLabel,
  getRoleNip,
  isKepalaBiroOrganisasi,
  isKepalaOPD,
  isTimEvaluasi,
  isTimPenyusun,
  ROLES,
  type Role,
  type ToastType,
} from './app-store'
