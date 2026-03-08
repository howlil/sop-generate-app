import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

  const cardContent = (version: VersionHistoryItem) => (
    <>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <Badge variant="secondary" className="text-xs font-medium shrink-0 bg-blue-100 text-blue-700 border-0">
            v{version.version}
          </Badge>
          {version.revisionType && (
            <span className="text-[11px] text-gray-500 capitalize">{version.revisionType}</span>
          )}
        </div>
        <time className="text-xs text-gray-500 shrink-0" dateTime={version.date}>
          {formatDate(version.date)}
        </time>
      </div>
      <p className="text-xs text-gray-700 leading-relaxed mb-2 line-clamp-2">{version.changes}</p>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-gray-600 truncate" title={version.author}>
          <span className="text-gray-500 font-medium">Oleh:</span> {version.author}
        </p>
        {setViewingVersion && version.snapshot != null && (
          <span className="text-[11px] text-blue-600 font-medium shrink-0">
            Bandingkan
          </span>
        )}
      </div>
    </>
  )

  const cardBaseClass = 'rounded-lg border p-4 transition-colors'
  const cardSelectedClass = 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
  const cardDefaultClass = 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
  const cardClickableClass = setViewingVersion ? 'cursor-pointer' : ''

  return (
    <div className={`p-4 space-y-3 ${className ?? ''}`}>
      {summary != null && (
        <p className="text-xs font-medium text-gray-600 mb-2">{summary}</p>
      )}
      {variant === 'timeline' ? (
        <div className="space-y-0">
          {versions.map((version, index) => (
            <div key={version.id} className="relative pl-6">
              {index < versions.length - 1 && (
                <div className="absolute left-2 top-8 bottom-0 w-px bg-gray-200" />
              )}
              <div
                className={`absolute left-0 top-2 w-3 h-3 rounded-full border-2 ${
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
                className={`${cardBaseClass} ${
                  viewingVersion?.id === version.id ? cardSelectedClass : cardDefaultClass
                } ${cardClickableClass} mb-3`}
              >
                {cardContent(version)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
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
              className={`${cardBaseClass} ${
                viewingVersion?.id === version.id ? cardSelectedClass : cardDefaultClass
              } ${cardClickableClass}`}
            >
              {cardContent(version)}
            </div>
          ))}
        </div>
      )}

      {isViewing && viewingVersion && (
        <div className="space-y-3 mt-4 pt-3 border-t border-gray-200">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-semibold text-gray-900">
                Melihat: Versi {viewingVersion.version} <span className="text-gray-500 font-normal">(read-only)</span>
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs shrink-0 text-gray-600 hover:text-gray-900"
                onClick={() => setViewingVersion(null)}
              >
                Tutup
              </Button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{viewingVersion.changes}</p>
          </div>
          {versionDiff.length > 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-gray-900 mb-3">
                Perbedaan: versi saat ini vs v{viewingVersion.version}
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {versionDiff.map((d, i) => (
                  <div
                    key={i}
                    className="text-[11px] border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                  >
                    <p className="font-medium text-gray-700 mb-0.5">{d.label}</p>
                    <p className="text-gray-600 pl-0.5">
                      <span className="text-green-700 font-medium">Saat ini:</span> {d.current || '(kosong)'}
                    </p>
                    <p className="text-gray-600 pl-0.5">
                      <span className="text-amber-700 font-medium">v{viewingVersion.version}:</span>{' '}
                      {d.viewed || '(kosong)'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              Tidak ada perbedaan dengan versi saat ini.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
