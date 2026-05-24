import { useEffect } from 'react'
import { isSopDiagramRootReady } from '@/lib/print/sop-browser-print'
import { SOP_DIAGRAM_PRINT_READY_EVENT } from '@/lib/print/sop-print-events'

const MAX_READY_ATTEMPTS = 80

/** Laporkan ke orkestrator cetak saat path connector pada root diagram sudah ter-render. */
export function useSopDiagramPrintReadyDispatch(
  rootId: string,
  canCheck: boolean,
  connectionCount: number,
  rerouteToken: number,
): void {
  useEffect(() => {
    if (!canCheck) return
    let cancelled = false
    let attempts = 0
    const tryDispatch = () => {
      if (cancelled) return
      const root = document.getElementById(rootId)
      if (root == null) {
        if (attempts < MAX_READY_ATTEMPTS) {
          attempts += 1
          requestAnimationFrame(tryDispatch)
        }
        return
      }
      if (connectionCount === 0 || isSopDiagramRootReady(root)) {
        window.dispatchEvent(new Event(SOP_DIAGRAM_PRINT_READY_EVENT))
        return
      }
      if (attempts < MAX_READY_ATTEMPTS) {
        attempts += 1
        requestAnimationFrame(tryDispatch)
      }
    }
    requestAnimationFrame(tryDispatch)
    return () => {
      cancelled = true
    }
  }, [rootId, canCheck, connectionCount, rerouteToken])
}
