import { Loader2 } from 'lucide-react'
import {
  BeritaAcaraTemplate,
  type BeritaAcaraTemplateProps,
} from '@/components/pengajuan/berita-acara-template'

export interface BeritaAcaraPreviewPaneProps {
  isLoading: boolean
  templateProps: BeritaAcaraTemplateProps
  loadingMessage?: string
}

export function BeritaAcaraPreviewPane({
  isLoading,
  templateProps,
  loadingMessage = 'Memuat Berita Acara...',
}: BeritaAcaraPreviewPaneProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-500 text-sm">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
        {loadingMessage}
      </div>
    )
  }
  return (
    <div className="flex w-full justify-center">
      <BeritaAcaraTemplate {...templateProps} forPrint />
    </div>
  )
}
