import { useState, type ReactNode } from 'react'
import { Check, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { useAppRole } from '@/hooks/useAppRole'
import type { KomentarItem } from '@/types/dto/komentar.dto'
import { useSopEditorOptional } from '@/pages/penyusun/sop/detail/SopEditorContext'

export interface KomentarPanelComposer {
  /** Kontrol kemunculan composer; false untuk hanya read mode. */
  canPost: boolean
  /** Submit komentar baru. Throw -> komponen reset state ke input lama. */
  onSubmit: (isi: string) => Promise<unknown>
  /** Ditampilkan pada saat submit berlangsung. */
  isSubmitting?: boolean
  placeholder?: string
}

export interface KomentarPanelProps {
  /**
   * Sumber komentar override. Default: dari `useSopEditor()` (penyusun panel).
   * Sisi evaluator yang tidak punya editor context bisa pass langsung.
   */
  comments?: KomentarItem[]
  /** Skeleton/loading state saat fetch awal. */
  isLoading?: boolean
  /** Override resolve handler (default: dari context, hanya aktif untuk penyusun). */
  onResolve?: (komentarId: string) => Promise<unknown>
  /** Indikator resolve in-flight. */
  isResolving?: boolean
  /** Composer (textarea + tombol kirim) opsional — peran evaluator saja. */
  composer?: KomentarPanelComposer
  /** Subjudul ringkasan opsional di atas list. */
  summary?: ReactNode
  /** Variasi warna avatar (orange = legacy, blue = penyusun). */
  avatarVariant?: 'orange' | 'blue'
  className?: string
}

function formatDate(iso: string): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function KomentarPanel({
  comments,
  isLoading,
  onResolve,
  isResolving,
  composer,
  summary,
  avatarVariant = 'blue',
  className,
}: KomentarPanelProps) {
  const editor = useSopEditorOptional()
  const { isPenyusun, isPjPenyusun } = useAppRole()
  const canResolveByRole = isPenyusun || isPjPenyusun

  const items: KomentarItem[] =
    comments ?? editor?.komentarList ?? []
  const loading = isLoading ?? editor?.isKomentarLoading ?? false
  const resolveAction = onResolve ?? editor?.resolveKomentar
  const resolving = isResolving ?? editor?.isResolvingKomentar ?? false

  const [draft, setDraft] = useState('')
  const submitting = composer?.isSubmitting ?? false

  const handleSubmit = async () => {
    if (composer === undefined) return
    const trimmed = draft.trim()
    if (trimmed.length === 0) return
    try {
      await composer.onSubmit(trimmed)
      setDraft('')
    } catch {
      /* error toast ditangani oleh mutation hook. */
    }
  }

  const handleResolve = async (komentarId: string) => {
    if (resolveAction === undefined) return
    try {
      await resolveAction(komentarId)
    } catch {
      /* error toast ditangani oleh mutation hook. */
    }
  }

  const sortedItems = [...items].sort((a, b) =>
    (b.createdAt ?? '').localeCompare(a.createdAt ?? '', undefined, { numeric: true }),
  )

  const avatarBg = avatarVariant === 'orange' ? 'bg-orange-600' : 'bg-blue-600'

  return (
    <div className={className ?? ''}>
      {composer !== undefined && composer.canPost && (
        <div className="p-3 border-b border-gray-200 flex-shrink-0">
          <FormField label="Tambah Komentar Baru">
            <Textarea
              className="text-xs min-h-[72px] rounded-md border-gray-200 resize-none"
              placeholder={composer.placeholder ?? 'Tulis komentar Anda untuk SOP ini...'}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={submitting}
            />
          </FormField>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5 w-full mt-2"
            onClick={handleSubmit}
            disabled={submitting || draft.trim().length === 0}
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Mengirim...' : 'Kirim Komentar'}
          </Button>
        </div>
      )}

      {summary !== undefined && summary !== null ? (
        <p className="text-xs text-gray-600 mb-2 px-3 pt-3">{summary}</p>
      ) : null}

      <div className="p-3 space-y-2">
        {loading ? (
          <p className="text-xs text-gray-500">Memuat komentar...</p>
        ) : sortedItems.length === 0 ? (
          <p className="text-xs text-gray-500">Belum ada komentar kolaborasi untuk dokumen ini.</p>
        ) : (
          sortedItems.map((komentar) => {
            const isOpen = komentar.status === 'TERBUKA'
            const userName = komentar.user?.nama ?? komentar.userId ?? 'Tidak diketahui'
            const peran = komentar.user?.peran
            return (
              <div
                key={komentar.id}
                className={`p-2.5 rounded-md border text-xs ${
                  isOpen ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className={`w-5 h-5 ${avatarBg} rounded-full flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-xs text-white font-semibold">
                        {(userName || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{userName}</p>
                      {peran !== undefined && peran !== null && peran.length > 0 && (
                        <p className="text-[10px] text-gray-500 truncate">{peran}</p>
                      )}
                    </div>
                  </div>
                  {isOpen ? (
                    canResolveByRole &&
                    resolveAction !== undefined &&
                    editor?.isReadOnly !== true ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs gap-1 text-blue-700 hover:text-blue-900"
                        onClick={() => handleResolve(komentar.id)}
                        disabled={resolving}
                        title="Klik untuk menandai komentar selesai"
                      >
                        <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0 border-0">
                          Terbuka
                        </Badge>
                        <Check className="w-3 h-3 ml-1" />
                      </Button>
                    ) : (
                      <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0 border-0">
                        Terbuka
                      </Badge>
                    )
                  ) : (
                    <Badge className="bg-green-600 text-white text-xs px-1.5 py-0 border-0 inline-flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Selesai
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-900 whitespace-pre-wrap break-words">
                  {komentar.isi}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[10px] text-gray-500">{formatDate(komentar.createdAt)}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
