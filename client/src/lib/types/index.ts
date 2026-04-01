/**
 * Stubs for backward compatibility
 */

// Types - re-export from new types/
export type { Opd } from '@/types/opd'
export type { Peraturan, StatusPeraturan, CreatePeraturanRequest, UpdatePeraturanRequest } from '@/types/peraturan'
export type { Sop, SopDetail, StatusSOP, CreateSopRequest } from '@/types/sop'
export type { AnggotaTimPenyusun, AnggotaTimEvaluasi, StatusAnggota, CreateTimPenyusunRequest, CreateTimEvaluasiRequest } from '@/types/tim'
export type { TTERole, TTESignature, TTESignaturePayload } from '@/types/tte'
export type { AuditEntry } from '@/types/audit'
export type { Komentar, StatusKomentar } from '@/types/komentar'
export type { PengajuanEvaluasi, JenisPengajuanEvaluasi, StatusPengajuanEvaluasi } from '@/types/pengajuan-evaluasi'
export type { DiagramNode, DiagramEdge, DiagramType, LangkahType } from '@/types/diagram'

// Legacy type exports (aliases)
export type { Opd as OPD } from '@/types/opd'
export type { Sop as SOPDaftarItem } from '@/types/sop'
export type { SopDetail as DetailSOPVersionSeed } from '@/types/sop'
