import { Button } from '@/components/ui/button'
import { formatDateIdLong } from '@/utils/format-date'

export interface VersionHistoryItem {
  id: string
  version: string
  date: string
  author: string
  changes: string
  eventLabel?: string
  revisionType?: 'major' | 'minor'
  snapshot?: unknown
}

export interface VersionDiffItem {
  label: string
  current: string
  viewed: string
}

export interface VersionHistoryPanelProps {
  versions: VersionHistoryItem[]
  /** Teks di atas list (e.g. "3 versi terdokumentasi") */
  summary?: React.ReactNode
  className?: string
  /** 'timeline' = vertikal line + dot; 'cards' = flat list */
  variant?: 'timeline' | 'cards'
  /** Versi yang sedang dilihat (klik card); null = tidak melihat versi lama. Data read-only. */
  viewingVersion?: VersionHistoryItem | null
  setViewingVersion?: (v: VersionHistoryItem | null) => void
  /** Perbedaan versi saat ini vs viewingVersion (jika ada) */
  versionDiff?: VersionDiffItem[]
}

/**
 * Panel riwayat versi: daftar versi (bisa diklik untuk lihat), tampil perbedaan dengan versi saat ini (read-only, tidak bisa diubah).
 */
export function VersionHistoryPanel({
  versions,
  summary,
  className,
  variant = 'cards',
  viewingVersion = null,
  setViewingVersion,
  versionDiff = [],
}: VersionHistoryPanelProps) {
  const formatDate = (date: string) => formatDateIdLong(date)
  const isViewing = viewingVersion != null && setViewingVersion != null

  const cardContent = (version: VersionHistoryItem, index: number) => (
    <>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-semibold text-gray-900">Versi {version.version}</p>
        <p className="text-xs text-gray-500">{formatDate(version.date)}</p>
      </div>
      <p className="text-xs text-gray-700 mb-2">{version.changes}</p>
      <p className="text-xs text-gray-600">Author: {version.author}</p>
      {setViewingVersion && version.snapshot != null && (
        <p className="text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-100">
          Klik untuk bandingkan dengan versi saat ini
        </p>
      )}
    </>
  )

  return (
    <div className={`p-3 space-y-3 ${className ?? ''}`}>
      {summary != null && <p className="text-xs text-gray-600 mb-3">{summary}</p>}
      {variant === 'timeline' ? (
        <>
          {versions.map((version, index) => (
            <div key={version.id} className="relative pl-6">
              {index < versions.length - 1 && (
                <div className="absolute left-2 top-6 bottom-0 w-px bg-gray-200" />
              )}
              <div
                className={`absolute left-0 top-1 w-4 h-4 rounded-full border ${
                  index === 0 ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                }`}
              />
              <div
                role={setViewingVersion && version.snapshot != null ? 'button' : undefined}
                tabIndex={setViewingVersion && version.snapshot != null ? 0 : undefined}
                onClick={() =>
                  setViewingVersion && version.snapshot != null
                    ? setViewingVersion(viewingVersion?.id === version.id ? null : version)
                    : undefined
                }
                onKeyDown={(e) =>
                  setViewingVersion &&
                  version.snapshot != null &&
                  e.key === 'Enter' &&
                  setViewingVersion(viewingVersion?.id === version.id ? null : version)
                }
                className={`rounded-md border p-3 ${
                  viewingVersion?.id === version.id
                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                    : 'bg-gray-50 border-gray-200'
                } ${setViewingVersion && version.snapshot != null ? 'cursor-pointer hover:bg-gray-100' : ''}`}
              >
                {cardContent(version, index)}
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          {versions.map((version, index) => (
            <div
              key={version.id}
              role={setViewingVersion && version.snapshot != null ? 'button' : undefined}
              tabIndex={setViewingVersion && version.snapshot != null ? 0 : undefined}
              onClick={() =>
                setViewingVersion && version.snapshot != null
                  ? setViewingVersion(viewingVersion?.id === version.id ? null : version)
                  : undefined
              }
              onKeyDown={(e) =>
                setViewingVersion &&
                version.snapshot != null &&
                e.key === 'Enter' &&
                setViewingVersion(viewingVersion?.id === version.id ? null : version)
              }
              className={`rounded-md border p-3 mb-3 ${
                viewingVersion?.id === version.id
                  ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                  : 'bg-gray-50 border-gray-200'
              } ${setViewingVersion && version.snapshot != null ? 'cursor-pointer hover:bg-gray-100' : ''}`}
            >
              {cardContent(version, index)}
            </div>
          ))}
        </>
      )}

      {isViewing && viewingVersion && (
        <>
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 mt-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-semibold text-gray-900">
                Anda melihat: Versi {viewingVersion.version} (hanya lihat, tidak bisa diubah)
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs shrink-0"
                onClick={() => setViewingVersion(null)}
              >
                Tutup
              </Button>
            </div>
            <p className="text-xs text-gray-600">{viewingVersion.changes}</p>
          </div>
          {versionDiff.length > 0 ? (
            <div className="rounded-md border border-gray-200 bg-white p-3 mt-2">
              <p className="text-xs font-semibold text-gray-900 mb-2">
                Perbedaan: versi saat ini vs Versi {viewingVersion.version}
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {versionDiff.map((d, i) => (
                  <div
                    key={i}
                    className="text-[11px] border-b border-gray-100 pb-1.5 last:border-0"
                  >
                    <p className="font-medium text-gray-700">{d.label}</p>
                    <p className="text-gray-600">
                      <span className="text-green-700">Saat ini:</span> {d.current || '(kosong)'}
                    </p>
                    <p className="text-gray-600">
                      <span className="text-amber-700">v{viewingVersion.version}:</span>{' '}
                      {d.viewed || '(kosong)'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-gray-500 mt-2 px-1">
              Tidak ada perbedaan dengan versi saat ini.
            </p>
          )}
        </>
      )}
    </div>
  )
}
