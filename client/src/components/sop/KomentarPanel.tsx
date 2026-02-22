import { Check, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'

export interface KomentarItem {
  id: string
  user: string
  role: string
  status: 'open' | 'resolved'
  bagian?: string
  isi: string
  timestamp: string
}

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
  className?: string
}

/**
 * Panel komentar seragam: optional form tambah + list kartu komentar + optional tombol resolve.
 * Dipakai di Tim Penyusun (read-only + resolve), Kepala OPD (tambah + resolve), dll.
 */
export function KomentarPanel({
  comments,
  onResolve,
  addForm,
  summary,
  avatarVariant = 'orange',
  className,
}: KomentarPanelProps) {
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
      <div className="p-3 space-y-2">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-500">Belum ada komentar</p>
        ) : (
          comments.map((komentar) => (
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
              {komentar.bagian ? (
                <Badge className="bg-gray-200 text-gray-700 text-xs border-0 mb-1.5">
                  {komentar.bagian}
                </Badge>
              ) : null}
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
