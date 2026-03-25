/**
 * Centralized domain helpers for SOP status checks.
 * Eliminates scattered magic strings across pages.
 * Berita Acara: verifikasi = Biro Organisasi lalu Koordinator Tim Penyusun; pengesahan = hanya Kepala OPD (mengesahkan SOP → Berlaku).
 */
import type { StatusSOP } from '@/lib/types/sop'
import type { VerifikasiBatch } from '@/lib/types/verifikasi-batch'

const SIAP_DIVERIFIKASI: StatusSOP = 'Siap Diverifikasi'

/** Status saat Tim Penyusun boleh mengedit isi SOP (alur: Draft, Sedang Disusun, revisi). Sesuai StatusSOP di lib/types/sop. */
const EDITABLE_STATUSES: StatusSOP[] = [
  'Draft',
  'Sedang Disusun',
  'Revisi dari Tim Evaluasi',
]

/** Status saat Kepala OPD boleh mengesahkan SOP (setelah verifikasi BA selesai: Biro + Koordinator). */
const SIGNABLE_STATUSES: StatusSOP[] = ['Diverifikasi Biro Organisasi']

export function canEditSop(status: StatusSOP): boolean {
  return EDITABLE_STATUSES.includes(status)
}

export function isSopEligibleForSigning(status: StatusSOP): boolean {
  return SIGNABLE_STATUSES.includes(status)
}

/**
 * Mencari batch verifikasi yang berisi SOP ini untuk OPD tertentu.
 * Digunakan untuk cek apakah BA sudah selesai diverifikasi (Biro + Koordinator) sebelum Kepala OPD mengesahkan SOP.
 */
export function getVerifikasiBatchContainingSop(
  batchList: VerifikasiBatch[],
  opdName: string,
  sopId: string,
  nomorSOP?: string
): VerifikasiBatch | undefined {
  return batchList.find(
    (p) =>
      p.opd === opdName &&
      (p.sopList ?? []).some(
        (s) => s.id === sopId || (nomorSOP && s.nomor === nomorSOP)
      )
  )
}

/**
 * Kepala OPD boleh mengesahkan SOP hanya jika: (1) status SOP = Diverifikasi Biro, dan
 * (2) bila SOP masuk batch BA untuk OPD tersebut, verifikasi BA oleh Koordinator harus sudah selesai.
 */
export function canKepalaOpdSignSop(
  status: StatusSOP,
  batchList: VerifikasiBatch[],
  opdName: string,
  sopId: string,
  nomorSOP?: string
): boolean {
  if (!isSopEligibleForSigning(status)) return false
  // Jika OPD tidak dapat diidentifikasi, tolak signing untuk mencegah bypass pemeriksaan BA.
  if (!opdName) return false
  const batch = getVerifikasiBatchContainingSop(batchList, opdName, sopId, nomorSOP)
  /** SOP harus masuk alur BA; tanpa batch, pengesahan ditolak (mencegah bypass). */
  if (!batch) return false
  return batch.isSignedByKoordinator === true
}

/**
 * Biro boleh verifikasi BA hanya jika batch selesai, berisi SOP, belum diverifikasi,
 * dan **semua** SOP di batch berstatus Siap Diverifikasi (sesuai status gabungan di daftar SOP).
 */
export function canVerifyBatch(
  item: VerifikasiBatch,
  mergedSopRows: { id: string; status: StatusSOP }[]
): boolean {
  const byId = new Map(mergedSopRows.map((r) => [r.id, r.status]))
  const sops = item.sopList ?? []
  const allSiap =
    sops.length > 0 &&
    sops.every((s) => byId.get(s.id) === SIAP_DIVERIFIKASI)
  return (
    item.status === 'Selesai' &&
    sops.length > 0 &&
    allSiap &&
    !item.isVerified
  )
}

/** Status SOP setelah Biro menyelesaikan verifikasi Berita Acara (semua SOP di batch dapat status ini). */
export const STATUS_SOP_AFTER_VERIFIKASI_BIRO: StatusSOP = 'Diverifikasi Biro Organisasi'

/** Daftar id SOP dari batch verifikasi (untuk update status setelah verifikasi BA). */
export function getSopIdsFromVerifikasiBatch(batch: VerifikasiBatch): string[] {
  return (batch.sopList ?? []).map((s) => s.id).filter(Boolean) as string[]
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
