/**
 * API Services - Unified Export
 * All API services matching server endpoints
 */

// Config
export * from './config'

// Core
export { apiClient, ApiError } from './api'

// Auth & Users
export { authApi } from './auth.api'
export type { LoginRequest, LoginResponse } from './auth.api'

export { usersApi } from './users.api'
export type { User, CreateUserDto, UpdateUserDto, PaginatedResponse } from './users.api'

// Domain Modules
export { opdApi } from './opd.api'
export type { OpdResponse, CreateOpdDto, UpdateOpdDto } from './opd.api'

export { peraturanApi } from './peraturan.api'
export type { PeraturanResponse, CreatePeraturanDto, UpdatePeraturanDto, StatusPeraturan } from './peraturan.api'

export { sopApi } from './sop.api'
export type {
  Sop,
  SopDetail,
  CreateSopRequest,
  UpdateMetadataDto,
  UpdateStatusDto,
  LangkahSOP,
  CreateLangkahSOPDto,
  UpdateLangkahSOPDto,
  Pelaksana,
  CreatePelaksanaDto,
  DetailSOPPelaksana,
  CreateDetailSOPPelaksanaDto,
  LampiranTeks,
  CreateLampiranTeksDto,
  DasarHukum,
  CreateDasarHukumDto,
  SopTerkait,
  CreateSopTerkaitDto,
  LogEditSOP,
  StatusSOP,
  JenisLangkahProsedur,
  SatuanWaktu,
  JenisLampiran,
  BagianSOP,
} from './sop.api'

export { evaluasiApi } from './evaluasi.api'
export type {
  PengajuanEvaluasi,
  NilaiEvaluasi,
  CreatePengajuanEvaluasiDto,
  IsiNilaiEvaluasiDto,
  SelesaiEvaluasiDto,
  RekapEvaluasi,
  JenisPengajuanEvaluasi,
  StatusPengajuanEvaluasi,
  HasilEvaluasi,
} from './evaluasi.api'

export { tteApi } from './tte.api'
export type {
  KredensialTTE,
  RiwayatTandaTangan,
  RegisterTteDto,
  VerifikasiEmailDto,
  TandaTanganiBaDto,
  TandaTanganiSopDto,
  PeranTTE,
} from './tte.api'

export { timPenyusunApi } from './tim-penyusun.api'
export type { AnggotaTimPenyusun, CreateTimPenyusunDto, PindahTimPenyusunDto } from './tim-penyusun.api'

export { timEvaluasiApi } from './tim-evaluasi.api'
export type { AnggotaTimEvaluasi, CreateTimEvaluasiDto, UpdateTimEvaluasiDto } from './tim-evaluasi.api'

export { auditApi } from './audit.api'
export type { LogEditSOP as AuditLog, AuditQueryParams } from './audit.api'
