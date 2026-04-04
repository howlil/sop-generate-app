/**
 * TTE (Tanda Tangan Elektronik) Feature Module
 * Digital signature for BA and SOP
 */

// Types
export type {
  KredensialTTE,
  RiwayatTandaTangan,
  RegisterTteDto,
  TandaTanganiBaDto,
  TandaTanganiSopDto,
  TTESignaturePayload,
} from './types/tte'

export type { PeranTTE } from '@/types/common'

/** UI-facing TTE role type using kebab-case */
export type TTERole = 'kepala-opd' | 'biro-organisasi' | 'tim-penyusun' | 'koordinator-tim-penyusun'

// Services
export { tteApi } from './services/tte.api'

// Hooks - export all utilities
export { 
  useTTEProfil, 
  useRegisterTTE, 
  useMintTokenVerifikasi,
  useTTESignature, 
  getValidasiPengesahanUrl, 
  getTTEVerificationSuccessUrl 
} from './hooks/useTte'

// Components
export { PinVerificationDialog } from './components/PinVerificationDialog'
export { TTESignatureBlock } from './components/TTESignatureBlock'
