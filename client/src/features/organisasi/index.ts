/**
 * Organisasi Feature Module
 * OPD and Peraturan management
 */

// Types
export type {
  OPD,
  OpdResponse,
  CreateOpdDto,
  UpdateOpdDto,
  OpdWithStats,
} from "./types/opd";

export type {
  Peraturan,
  PeraturanResponse,
  CreatePeraturanDto,
  UpdatePeraturanDto,
  RiwayatVersiEntry,
  SopMengait,
} from "./types/peraturan";

// Services
export { opdApi } from "./services/opd.api";
export { peraturanApi } from "./services/peraturan.api";

// Hooks
export { useOpd } from "./hooks/useOpd";
export { usePeraturan } from "./hooks/usePeraturan";
