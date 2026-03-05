/**
 * Data layer: detail SOP (metadata, prosedur, implementers, versi, komentar).
 * Semua akses seed untuk detail SOP dikonsolidasikan di sini.
 */
import type {
  ProsedurRow,
  SOPDetailMetadata,
  DetailSOPViewMetadata,
} from '@/lib/types/sop'
import type { KomentarItem } from '@/lib/types/komentar'
import type { VersionSeed, DetailSOPVersionSeed } from '@/lib/types/version'
import {
  SEED_SOP_DETAIL_METADATA,
  SEED_SOP_DETAIL_PROSEDUR_ROWS,
  SEED_IMPLEMENTERS,
  SEED_KOMENTAR_LIST,
  getInitialVersions,
  SEED_DETAIL_SOP_VIEW_METADATA,
  SEED_DETAIL_SOP_VERSIONS,
  SEED_RELATED_POS_OPTIONS,
  SEED_DETAIL_SOP_CURRENT_USER,
  SEED_DETAIL_SOP_KOMENTAR_INITIAL,
} from '@/lib/seed/sop-detail-seed'

/** Metadata detail SOP (tim penyusun) – untuk editor. */
export function getInitialSopDetailMetadata(): SOPDetailMetadata {
  return { ...SEED_SOP_DETAIL_METADATA }
}

/** Baris prosedur detail SOP – untuk diagram / editor. */
export function getInitialSopDetailProsedurRows(): ProsedurRow[] {
  return [...SEED_SOP_DETAIL_PROSEDUR_ROWS]
}

/** Daftar pelaksana (implementers) untuk diagram. */
export function getInitialSopDetailImplementers(): { id: string; name: string }[] {
  return [...SEED_IMPLEMENTERS]
}

/** Komentar seed untuk editor detail SOP (tim penyusun). */
export function getInitialSopDetailKomentar(): KomentarItem[] {
  return [...SEED_KOMENTAR_LIST]
}

/** Riwayat versi untuk editor detail SOP (tim penyusun). */
export function getInitialSopDetailVersions(): VersionSeed[] {
  return getInitialVersions()
}

/** Metadata view detail SOP (kepala OPD). */
export function getSopViewMetadata(): DetailSOPViewMetadata {
  return { ...SEED_DETAIL_SOP_VIEW_METADATA }
}

/** Riwayat versi view detail SOP (kepala OPD). */
export function getSopViewVersions(): DetailSOPVersionSeed[] {
  return [...SEED_DETAIL_SOP_VERSIONS]
}

/** Opsi POS terkait untuk metadata SOP. */
export function getRelatedPosOptions(): string[] {
  return [...SEED_RELATED_POS_OPTIONS]
}

/** User saat ini untuk komentar di halaman Detail SOP (kepala OPD). */
export function getDetailSopCurrentUser() {
  return { ...SEED_DETAIL_SOP_CURRENT_USER }
}

/** Komentar awal untuk halaman Detail SOP (kepala OPD). */
export function getDetailSopKomentarInitial(): KomentarItem[] {
  return [...SEED_DETAIL_SOP_KOMENTAR_INITIAL]
}

