import { flushSync } from 'react-dom'
import { SOP_BEFORE_PRINT_EVENT } from './sop-print-events'

export const SOP_PRINT_READY_TIMEOUT_MS = 6000
export const SOP_PRINT_POLL_INTERVAL_MS = 80
const MIN_PATH_D_LENGTH = 8

export interface WaitForSopDiagramPrintReadyOptions {
  timeoutMs?: number
  scope?: ParentNode
}

export interface PrintSopDocumentResult {
  diagramReady: boolean
}

/** Judul kosong mengurangi header bawaan browser (tanggal/judul) di dialog cetak. */
export function suppressBrowserPrintChrome(): () => void {
  const previousTitle = document.title
  document.title = '\u00a0'
  return () => {
    document.title = previousTitle
  }
}

type SopPrintPrepareHandler = () => void

let sopPrintPrepareHandler: SopPrintPrepareHandler | null = null

/** Daftarkan handler React (flushSync mount diagram) dari lapisan cetak SOP. */
export function registerSopPrintPrepareHandler(handler: SopPrintPrepareHandler | null): void {
  sopPrintPrepareHandler = handler
}

function waitForPrintPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

function getExpectedConnectionCount(root: Element): number {
  const raw = root.getAttribute('data-sop-connection-count')
  if (raw == null) return 0
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function countValidConnectorPaths(root: Element): number {
  const paths = root.querySelectorAll('path.sop-connector-stroke[d]')
  let valid = 0
  paths.forEach((path) => {
    const d = path.getAttribute('d')
    if (d != null && d.length >= MIN_PATH_D_LENGTH) valid += 1
  })
  return valid
}

export function isSopDiagramRootReady(root: Element): boolean {
  const expected = getExpectedConnectionCount(root)
  if (expected === 0) return true
  return countValidConnectorPaths(root) >= expected
}

function collectRequiredDiagramRoots(scope: ParentNode): Element[] {
  const flowchartHost = scope.querySelector('.sop-print-diagram-flowchart')
  const bpmnHost = scope.querySelector('.sop-print-diagram-bpmn')
  if (flowchartHost == null || bpmnHost == null) return []
  return [
    ...flowchartHost.querySelectorAll('[data-sop-diagram-root]'),
    ...bpmnHost.querySelectorAll('[data-sop-diagram-root]'),
  ]
}

export function areSopDiagramRootsReady(scope: ParentNode = document): boolean {
  const roots = collectRequiredDiagramRoots(scope)
  if (roots.length === 0) return false
  return roots.every((root) => isSopDiagramRootReady(root))
}

/** Area cetak khusus SOP (lapisan tersembunyi jika ada, seperti sebelumnya). */
export function getPrintScope(): ParentNode {
  const dedicated = document.querySelector('[data-print-area="sop"]')
  return dedicated ?? document
}

/** Tunggu flowchart + BPMN selesai merender path. */
export async function waitForSopDiagramPrintReady(
  options: WaitForSopDiagramPrintReadyOptions = {},
): Promise<boolean> {
  const timeoutMs = options.timeoutMs ?? SOP_PRINT_READY_TIMEOUT_MS
  const scope = options.scope ?? getPrintScope()
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    await waitForPrintPaint()
    if (areSopDiagramRootsReady(scope)) return true
    await new Promise((resolve) => {
      window.setTimeout(resolve, SOP_PRINT_POLL_INTERVAL_MS)
    })
  }
  return areSopDiagramRootsReady(scope)
}

function mountDiagramsForPrint(): void {
  if (sopPrintPrepareHandler != null) {
    sopPrintPrepareHandler()
  }
  window.dispatchEvent(new Event(SOP_BEFORE_PRINT_EVENT))
}

/** Lepas mode cetak SOP dari DOM. */
export function cleanupSopPrintDocument(): void {
  document.body.classList.remove('print-mode-sop', 'sop-print-preparing')
}

/**
 * Browser print legacy (Ctrl+P / lapisan cetak tersembunyi).
 * @deprecated Untuk cetak produksi gunakan `printSopPdfDocument` / `printSopFromPreviewProps`.
 */
export async function printSopDocument(): Promise<PrintSopDocumentResult> {
  const scope = getPrintScope()

  document.body.classList.add('sop-print-preparing')
  mountDiagramsForPrint()
  await waitForPrintPaint()

  const diagramReady = await waitForSopDiagramPrintReady({
    timeoutMs: SOP_PRINT_READY_TIMEOUT_MS,
    scope,
  })

  document.body.classList.remove('sop-print-preparing')
  await waitForPrintPaint()

  return new Promise((resolve) => {
    const onAfterPrint = () => {
      cleanupSopPrintDocument()
      window.removeEventListener('afterprint', onAfterPrint)
      resolve({ diagramReady })
    }
    window.addEventListener('afterprint', onAfterPrint)
    window.print()
  })
}

/** Util untuk template: flushSync + callback terdaftar. */
export function createSopPrintPrepareHandler(
  prepare: () => void,
): SopPrintPrepareHandler {
  return () => {
    flushSync(prepare)
  }
}
