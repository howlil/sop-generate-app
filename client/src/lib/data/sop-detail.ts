/**
 * Data layer: detail SOP (metadata, prosedur, implementers, versi, komentar).
 * Semua akses JSON untuk detail SOP dikonsolidasikan di sini.
 */
import type {
  ProsedurRow,
  SOPDetailMetadata,
  DetailSOPViewMetadata,
} from '@/lib/types/sop'
import type { KomentarItem } from '@/lib/types/komentar'
import type { VersionSeed, DetailSOPVersionSeed } from '@/lib/types/version'
import sopDetailData from '../seed/sop-detail.json'
import { getPelaksanaList } from '@/lib/data/pelaksana'

interface SopDetailResponse {
  metadata: SOPDetailMetadata
  prosedurRows: ProsedurRow[]
  implementers: { id: string; name: string }[]
  komentarList: KomentarItem[]
  versionList: {
    id: string
    version: string
    revisionType: string
    date: string
    author: string
    changes: string
  }[]
  detailViewMetadata: DetailSOPViewMetadata
  detailVersionList: {
    id: string
    version: string
    date: string
    author: string
    changes: string
    eventLabel?: string
    revisionType?: string
  }[]
  relatedPosOptions: string[]
}

const data = sopDetailData as SopDetailResponse

const SEED_SOP_DETAIL_METADATA: SOPDetailMetadata = data.metadata
const SEED_SOP_DETAIL_PROSEDUR_ROWS: ProsedurRow[] = data.prosedurRows
const SEED_KOMENTAR_LIST: KomentarItem[] = data.komentarList

function getInitialVersions(): VersionSeed[] {
  return data.versionList.map((v) => ({
    id: v.id,
    version: v.version,
    revisionType: v.revisionType as 'major' | 'minor',
    date: v.date,
    author: v.author,
    changes: v.changes,
    snapshot: { metadata: SEED_SOP_DETAIL_METADATA, prosedurRows: SEED_SOP_DETAIL_PROSEDUR_ROWS },
  }))
}

const SEED_DETAIL_SOP_VIEW_METADATA: DetailSOPViewMetadata = data.detailViewMetadata

const SEED_DETAIL_SOP_VERSIONS: DetailSOPVersionSeed[] = data.detailVersionList.map((v, i) => ({
  id: v.id,
  version: v.version,
  date: v.date,
  author: v.author,
  changes: v.changes,
  eventLabel: v.eventLabel,
  revisionType: (v.revisionType as 'major' | 'minor') ?? 'minor',
  snapshot: i === 0 ? { metadata: SEED_DETAIL_SOP_VIEW_METADATA, prosedurRows: SEED_SOP_DETAIL_PROSEDUR_ROWS } : null,
}))

const SEED_RELATED_POS_OPTIONS: string[] = data.relatedPosOptions

/** Metadata detail SOP (tim penyusun) – untuk editor. */
export function getInitialSopDetailMetadata(): SOPDetailMetadata {
  return { ...SEED_SOP_DETAIL_METADATA }
}

/** Baris prosedur detail SOP – untuk diagram / editor. */
export function getInitialSopDetailProsedurRows(): ProsedurRow[] {
  return [...SEED_SOP_DETAIL_PROSEDUR_ROWS]
}

/** Daftar pelaksana (implementers) untuk diagram — dari master Pelaksana SOP (CRUD). */
export function getInitialSopDetailImplementers(): { id: string; name: string }[] {
  return getPelaksanaList().map((p) => ({ id: p.id, name: p.nama }))
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

