import { useEffect } from 'react'

const BASE = 'Sistem Informasi SOP'

/**
 * Mengatur document.title untuk tab browser (bookmark / screen reader).
 */
export function useDocumentTitle(pageTitle: string | undefined) {
  useEffect(() => {
    if (!pageTitle?.trim()) {
      document.title = BASE
      return
    }
    document.title = `${pageTitle.trim()} · ${BASE}`
    return () => {
      document.title = BASE
    }
  }, [pageTitle])
}
