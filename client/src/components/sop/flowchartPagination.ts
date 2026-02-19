import type { SOPStep } from './sopDiagramTypes'
import type { FlowchartConnection } from './shapes/FlowchartArrowConnector'

/* ── Types ─────────────────────────────────────────────── */

export interface OpcPair {
  letter: string
  fromSeq: number
  toSeq: number
  fromPage: number
  toPage: number
  fromImplId: string
  toImplId: string
  /** Original connection this OPC was split from */
  originalConn: FlowchartConnection
}

export interface PageConnections {
  /** Connections scoped to each page (index = page number) */
  pages: FlowchartConnection[][]
  /** All cross-page OPC pairs with assigned letters */
  opcPairs: OpcPair[]
}

/* ── Pure helpers ──────────────────────────────────────── */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function splitStepsIntoPages(
  steps: SOPStep[],
  firstPageSteps: number,
  nextPageSteps: number,
): SOPStep[][] {
  if (steps.length === 0) return []
  const pages: SOPStep[][] = []
  pages.push(steps.slice(0, firstPageSteps))
  let i = firstPageSteps
  while (i < steps.length) {
    pages.push(steps.slice(i, i + nextPageSteps))
    i += nextPageSteps
  }
  return pages
}

export function getPageForStep(
  seqNumber: number,
  firstPageSteps: number,
  nextPageSteps: number,
): number {
  if (seqNumber <= firstPageSteps) return 0
  return Math.ceil((seqNumber - firstPageSteps) / nextPageSteps)
}

/**
 * Extract the seq_number from a shape id like "sop-step-3" → 3.
 * Returns -1 if the id doesn't follow the convention.
 */
function seqFromShapeId(id: string): number {
  const m = id.match(/^sop-step-(\d+)$/)
  return m ? Number(m[1]) : -1
}

/**
 * Given all connections and pagination params, split cross-page edges
 * into per-page connection lists with OPC endpoint shapes.
 */
export function splitCrossPageConnections(
  connections: FlowchartConnection[],
  steps: SOPStep[],
  firstPageSteps: number,
  nextPageSteps: number,
): PageConnections {
  const totalPages = splitStepsIntoPages(steps, firstPageSteps, nextPageSteps).length
  const pages: FlowchartConnection[][] = Array.from({ length: totalPages }, () => [])
  const opcPairs: OpcPair[] = []

  const stepMap = new Map(steps.map((s) => [s.seq_number, s]))

  for (const conn of connections) {
    const fromSeq = seqFromShapeId(conn.from)
    const toSeq = seqFromShapeId(conn.to)
    if (fromSeq < 0 || toSeq < 0) continue

    const fromPage = getPageForStep(fromSeq, firstPageSteps, nextPageSteps)
    const toPage = getPageForStep(toSeq, firstPageSteps, nextPageSteps)

    if (fromPage === toPage) {
      pages[fromPage].push(conn)
      continue
    }

    const fromStep = stepMap.get(fromSeq)
    const toStep = stepMap.get(toSeq)
    const letter = LETTERS[opcPairs.length % LETTERS.length]

    const opcOutId = `opc-out-step-${fromSeq}-to-step-${toSeq}`
    const opcInId = `opc-in-step-${fromSeq}-to-step-${toSeq}`

    pages[fromPage].push({
      ...conn,
      id: `${conn.id}__out`,
      to: opcOutId,
      targetType: 'flowchart-opc',
    })

    pages[toPage].push({
      ...conn,
      id: `${conn.id}__in`,
      from: opcInId,
      sourceType: 'flowchart-opc',
    })

    opcPairs.push({
      letter,
      fromSeq,
      toSeq,
      fromPage,
      toPage,
      fromImplId: fromStep?.id_implementer ?? '',
      toImplId: toStep?.id_implementer ?? '',
      originalConn: conn,
    })
  }

  return { pages, opcPairs }
}

/**
 * Collect OPC shapes that belong to a specific page, split into
 * shapes that appear at the top vs bottom of the page.
 */
export function getOpcShapesForPage(
  pageIndex: number,
  opcPairs: OpcPair[],
): { top: OpcPair[]; bottom: OpcPair[] } {
  const top: OpcPair[] = []
  const bottom: OpcPair[] = []

  for (const opc of opcPairs) {
    if (opc.fromPage === pageIndex) {
      // Outgoing from this page → placed at bottom
      bottom.push(opc)
    }
    if (opc.toPage === pageIndex) {
      // Incoming to this page → placed at top
      top.push(opc)
    }
  }
  return { top, bottom }
}
