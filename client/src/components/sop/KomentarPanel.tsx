import { useMemo } from 'react'
import { Check, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import type { KomentarItem } from '@/types/dto/komentar.dto'

export type { KomentarItem } from '@/types/dto/komentar.dto'

/** Display-only comment item (used by penyusun panel) */
export interface KomentarDisplayItem {
  id: string
  userName: string
  role?: string
  text: string
  timestamp: string
}

/** Union type for both comment formats */
export type CommentItem = KomentarItem | KomentarDisplayItem

/** Check if comment is KomentarItem (has 'isi' and 'status' fields) */
function isKomentarItem(comment: CommentItem): comment is KomentarItem {
  return 'isi' in comment && 'status' in comment
}

export interface KomentarPanelProps {
  /** Daftar komentar (urutan bebas; filter/sort di pemanggil jika perlu) */
  comments: CommentItem[]
  /** Jika ada: tampilkan tombol Selesai untuk komentar terbuka */
  onResolve?: (commentId: string) => void
  /** Jika ada: tampilkan form tambah komentar di atas list */
  addForm?: {
    value: string
    onChange: (value: string) => void
    onSubmit: () => void
    submitLabel?: string
    placeholder?: string
  }
  /** Teks ringkasan di atas list (mis. "Dari Kepala OPD & Tim Evaluasi · 2 terbuka · 1 selesai") */
  summary?: React.ReactNode
  /** Warna avatar: default orange (kepala OPD style); "blue" untuk tim penyusun panel */
  avatarVariant?: 'orange' | 'blue'
  className?: string
}

/**
 * Panel komentar seragam: optional form tambah + list kartu komentar + optional tombol resolve.
 * Dipakai di Tim Penyusun (read-only + resolve), Tim Evaluasi, dll.
 */
export function KomentarPanel({
  comments,
  onResolve,
  addForm,
  summary,
  avatarVariant = 'orange',
  className,
}: KomentarPanelProps) {
  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      const dateA = 'createdAt' in a ? a.createdAt : a.timestamp
      const dateB = 'createdAt' in b ? b.createdAt : b.timestamp
      const cmp = (dateA || '').localeCompare(dateB || '', undefined, { numeric: true })
      return -cmp
    })
  }, [comments])

  const avatarBg = avatarVariant === 'blue' ? 'bg-blue-600' : 'bg-orange-600'
  const resolveLabel = 'Selesai'

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
      <div className="p-3 space-y-2">
        {sortedComments.length === 0 ? (
          <p className="text-xs text-gray-500">Belum ada komentar</p>
        ) : (
          sortedComments.map((komentar) => {
            if (isKomentarItem(komentar)) {
              // Full KomentarItem with status tracking
              return (
                <div
                  key={komentar.id}
                  className={`p-2.5 rounded-md border text-xs ${
                    komentar.status === 'SELESAI'
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-5 h-5 ${avatarBg} rounded-full flex items-center justify-center`}>
                        <span className="text-xs text-white font-semibold">
                          {(komentar.userName ?? 'U').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{komentar.userName ?? 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {komentar.status === 'TERBUKA' ? (
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
                            Terbuka
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
                    <p className="text-xs text-gray-500">{komentar.createdAt}</p>
                  </div>
                </div>
              )
            }

            // Display-only comment (from audit logs)
            return (
              <div
                key={komentar.id}
                className="p-2.5 rounded-md border text-xs bg-gray-50 border-gray-200"
              >
                <div className="flex items-start gap-1.5">
                  <div className={`w-5 h-5 ${avatarBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xs text-white font-semibold">
                      {(komentar.userName ?? 'U').charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-900">{komentar.userName ?? 'Unknown'}</p>
                      <p className="text-xs text-gray-500 flex-shrink-0">{komentar.timestamp}</p>
                    </div>
                    {komentar.role && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{komentar.role}</p>
                    )}
                    <p className="text-xs text-gray-900 mt-1">{komentar.text}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
