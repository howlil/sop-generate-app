/**
 * Computes the diff between current SOP metadata/prosedur and a viewed version snapshot.
 */
import type { ProsedurRow } from '@/lib/types/sop'

export interface VersionDiffItem {
  label: string
  current: string
  viewed: string
}

interface MetadataLike {
  name?: string
  number?: string
  version?: number | string
}

interface SnapshotLike {
  metadata?: MetadataLike | null
  prosedurRows?: ProsedurRow[] | null
}

export function computeVersionDiff(
  currentMetadata: MetadataLike,
  currentRows: ProsedurRow[],
  snapshot: SnapshotLike | null | undefined
): VersionDiffItem[] {
  if (!snapshot) return []

  const view = snapshot
  const out: VersionDiffItem[] = []

  if (String(currentMetadata.name ?? '') !== String(view.metadata?.name ?? '')) {
    out.push({ label: 'Nama SOP', current: String(currentMetadata.name ?? ''), viewed: String(view.metadata?.name ?? '') })
  }
  if (String(currentMetadata.number ?? '') !== String(view.metadata?.number ?? '')) {
    out.push({ label: 'Nomor SOP', current: String(currentMetadata.number ?? ''), viewed: String(view.metadata?.number ?? '') })
  }
  if (Number(currentMetadata.version) !== Number(view.metadata?.version)) {
    out.push({ label: 'Versi', current: String(currentMetadata.version ?? ''), viewed: String(view.metadata?.version ?? '') })
  }

  const viewRows = view.prosedurRows ?? []
  if (currentRows.length !== viewRows.length) {
    out.push({ label: 'Jumlah langkah', current: String(currentRows.length), viewed: String(viewRows.length) })
  }

  const maxRows = Math.max(currentRows.length, viewRows.length)
  for (let i = 0; i < maxRows; i++) {
    const rCur = currentRows[i]
    const rView = viewRows[i]
    const prefix = `Langkah ${i + 1}`
    if (!rView) {
      out.push({ label: prefix, current: rCur?.kegiatan ?? '-', viewed: '(dihapus)' })
      continue
    }
    if (!rCur) {
      out.push({ label: prefix, current: '(ditambahkan)', viewed: rView.kegiatan ?? '-' })
      continue
    }
    if (String(rCur.kegiatan ?? '') !== String(rView.kegiatan ?? '')) {
      out.push({ label: `${prefix} — Kegiatan`, current: String(rCur.kegiatan ?? ''), viewed: String(rView.kegiatan ?? '') })
    }
    if (String(rCur.mutu_waktu ?? '') !== String(rView.mutu_waktu ?? '')) {
      out.push({ label: `${prefix} — Waktu`, current: String(rCur.mutu_waktu ?? ''), viewed: String(rView.mutu_waktu ?? '') })
    }
  }

  return out
}
