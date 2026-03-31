/**
 * Centralized helpers for SOP status checks per ERD-DESKRIPSI.md and SCHEMA-CONSTRAINTS.md
 * 
 * Status Transition Guard per SCHEMA-CONSTRAINTS.md:
 * DRAFT → SEDANG_DISUSUN
 * SEDANG_DISUSUN → SIAP_DIEVALUASI
 * SIAP_DIEVALUASI → DIAJUKAN_EVALUASI
 * DIAJUKAN_EVALUASI → SEDANG_DIEVALUASI
 * SEDANG_DIEVALUASI → REVISI_DARI_TIM_EVALUASI | SIAP_DIVERIFIKASI
 * REVISI_DARI_TIM_EVALUASI → SEDANG_DISUSUN
 * SIAP_DIVERIFIKASI → DIVERIFIKASI_BIRO_ORGANISASI
 * DIVERIFIKASI_BIRO_ORGANISASI → BERLAKU
 * BERLAKU → DICABUT
 * 
 * BERLAKU dan DICABUT adalah terminal — tidak bisa diubah statusnya kecuali BERLAKU → DICABUT
 */
import type { StatusSOP } from '@/lib/types/sop'
import type { PengajuanEvaluasi } from '@/lib/types/pengajuan-evaluasi'

/** Transisi status yang valid per SCHEMA-CONSTRAINTS.md */
export const VALID_TRANSITIONS: Record<StatusSOP, StatusSOP[]> = {
  DRAFT: ['SEDANG_DISUSUN'],
  SEDANG_DISUSUN: ['SIAP_DIEVALUASI'],
  SIAP_DIEVALUASI: ['DIAJUKAN_EVALUASI'],
  DIAJUKAN_EVALUASI: ['SEDANG_DIEVALUASI'],
  SEDANG_DIEVALUASI: ['REVISI_DARI_TIM_EVALUASI', 'SIAP_DIVERIFIKASI'],
  REVISI_DARI_TIM_EVALUASI: ['SEDANG_DISUSUN'],
  SIAP_DIVERIFIKASI: ['DIVERIFIKASI_BIRO_ORGANISASI'],
  DIVERIFIKASI_BIRO_ORGANISASI: ['BERLAKU'],
  BERLAKU: ['DICABUT'],
  DICABUT: [],
}

/** Validasi transisi status — throw error jika tidak valid */
export function assertValidTransition(current: StatusSOP, next: StatusSOP): void {
  if (!VALID_TRANSITIONS[current].includes(next)) {
    throw new Error(`Transisi status tidak valid: ${current} → ${next}`)
  }
}

/** Cek apakah transisi status valid */
export function isValidTransition(current: StatusSOP, next: StatusSOP): boolean {
  return VALID_TRANSITIONS[current].includes(next)
}

/** Status saat Tim Penyusun boleh mengedit isi SOP (alur: Draft, Sedang Disusun, revisi). */
const EDITABLE_STATUSES: StatusSOP[] = [
  'DRAFT',
  'SEDANG_DISUSUN',
  'REVISI_DARI_TIM_EVALUASI',
]

/** Status saat Kepala OPD boleh mengesahkan SOP (setelah verifikasi BA selesai: Biro + Koordinator). */
const SIGNABLE_STATUSES: StatusSOP[] = ['DIVERIFIKASI_BIRO_ORGANISASI']

/** Status terminal — tidak bisa diubah kecuali BERLAKU → DICABUT */
const TERMINAL_STATUSES: StatusSOP[] = ['BERLAKU', 'DICABUT']

export function canEditSop(status: StatusSOP): boolean {
  return EDITABLE_STATUSES.includes(status)
}

export function isSopEligibleForSigning(status: StatusSOP): boolean {
  return SIGNABLE_STATUSES.includes(status)
}

export function isTerminalStatus(status: StatusSOP): boolean {
  return TERMINAL_STATUSES.includes(status)
}

/**
 * Mencari Pengajuan Evaluasi yang berisi SOP ini untuk OPD tertentu.
 * Digunakan untuk cek apakah BA sudah selesai diverifikasi (Biro + Koordinator) sebelum Kepala OPD mengesahkan SOP.
 */
export function getPengajuanEvaluasiContainingSop(
  pengajuanList: PengajuanEvaluasi[],
  opdId: string,
  sopDetailId: string,
): PengajuanEvaluasi | undefined {
  return pengajuanList.find(
    (p) =>
      p.opdId === opdId &&
      (p.sopList ?? []).some(
        (s) => s.sopDetailId === sopDetailId
      )
  )
}

/**
 * Kepala OPD boleh mengesahkan SOP hanya jika:
 * (1) status SOP = DIVERIFIKASI_BIRO_ORGANISASI
 * (2) bila SOP masuk Pengajuan Evaluasi untuk OPD tersebut, verifikasi BA oleh Koordinator harus sudah selesai.
 */
export function canKepalaOpdSignSop(
  status: StatusSOP,
  pengajuanList: PengajuanEvaluasi[],
  opdId: string,
  sopDetailId: string,
): boolean {
  if (!isSopEligibleForSigning(status)) return false
  // Jika OPD tidak dapat diidentifikasi, tolak signing untuk mencegah bypass pemeriksaan BA.
  if (!opdId) return false
  const pengajuan = getPengajuanEvaluasiContainingSop(pengajuanList, opdId, sopDetailId)
  /** SOP harus masuk alur BA; tanpa pengajuan, pengesahan ditolak (mencegah bypass). */
  if (!pengajuan) return false
  return pengajuan.ditandatanganiOlehKoordinatorUserId !== undefined
}

/**
 * Biro boleh verifikasi BA hanya jika pengajuan selesai, berisi SOP, belum diverifikasi,
 * dan **semua** SOP di pengajuan berstatus SIAP_DIVERIFIKASI.
 */
export function canVerifyBatch(
  item: PengajuanEvaluasi,
  mergedSopRows: { id: string; status: StatusSOP }[]
): boolean {
  const byId = new Map(mergedSopRows.map((r) => [r.id, r.status]))
  const sops = item.sopList ?? []
  const allSiap =
    sops.length > 0 &&
    sops.every((s) => byId.get(s.sopDetailId) === 'SIAP_DIVERIFIKASI')
  return (
    item.status === 'SELESAI_DIEVALUASI' &&
    sops.length > 0 &&
    allSiap &&
    item.ditandatanganiOlehKoordinatorUserId === undefined
  )
}

/** Status SOP setelah Biro menyelesaikan verifikasi Berita Acara (semua SOP di pengajuan dapat status ini). */
export const STATUS_SOP_AFTER_VERIFIKASI_BIRO: StatusSOP = 'DIVERIFIKASI_BIRO_ORGANISASI'

/** Daftar sopDetailId SOP dari pengajuan evaluasi (untuk update status setelah verifikasi BA). */
export function getSopDetailIdsFromPengajuanEvaluasi(pengajuan: PengajuanEvaluasi): string[] {
  return (pengajuan.sopList ?? []).map((s) => s.sopDetailId).filter(Boolean) as string[]
}

export function generateBANumber(verifiedCount: number): string {
  const now = new Date()
  const month = toRomanMonth(now.getMonth() + 1)
  const year = now.getFullYear()
  return `BA/BIRO/${String(verifiedCount + 1).padStart(3, '0')}/${month}/${year}`
}

function toRomanMonth(month: number): string {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  return roman[month - 1] ?? String(month)
}
