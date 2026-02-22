import { useMemo, useState } from 'react'
import { Check, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import type { KomentarItem } from '@/lib/types/komentar'

export type { KomentarItem } from '@/lib/types/komentar'

export interface KomentarPanelProps {
  /** Daftar komentar (urutan bebas; filter/sort di pemanggil jika perlu) */
  comments: KomentarItem[]
  /** Jika ada: tampilkan tombol Selesai/Resolve untuk komentar open */
  onResolve?: (commentId: string) => void
  /** Jika ada: tampilkan form tambah komentar di atas list */
  addForm?: {
    value: string
    onChange: (value: string) => void
    onSubmit: () => void
    submitLabel?: string
    placeholder?: string
  }
  /** Teks ringkasan di atas list (e.g. "Dari Kepala OPD & Tim Evaluasi · 2 terbuka · 1 resolved") */
  summary?: React.ReactNode
  /** Warna avatar: default orange (kepala OPD style); "blue" untuk tim penyusun panel */
  avatarVariant?: 'orange' | 'blue'
  /** Tampilkan filter Asal/Status/Urutan (hanya di panel Tim Penyusun; Kepala OPD tanpa filter) */
  showFilters?: boolean
  className?: string
}

/**
 * Panel komentar seragam: optional form tambah + list kartu komentar + optional tombol resolve.
 * Dipakai di Tim Penyusun (read-only + resolve), Kepala OPD (tambah + resolve), dll.
 */
const FILTER_ORIGIN_OPTIONS = [
  { value: 'all', label: 'Semua asal' },
  { value: 'Kepala OPD', label: 'Kepala OPD' },
  { value: 'Tim Evaluasi', label: 'Tim Evaluasi' },
]

const FILTER_STATUS_OPTIONS = [
  { value: 'all', label: 'Semua status' },
  { value: 'open', label: 'Terbuka' },
  { value: 'resolved', label: 'Resolved' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
]

export function KomentarPanel({
  comments,
  onResolve,
  addForm,
  summary,
  avatarVariant = 'orange',
  showFilters = true,
  className,
}: KomentarPanelProps) {
  const [filterOrigin, setFilterOrigin] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<string>('newest')

  const filteredAndSortedComments = useMemo(() => {
    let list = comments.filter((c) => {
      if (filterOrigin !== 'all' && c.role !== filterOrigin) return false
      if (filterStatus !== 'all' && c.status !== filterStatus) return false
      return true
    })
    list = [...list].sort((a, b) => {
      const cmp = (a.timestamp || '').localeCompare(b.timestamp || '', undefined, { numeric: true })
      return sortOrder === 'newest' ? -cmp : cmp
    })
    return list
  }, [comments, filterOrigin, filterStatus, sortOrder])

  const avatarBg = avatarVariant === 'blue' ? 'bg-blue-600' : 'bg-orange-600'
  const resolveLabel = avatarVariant === 'blue' ? 'Resolve' : 'Selesai'

  return (
    <div className={className ?? ''}>
      {addForm != null && (
        <div className="p-3 border-b border-gray-200 flex-shrink-0">
          <FormField label="Tambah Komentar Baru">
            <Textarea
              className="text-xs min-h-[72px] rounded-md border-gray-200 resize-none"
              placeholder={addForm.placeholder ?? 'Tulis komentar Anda...'}
              value={addForm.value}
              onChange={(e) => addForm.onChange(e.target.value)}
            />
          </FormField>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5 w-full mt-2"
            onClick={addForm.onSubmit}
            disabled={!addForm.value.trim()}
          >
            <Send className="w-3.5 h-3.5" />
            {addForm.submitLabel ?? 'Kirim Komentar'}
          </Button>
        </div>
      )}
      {summary != null && (
        <p className="text-xs text-gray-600 mb-2 px-3 pt-3">{summary}</p>
      )}
      {showFilters && comments.length > 0 && (
        <div className="px-3 pb-2 space-y-2 border-b border-gray-100">
          <div className="grid grid-cols-3 gap-1.5">
            <FormField label="Asal" variant="muted">
              <Select
                value={filterOrigin}
                onValueChange={setFilterOrigin}
                options={FILTER_ORIGIN_OPTIONS}
                className="h-8 text-xs"
              />
            </FormField>
            <FormField label="Status" variant="muted">
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
                options={FILTER_STATUS_OPTIONS}
                className="h-8 text-xs"
              />
            </FormField>
            <FormField label="Urutan" variant="muted">
              <Select
                value={sortOrder}
                onValueChange={setSortOrder}
                options={SORT_OPTIONS}
                className="h-8 text-xs"
              />
            </FormField>
          </div>
        </div>
      )}
      <div className="p-3 space-y-2">
        {filteredAndSortedComments.length === 0 ? (
          <p className="text-xs text-gray-500">
            {comments.length === 0 ? 'Belum ada komentar' : 'Tidak ada komentar yang sesuai filter'}
          </p>
        ) : (
          filteredAndSortedComments.map((komentar) => (
            <div
              key={komentar.id}
              className={`p-2.5 rounded-md border text-xs ${
                komentar.status === 'resolved'
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 ${avatarBg} rounded-full flex items-center justify-center`}>
                    <span className="text-xs text-white font-semibold">
                      {komentar.user.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{komentar.user}</p>
                    <p className="text-xs text-gray-500">{komentar.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {komentar.status === 'open' ? (
                    <>
                      {onResolve != null && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs gap-1"
                          onClick={() => onResolve(komentar.id)}
                        >
                          <Check className="w-3 h-3" />
                          {resolveLabel}
                        </Button>
                      )}
                      <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0 border-0">
                        Open
                      </Badge>
                    </>
                  ) : (
                    <Badge className="bg-green-600 text-white text-xs px-1.5 py-0 border-0">
                      <Check className="w-3 h-3" />
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-900 mb-2">{komentar.isi}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{komentar.timestamp}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
