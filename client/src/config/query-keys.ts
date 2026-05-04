/**
 * Query keys untuk TanStack Query
 * Centralized query key management
 */

export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  user: (userId: string) => ['auth', 'user', userId] as const,
  users: ['users'] as const,
  usersList: (params?: {
    page?: number
    limit?: number
    opdId?: string
    peran?: string
    search?: string
  }) => ['users', 'list', params] as const,

  /** Manajemen Kepala OPD (Biro) — GET/PATCH/DELETE `/kepala-opd` */
  kepalaOpd: ['kepalaOpd'] as const,
  /** GET `/kepala-opd` — termasuk query `search` */
  kepalaOpdList: (search?: string) =>
    ['kepalaOpd', 'list', 'v2', search ?? ''] as const,
  kepalaOpdRiwayat: (penggunaId: string) => ['kepalaOpd', 'riwayatOpd', penggunaId] as const,

  // Peraturan
  peraturan: ['peraturan'] as const,
  peraturanList: (opdId?: string) => ['peraturan', 'list', opdId] as const,

  // SOP
  sop: ['sop'] as const,
  sopList: (params?: { opdId?: string; status?: string }) => ['sop', 'list', params] as const,
  sopById: (id: string) => ['sop', 'byId', id] as const,
  /** GET `/sop/penyusun-workbench/:detailSopId` — agregat detail + langkah + log */
  penyusunWorkbench: (detailSopId: string) => ['sop', 'penyusunWorkbench', detailSopId] as const,

  // Detail SOP
  detailSop: ['detailSop'] as const,
  detailSopList: (params?: { sopId?: string; opdId?: string; status?: string }) => ['detailSop', 'list', params] as const,
  detailSopById: (id: string) => ['detailSop', 'byId', id] as const,
  detailSopLogs: (id: string) => ['detailSop', 'logs', id] as const,

  // Pelaksana
  pelaksana: ['pelaksana'] as const,
  pelaksanaByOpd: (opdId: string) => ['pelaksana', 'byOpd', opdId] as const,

  // OPD
  opd: ['opd'] as const,
  /** v2: invalidasi cache setelah respons API memakai bungkus { data } konsisten */
  /** GET `/opd` — termasuk query `search` (PJ_EVALUATOR) */
  opdList: (search?: string) => ['opd', 'list', 'v2', search ?? ''] as const,

  /** Manajemen penyusun Biro (GET /api/v1/penyusun — grup per OPD) */
  penyusun: ['penyusun'] as const,
  penyusunGrup: () => ['penyusun', 'grup', 'v1'] as const,
  penyusunRiwayatOpd: (penggunaId: string) =>
    ['penyusun', 'riwayatOpd', penggunaId] as const,

  // Tim Evaluasi
  timEvaluasi: ['timEvaluasi'] as const,
  /** v2: respons bungkus ApiSuccessResponse + CRUD pengguna Evaluator */
  /** GET `/evaluator` — termasuk query `search` */
  timEvaluasiList: (search?: string) =>
    ['timEvaluasi', 'list', 'v3', search ?? ''] as const,

  // Evaluasi
  evaluasi: ['evaluasi'] as const,
  evaluasiList: (params?: { opdId?: string; status?: string; jenis?: string }) => ['evaluasi', 'list', params] as const,
  evaluasiById: (id: string) => ['evaluasi', 'byId', id] as const,
  evaluasiRekap: (tahun?: number) => ['evaluasi', 'rekap', tahun] as const,

  // TTE
  tte: ['tte'] as const,
  tteProfil: ['tte', 'profil'] as const,
  tteRiwayat: ['tte', 'riwayat'] as const,

  /** Komentar SOP (TIM_EVALUASI -> PENYUSUN). */
  sopKomentar: (detailSopId: string) => ['sop', 'komentar', detailSopId] as const,
}
