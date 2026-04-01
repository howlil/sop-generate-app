/**
 * Query keys untuk TanStack Query
 * Centralized query key management
 */

export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  user: (userId: string) => ['auth', 'user', userId] as const,
  users: ['users'] as const,
  usersList: (page: number, limit: number) => ['users', 'list', page, limit] as const,

  // Peraturan
  peraturan: ['peraturan'] as const,
  peraturanList: (opdId?: string) => ['peraturan', 'list', opdId] as const,
  peraturanById: (id: string) => ['peraturan', 'byId', id] as const,

  // SOP
  sop: ['sop'] as const,
  sopList: (params?: { opdId?: string; status?: string }) => ['sop', 'list', params] as const,
  sopById: (id: string) => ['sop', 'byId', id] as const,
  
  // Detail SOP
  detailSop: ['detailSop'] as const,
  detailSopList: (params?: { sopId?: string; opdId?: string; status?: string }) => ['detailSop', 'list', params] as const,
  detailSopById: (id: string) => ['detailSop', 'byId', id] as const,
  detailSopLogs: (id: string) => ['detailSop', 'logs', id] as const,
  
  // Langkah SOP
  langkahSop: ['langkahSop'] as const,
  langkahSopByDetail: (sopDetailId: string) => ['langkahSop', 'byDetail', sopDetailId] as const,
  
  // Pelaksana
  pelaksana: ['pelaksana'] as const,
  pelaksanaByOpd: (opdId: string) => ['pelaksana', 'byOpd', opdId] as const,

  // OPD
  opd: ['opd'] as const,
  opdList: () => ['opd', 'list'] as const,
  opdById: (id: string) => ['opd', 'byId', id] as const,

  // Tim Penyusun
  timPenyusun: ['timPenyusun'] as const,
  timPenyusunList: (opdId?: string) => ['timPenyusun', 'list', opdId] as const,
  timPenyusunById: (id: string) => ['timPenyusun', 'byId', id] as const,

  // Tim Evaluasi
  timEvaluasi: ['timEvaluasi'] as const,
  timEvaluasiList: () => ['timEvaluasi', 'list'] as const,
  timEvaluasiById: (id: string) => ['timEvaluasi', 'byId', id] as const,
  
  // Evaluasi
  evaluasi: ['evaluasi'] as const,
  evaluasiList: (params?: { opdId?: string; status?: string; jenis?: string }) => ['evaluasi', 'list', params] as const,
  evaluasiById: (id: string) => ['evaluasi', 'byId', id] as const,
  evaluasiRekap: (tahun?: number) => ['evaluasi', 'rekap', tahun] as const,
  
  // TTE
  tte: ['tte'] as const,
  tteProfil: ['tte', 'profil'] as const,
  tteRiwayat: ['tte', 'riwayat'] as const,
  
  // Audit
  audit: ['audit'] as const,
  auditBySopDetail: (sopDetailId: string) => ['audit', 'bySopDetail', sopDetailId] as const,
  auditAll: (params?: { bagian?: string }) => ['audit', 'all', params] as const,
}
