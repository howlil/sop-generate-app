import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { toPng } from 'html-to-image'
import type { PenyusunWorkbenchDiagramKonfigurasi } from '@/types/dto/sop.dto'
import type { ProsedurRow } from '@/types/ui/sop'
import { SopDiagramExportHost } from '@/lib/print/sop-diagram-export-host'
import { waitForSopDiagramPrintReady } from '@/lib/print/sop-browser-print'

export interface DiagramPageSnapshot {
  kind: 'flowchart' | 'bpmn'
  pageIndex: number
  dataUrl: string
  width: number
  height: number
}

export interface SopDiagramExportInput {
  name?: string
  prosedurRows: ProsedurRow[]
  implementers: { id: string; name: string }[]
  diagramKonfigurasi?: PenyusunWorkbenchDiagramKonfigurasi
}

export type DiagramSnapshotKind = DiagramPageSnapshot['kind']

const EXPORT_ROOT_STYLE =
  'position:fixed;left:-16000px;top:0;width:297mm;background:#fff;pointer-events:none;z-index:-1;'

const snapshotCache = new Map<string, DiagramPageSnapshot[]>()

function waitForPrintPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

function buildCacheKey(input: SopDiagramExportInput): string {
  return JSON.stringify({
    name: input.name,
    rows: input.prosedurRows,
    implementers: input.implementers,
    diagramKonfigurasi: input.diagramKonfigurasi,
  })
}

/** Kunci cache ekspor diagram (untuk tes & debugging). */
export function buildSopDiagramExportCacheKey(input: SopDiagramExportInput): string {
  return buildCacheKey(input)
}

async function exportPrintPageElement(
  element: HTMLElement,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const width = Math.max(Math.ceil(element.scrollWidth), Math.ceil(element.offsetWidth))
  const height = Math.max(Math.ceil(element.scrollHeight), Math.ceil(element.offsetHeight))
  if (width <= 0 || height <= 0) {
    throw new Error('Ukuran halaman diagram tidak valid untuk diekspor')
  }
  const dataUrl = await toPng(element, {
    width,
    height,
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#ffffff',
  })
  return { dataUrl, width, height }
}

async function exportPagesFromHost(
  root: ParentNode,
  hostSelector: string,
  kind: DiagramPageSnapshot['kind'],
): Promise<DiagramPageSnapshot[]> {
  const pages = root.querySelectorAll(`${hostSelector} .print-page`)
  const snapshots: DiagramPageSnapshot[] = []
  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index]
    if (!(page instanceof HTMLElement)) {
      continue
    }
    const { dataUrl, width, height } = await exportPrintPageElement(page)
    snapshots.push({ kind, pageIndex: index, dataUrl, width, height })
  }
  return snapshots
}

/** Ekspor halaman flowchart + BPMN ke PNG untuk embed PDF. */
export async function exportSopDiagramSnapshots(
  input: SopDiagramExportInput,
  options: { useCache?: boolean; timeoutMs?: number; requiredKinds?: DiagramSnapshotKind[] } = {},
): Promise<DiagramPageSnapshot[]> {
  const useCache = options.useCache ?? true
  const requiredKinds = options.requiredKinds ?? []
  const hasRequiredKinds = (snapshots: DiagramPageSnapshot[]) =>
    requiredKinds.every((kind) => snapshots.some((snapshot) => snapshot.kind === kind))
  const cacheKey = buildCacheKey(input)
  if (useCache) {
    const cached = snapshotCache.get(cacheKey)
    if (cached != null && cached.length > 0 && hasRequiredKinds(cached)) {
      return cached
    }
  }
  const container = document.createElement('div')
  container.setAttribute('data-sop-diagram-export-container', '')
  container.style.cssText = EXPORT_ROOT_STYLE
  document.body.appendChild(container)
  const root = createRoot(container)
  try {
    flushSync(() => {
      root.render(<SopDiagramExportHost input={input} />)
    })
    await waitForPrintPaint()
    const ready = await waitForSopDiagramPrintReady({
      scope: container,
      timeoutMs: options.timeoutMs ?? 8000,
    })
    if (!ready) {
      throw new Error('Diagram belum siap untuk diekspor')
    }
    await waitForPrintPaint()
    const flowchartSnapshots = await exportPagesFromHost(
      container,
      '.sop-print-diagram-flowchart',
      'flowchart',
    )
    const bpmnSnapshots = await exportPagesFromHost(
      container,
      '.sop-print-diagram-bpmn',
      'bpmn',
    )
    const exported = [...flowchartSnapshots, ...bpmnSnapshots]
    if (exported.length === 0) {
      throw new Error('Tidak ada halaman diagram yang dapat diekspor')
    }
    if (!hasRequiredKinds(exported)) {
      throw new Error('Halaman diagram yang diminta tidak tersedia untuk diekspor')
    }
    if (useCache) {
      snapshotCache.set(cacheKey, exported)
    }
    return exported
  } finally {
    root.unmount()
    container.remove()
  }
}

export function clearSopDiagramSnapshotCache(): void {
  snapshotCache.clear()
}
