/**
 * Query keys untuk TanStack Query
 * Centralized query key management
 */

export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  user: (userId: string) => ['auth', 'user', userId] as const,
  
  // Peraturan
  peraturan: ['peraturan'] as const,
  peraturanList: (opdId?: string) => ['peraturan', 'list', opdId] as const,
  peraturanById: (id: string) => ['peraturan', 'byId', id] as const,
  
  // SOP
  sop: ['sop'] as const,
  sopList: (params?: { opdId?: string; status?: string }) => ['sop', 'list', params] as const,
  sopById: (id: string) => ['sop', 'byId', id] as const,
  
  // OPD
  opd: ['opd'] as const,
  opdList: () => ['opd', 'list'] as const,
  opdById: (id: string) => ['opd', 'byId', id] as const,
  
  // Tim Penyusun
  timPenyusun: ['timPenyusun'] as const,
  timPenyusunList: (opdId?: string) => ['timPenyusun', 'list', opdId] as const,
  
  // Tim Evaluasi
  timEvaluasi: ['timEvaluasi'] as const,
  timEvaluasiList: () => ['timEvaluasi', 'list'] as const,
}
