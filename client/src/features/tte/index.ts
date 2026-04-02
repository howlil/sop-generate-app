/**
 * TTE (Tanda Tangan Elektronik) Feature Module
 * Digital signature for BA and SOP
 */

// Types
export type {
  KredensialTTE,
  CreateKredensialTTE,
  VerifyPinRequest,
  RiwayatTandaTangan,
  TandaTanganPayload,
} from './types/tte'

export type { PeranTTE } from '@/types/common'

// Services
export { tteApi } from './services/tte.api'

// Hooks
export { useTTE } from './hooks/useTTE'

// Components
export { PinVerificationDialog } from './components/PinVerificationDialog'
export { TTESignatureBlock } from './components/TTESignatureBlock'
