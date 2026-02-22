import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
  viewingVersion: VersionHistoryItem | null
  setViewingVersion: (v: VersionHistoryItem | null) => void
  /** 'timeline' = vertikal line + dot (Kepala OPD); 'cards' = flat list (Tim Penyusun) */
  variant?: 'timeline' | 'cards'
  /** Ditampilkan saat viewingVersion ada */
  versionDiff?: VersionDiffItem[]
  /** Jika ada, tampilkan tombol Rollback untuk versi minor (bukan current); parent handle dialog */
  onRollbackRequest?: (version: VersionHistoryItem) => void
  /** Teks di atas list (e.g. "3 versi terdokumentasi") */
  summary?: React.ReactNode
  className?: string
}

/**
 * Panel riwayat versi seragam: list versi + klik untuk lihat + box diff + optional rollback.
 * Dipakai di Tim Penyusun (cards + rollback) dan Kepala OPD (timeline, tanpa rollback).
 */
export function VersionHistoryPanel({
  versions,
  viewingVersion,
  setViewingVersion,
  variant = 'cards',
  versionDiff = [],
  onRollbackRequest,
  summary,
  className,
}: VersionHistoryPanelProps) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

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
                role="button"
                tabIndex={0}
                onClick={() => setViewingVersion(viewingVersion?.id === version.id ? null : version)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && setViewingVersion(viewingVersion?.id === version.id ? null : version)
                }
                className={`rounded-md border p-3 cursor-pointer transition-colors ${
                  viewingVersion?.id === version.id
                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-gray-900">Versi {version.version}</p>
                    {version.eventLabel && (
                      <Badge variant="secondary" className="text-xs border-0">
                        {version.eventLabel}
                      </Badge>
                    )}
                    {version.revisionType && (
                      <Badge
                        variant="secondary"
                        className={`text-xs border-0 ${
                          version.revisionType === 'major'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {version.revisionType === 'major' ? 'Revisi major' : 'Revisi minor'}
                      </Badge>
                    )}
                    {index === 0 && (
                      <Badge className="bg-blue-600 text-white text-xs border-0">Current</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">{formatDate(version.date)}</p>
                </div>
                <p className="text-xs text-gray-700 mb-2">{version.changes}</p>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">{version.author.charAt(0)}</span>
                  </div>
                  <p className="text-xs">{version.author}</p>
                </div>
                {index > 0 && (
                  <p className="text-[11px] text-gray-500 pt-2 mt-2 border-t border-gray-200">
                    Klik card untuk lihat versi & perbedaan
                  </p>
                )}
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          {versions.map((version, index) => (
            <div
              key={version.id}
              role="button"
              tabIndex={0}
              onClick={() => setViewingVersion(viewingVersion?.id === version.id ? null : version)}
              onKeyDown={(e) =>
                e.key === 'Enter' && setViewingVersion(viewingVersion?.id === version.id ? null : version)
              }
              className={`rounded-md border p-3 mb-3 cursor-pointer transition-colors ${
                viewingVersion?.id === version.id
                  ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-semibold text-gray-900">v{version.version}</p>
                  {index === 0 && (
                    <Badge className="bg-blue-600 text-white text-xs border-0">Current</Badge>
                  )}
                  {version.revisionType != null && (
                    <Badge
                      variant="secondary"
                      className={`text-xs border-0 ${
                        version.revisionType === 'major'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {version.revisionType === 'major' ? 'Revisi major' : 'Revisi minor'}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">{formatDate(version.date)}</p>
              </div>
              <p className="text-xs text-gray-700 mb-2">{version.changes}</p>
              <div className="flex items-center justify-between flex-wrap gap-1">
                <p className="text-xs text-gray-600">Author: {version.author}</p>
                <div className="flex items-center gap-1">
                  {version.revisionType === 'minor' &&
                  version.snapshot != null &&
                  index !== 0 &&
                  onRollbackRequest != null ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRollbackRequest(version)
                      }}
                    >
                      <RotateCcw className="w-3 h-3" />
                      Rollback
                    </Button>
                  ) : version.revisionType === 'major' && index !== 0 ? (
                    <span className="text-[11px] text-amber-700">Rollback tidak tersedia</span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {viewingVersion && (
        <>
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 mt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-900">
                Anda melihat: v{viewingVersion.version}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setViewingVersion(null)}
              >
                Tutup
              </Button>
            </div>
            <p className="text-xs text-gray-600">{viewingVersion.changes}</p>
          </div>
          {versionDiff.length > 0 && (
            <div className="rounded-md border border-gray-200 bg-white p-3 mt-2">
              <p className="text-xs font-semibold text-gray-900 mb-2">
                Perbedaan: versi saat ini vs v{viewingVersion.version}
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
          )}
          {versionDiff.length === 0 && viewingVersion.snapshot != null && (
            <p className="text-[11px] text-gray-500 mt-2">
              Tidak ada perbedaan dengan versi saat ini.
            </p>
          )}
        </>
      )}
    </div>
  )
}
