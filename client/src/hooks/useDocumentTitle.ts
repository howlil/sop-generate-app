/**
 * useDocumentTitle hook
 * Set document.title for browser tab
 */

import { useEffect } from 'react'

const BASE = 'Sistem Informasi SOP'

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
