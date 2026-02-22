/**
 * BPMN diagram rendered with bpmn-js (viewer only).
 * Receives BPMN 2.0 XML and renders it; all relationship and connection
 * logic is handled by bpmn-js. Arrow connector code is not used here.
 */

import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import { useEffect, useRef, useState } from 'react'

type BpmnJS = {
  importXML: (xml: string) => Promise<void>
  destroy: () => void
}

export interface BpmnJsViewerProps {
  /** BPMN 2.0 XML string */
  xml: string
  className?: string
  /** Optional title shown above the diagram (e.g. process name) */
  title?: string
  onError?: (err: Error) => void
}

export function BpmnJsViewer({
  xml,
  className = '',
  title,
  onError,
}: BpmnJsViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<BpmnJS | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !xml) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const init = async () => {
      try {
        const BpmnJSModule = await import('bpmn-js')
        const BpmnJS = BpmnJSModule.default
        const viewer = new BpmnJS({ container }) as BpmnJS
        viewerRef.current = viewer
        if (cancelled) {
          viewer.destroy()
          return
        }
        await viewer.importXML(xml)
        if (cancelled) {
          viewer.destroy()
          return
        }
        setLoading(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        setLoading(false)
        onError?.(err instanceof Error ? err : new Error(message))
      }
    }

    init()
    return () => {
      cancelled = true
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [xml, onError])

  return (
    <div className={`bpmn-js-wrapper flex flex-col ${className}`}>
      {title && (
        <div className="mb-2 text-center">
          <p className="font-bold text-lg">{title}</p>
        </div>
      )}
      <div className="relative min-h-[200px] w-full">
        <div
          ref={containerRef}
          className="bpmn-js-container h-[320px] w-full border border-gray-200 bg-white"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-gray-600">
            Memuat diagram…
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
