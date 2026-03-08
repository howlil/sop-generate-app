/**
 * Seed data untuk Detail SOP (Tim Penyusun): metadata, prosedur, implementers, versi, komentar.
 * Data mentah dari data/sop-detail.json (bentuk = response API). Relasi: implementers id → prosedurRows.pelaksana keys.
 */

import type { ProsedurRow, SOPDetailMetadata, DetailSOPViewMetadata } from '@/lib/types/sop'
import type { KomentarItem } from '@/lib/types/komentar'
import type { VersionSeed, DetailSOPVersionSeed } from '@/lib/types/version'
import sopDetailData from './data/sop-detail.json'

interface SopDetailResponse {
  metadata: SOPDetailMetadata
  prosedurRows: ProsedurRow[]
  implementers: { id: string; name: string }[]
  komentarList: KomentarItem[]
  versionList: { id: string; version: string; revisionType: string; date: string; author: string; changes: string }[]
  detailViewMetadata: DetailSOPViewMetadata
  detailVersionList: { id: string; version: string; date: string; author: string; changes: string; eventLabel?: string; revisionType?: string }[]
  relatedPosOptions: string[]
}

const data = sopDetailData as SopDetailResponse

export const SEED_SOP_DETAIL_METADATA: SOPDetailMetadata = data.metadata
export const SEED_SOP_DETAIL_PROSEDUR_ROWS: ProsedurRow[] = data.prosedurRows
export const SEED_IMPLEMENTERS: { id: string; name: string }[] = data.implementers
export const SEED_KOMENTAR_LIST: KomentarItem[] = data.komentarList

/** Build initial versions dengan snapshot mengacu ke metadata + prosedur (satu sumber). */
export function getInitialVersions(): VersionSeed[] {
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

export const SEED_DETAIL_SOP_VIEW_METADATA: DetailSOPViewMetadata = data.detailViewMetadata

/** Versi untuk view Detail SOP (Kepala OPD): hanya v3 yang punya snapshot, v2/v1 null. */
export const SEED_DETAIL_SOP_VERSIONS: DetailSOPVersionSeed[] = data.detailVersionList.map((v, i) => ({
  id: v.id,
  version: v.version,
  date: v.date,
  author: v.author,
  changes: v.changes,
  eventLabel: v.eventLabel,
  revisionType: (v.revisionType as 'major' | 'minor') ?? 'minor',
  snapshot: i === 0 ? { metadata: SEED_DETAIL_SOP_VIEW_METADATA, prosedurRows: SEED_SOP_DETAIL_PROSEDUR_ROWS } : null,
}))

export const SEED_RELATED_POS_OPTIONS: string[] = data.relatedPosOptions
