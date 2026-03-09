import { useMemo, useState, useEffect, useLayoutEffect, useCallback, useRef, type MutableRefObject } from 'react'
import {
  FlowchartArrowConnector,
  type FlowchartConnection,
  type UsedSides,
  type PathUpdatedPayload,
  type RoutedPathsRef,
} from './shapes/FlowchartArrowConnector'
import { buildCorridorGraph, type OccupiedSegment, type CellInfo, type CorridorGraph } from './logic/orthogonalRouter'
import { FlowchartOffPageConnector } from './shapes/flowchart/OffPageConnector'
import type {
  ProsedurRow,
  LayoutConfig,
  Implementer,
  SOPStep,
  ArrowConfig,
  LabelConfig,
} from './logic/sopDiagramTypes'
import { getFullTimeUnit, isYaLabel, isTidakLabel } from './logic/sopDiagramTypes'
import {
  splitStepsIntoPages,
  splitCrossPageConnections,
  getOpcShapesForPage,
  type OpcPair,
} from './logic/flowchartPagination'

/* ───────────────────────── Defaults ─────────────────────────── */

const DEFAULT_LAYOUT = {
  widthKegiatan: 25,
  widthKelengkapan: 15,
  widthWaktu: 10,
  widthOutput: 15,
  widthKeterangan: 15,
  firstPageSteps: 7,
  nextPageSteps: 8,
}

/** Lebar tetap A4 content agar konsisten (path/arrow tidak berubah saat resize); scroll horizontal jika viewport sempit */
const PAGE_WIDTH_CLASS = 'w-[calc(297mm-3cm)] min-w-[calc(297mm-3cm)] print:w-[calc(297mm-3cm)] print:min-w-[calc(297mm-3cm)] print:max-w-[calc(297mm-3cm)]'

/* ───────────────────────── Props ─────────────────────────── */

export interface SOPDiagramFlowchartProps {
  rows: ProsedurRow[]
  steps: SOPStep[]
  implementers: Implementer[]
  layoutConfig?: LayoutConfig
  arrowConfig?: ArrowConfig
  labelConfig?: LabelConfig
  onPathUpdated?: (payload: PathUpdatedPayload) => void
  /** Seed untuk urutan koneksi; nilai berbeda mencoba kemungkinan layout path lain */
  pathLayoutSeed?: number
}

/* ───────────────────────── Helpers ─────────────────────────── */

function stepShapeType(step: SOPStep): string {
  if (step.type === 'terminator') return 'flowchart-terminator'
  if (step.type === 'decision') return 'flowchart-decision'
  return 'flowchart-process'
}

function sopAreaId(pageIndex: number) {
  return `main-sop-area-${pageIndex}`
}

/* ───────────────────────── Component ─────────────────────────── */

export function SOPDiagramFlowchart({
  rows,
  steps,
  implementers,
  layoutConfig,
  arrowConfig,
  labelConfig,
  onPathUpdated: onPathUpdatedProp,
  pathLayoutSeed = 0,
}: SOPDiagramFlowchartProps) {
  const config = { ...DEFAULT_LAYOUT, ...layoutConfig }
  const sortedSteps = useMemo(() => [...steps].sort((a, b) => a.seq_number - b.seq_number), [steps])
  const MIN_PELAKSANA_COL_WIDTH = 10
  const pelaksanaColWidth = implementers.length > 0
    ? Math.max(MIN_PELAKSANA_COL_WIDTH, 70 / implementers.length)
    : 70

  const rowIdToSeq = useMemo(() => new Map(rows.map((r) => [r.id, r.no])), [rows])

  /* ── Pagination ─────────────────────────────────── */

  const allPages = useMemo(
    () => splitStepsIntoPages(sortedSteps, config.firstPageSteps, config.nextPageSteps),
    [sortedSteps, config.firstPageSteps, config.nextPageSteps],
  )

  /* ── Build connections (same logic as before) ───── */

  const allConnections = useMemo<FlowchartConnection[]>(() => {
    const list: FlowchartConnection[] = []
    for (let i = 0; i < sortedSteps.length; i++) {
      const step = sortedSteps[i]
      if (step.type === 'decision' && step.id_next_step_if_yes && step.id_next_step_if_no) {
        const toYes = rowIdToSeq.get(step.id_next_step_if_yes)
        const toNo = rowIdToSeq.get(step.id_next_step_if_no)
        const stepYes = sortedSteps.find((s) => s.seq_number === toYes)
        const stepNo = sortedSteps.find((s) => s.seq_number === toNo)
        if (toYes != null) {
          const customYes = labelConfig?.custom_labels?.[`step-${step.seq_number}-yes`]
          list.push({
            id: `conn-${step.seq_number}-yes-${toYes}`,
            from: `sop-step-${step.seq_number}`,
            to: `sop-step-${toYes}`,
            label: customYes ?? 'Ya',
            sourceType: 'flowchart-decision',
            targetType: stepYes ? stepShapeType(stepYes) : 'flowchart-process',
          })
        }
        if (toNo != null) {
          const customNo = labelConfig?.custom_labels?.[`step-${step.seq_number}-no`]
          list.push({
            id: `conn-${step.seq_number}-no-${toNo}`,
            from: `sop-step-${step.seq_number}`,
            to: `sop-step-${toNo}`,
            label: customNo ?? 'Tidak',
            sourceType: 'flowchart-decision',
            targetType: stepNo ? stepShapeType(stepNo) : 'flowchart-process',
          })
        }
      } else if (i < sortedSteps.length - 1) {
        const toStep = sortedSteps[i + 1]
        list.push({
          id: `conn-${step.seq_number}-to-${toStep.seq_number}`,
          from: `sop-step-${step.seq_number}`,
          to: `sop-step-${toStep.seq_number}`,
          sourceType: stepShapeType(step),
          targetType: stepShapeType(toStep),
        })
      }
    }
    // Route order: Tidak first (needs left/right), then Ya, then linear. Within Tidak: loop-back first.
    const seqFromId = (id: string) => {
      const n = id.match(/sop-step-(\d+)/)?.[1]
      return n != null ? Number(n) : -1
    }
    // Hash yang bergantung pada seed sehingga urutan koneksi berubah per klik "Perbaiki diagram"
    const hashId = (seed: number, id: string) =>
      (id.split('').reduce((acc, c, i) => acc + (c.charCodeAt(0) * ((seed + 1) * (i + 31) + seed * 7)), 0) >>> 0)
    list.sort((a, b) => {
      const orderA = !a.label ? 0 : isYaLabel(a.label) ? 1 : isTidakLabel(a.label) ? 2 : 0
      const orderB = !b.label ? 0 : isYaLabel(b.label) ? 1 : isTidakLabel(b.label) ? 2 : 0
      const typeDiff = orderB - orderA
      if (typeDiff !== 0) return typeDiff
      if (orderA === 2) {
        const fromSeqA = seqFromId(a.from), toSeqA = seqFromId(a.to)
        const fromSeqB = seqFromId(b.from), toSeqB = seqFromId(b.to)
        const loopBackA = toSeqA >= 0 && fromSeqA >= 0 && toSeqA < fromSeqA ? 0 : 1
        const loopBackB = toSeqB >= 0 && fromSeqB >= 0 && toSeqB < fromSeqB ? 0 : 1
        const loopDiff = loopBackA - loopBackB
        if (loopDiff !== 0) return loopDiff
      }
      return hashId(pathLayoutSeed, a.id) - hashId(pathLayoutSeed, b.id)
    })
    return list
  }, [steps, rowIdToSeq, labelConfig?.custom_labels, pathLayoutSeed])

  /* ── Scan: reserved sides per target (all Tidak to same target get left/right) ── */
  const reservedSidesRef = useRef<Map<string, Set<string>>>(new Map())
  reservedSidesRef.current = useMemo(() => {
    const m = new Map<string, Set<string>>()
    for (const c of allConnections) {
      if (c.sourceType !== 'flowchart-decision' || !isTidakLabel(c.label)) continue
      for (const side of ['left', 'right'] as const) {
        const key = `${c.to}-${side}`
        if (!m.has(key)) m.set(key, new Set())
        m.get(key)!.add(c.id)
      }
    }
    return m
  }, [allConnections])

  /* ── Split cross-page connections + OPC pairs ──── */

  const { pages: pageConnections, opcPairs } = useMemo(
    () => splitCrossPageConnections(allConnections, steps, config.firstPageSteps, config.nextPageSteps),
    [allConnections, steps, config.firstPageSteps, config.nextPageSteps],
  )

  /* ── Per-page obstacles (step shapes + OPC shapes) */

  const pageObstacles = useMemo(() => {
    return allPages.map((pageSteps, pi) => {
      const obs: { id: string }[] = [{ id: `sop-page-${pi}-table-header` }]
      for (const s of pageSteps) obs.push({ id: `sop-step-${s.seq_number}` })
      const { top, bottom } = getOpcShapesForPage(pi, opcPairs)
      for (const opc of top) obs.push({ id: `opc-in-step-${opc.fromSeq}-to-step-${opc.toSeq}` })
      for (const opc of bottom) obs.push({ id: `opc-out-step-${opc.fromSeq}-to-step-${opc.toSeq}` })
      return obs
    })
  }, [allPages, opcPairs])

  /* ── usedSides (global across all pages) ─────── */

  const [usedSides, setUsedSides] = useState<UsedSides>({})

  /* ── Shared routing context for cross-arrow overlap avoidance ── */
  const routedSegmentsRef = useRef<Map<string, OccupiedSegment[]>>(new Map())
  useLayoutEffect(() => {
    routedSegmentsRef.current = new Map()
  }, [pathLayoutSeed])

  const onPathUpdated = useCallback(
    (payload: PathUpdatedPayload) => {
      setUsedSides((prev) => {
        const fromId = payload.from
        const toId = payload.to
        const alreadyFrom = fromId && (prev[fromId]?.out?.[payload.sSide] ?? []).includes(payload.connectionId)
        const alreadyTo = toId && (prev[toId]?.in?.[payload.eSide] ?? []).includes(payload.connectionId)
        if (alreadyFrom && alreadyTo) return prev
        const next = { ...prev }
        if (fromId) {
          next[fromId] = { ...next[fromId], out: { ...next[fromId]?.out } }
          const out = next[fromId].out!
          const arr = out[payload.sSide] ?? []
          if (!arr.includes(payload.connectionId)) out[payload.sSide] = [...arr, payload.connectionId]
        }
        if (toId) {
          next[toId] = { ...next[toId], in: { ...next[toId]?.in } }
          const in_ = next[toId].in!
          const arr = in_[payload.eSide] ?? []
          if (!arr.includes(payload.connectionId)) in_[payload.eSide] = [...arr, payload.connectionId]
        }
        return next
      })
      onPathUpdatedProp?.(payload)
    },
    [onPathUpdatedProp],
  )

  /* ── Arrow readiness + pelaksana bounds per page ── */

  const pelaksanaBoundsRef = useRef<Record<number, { left: number; top: number; right: number; bottom: number }>>({})

  const [arrowsReady, setArrowsReady] = useState(false)
  const [, setBoundsVersion] = useState(0)

  const measurePelaksanaBounds = useCallback(() => {
    for (let pi = 0; pi < allPages.length; pi++) {
      const container = document.getElementById(sopAreaId(pi))
      if (!container) continue
      const containerRect = container.getBoundingClientRect()

      // Hanya kolom pelaksana (td[data-implementer-id]) — path tidak boleh masuk kolom NO, KEGIATAN, MUTU BAKU, KET
      const implCells = container.querySelectorAll('td[data-implementer-id]')
      let minLeft = Infinity, maxRight = -Infinity, minTop = Infinity, maxBottom = -Infinity
      implCells.forEach((cell) => {
        const rect = cell.getBoundingClientRect()
        minLeft = Math.min(minLeft, rect.left - containerRect.left)
        maxRight = Math.max(maxRight, rect.right - containerRect.left)
        minTop = Math.min(minTop, rect.top - containerRect.top)
        maxBottom = Math.max(maxBottom, rect.bottom - containerRect.top)
      })

      const opcEls = container.querySelectorAll('[id^="opc-"]')
      opcEls.forEach((el) => {
        const rect = el.getBoundingClientRect()
        minTop = Math.min(minTop, rect.top - containerRect.top)
        maxBottom = Math.max(maxBottom, rect.bottom - containerRect.top)
      })

      if (minLeft === Infinity) minLeft = 0
      if (maxRight === -Infinity) maxRight = containerRect.width
      // PAD lebih ketat: path tidak boleh terlalu dekat ke border kolom pelaksana
      const PAD_LEFT = 8   // padding dari kiri kolom pelaksana pertama
      const PAD_RIGHT = 8  // padding dari kanan kolom pelaksana terakhir
      const PAD_TOP = 4    // padding dari atas (header row)
      const PAD_BOTTOM = 8 // padding dari bawah
      pelaksanaBoundsRef.current[pi] = {
        left: Math.max(0, minLeft + PAD_LEFT),
        top: Math.max(0, minTop + PAD_TOP),
        right: maxRight - PAD_RIGHT,
        bottom: maxBottom + PAD_BOTTOM,
      }
    }
    setArrowsReady(true)
  }, [allPages])

  useEffect(() => {
    const t = requestAnimationFrame(() => measurePelaksanaBounds())
    return () => cancelAnimationFrame(t)
  }, [measurePelaksanaBounds])

  useEffect(() => {
    const onBeforePrint = () => {
      measurePelaksanaBounds()
    }
    window.addEventListener('beforeprint', onBeforePrint)
    return () => window.removeEventListener('beforeprint', onBeforePrint)
  }, [measurePelaksanaBounds])

  useEffect(() => {
    const observers: ResizeObserver[] = []
    for (let pi = 0; pi < allPages.length; pi++) {
      const container = document.getElementById(sopAreaId(pi))
      if (!container) continue
      const ro = new ResizeObserver(() => {
        setBoundsVersion((v) => v + 1)
        requestAnimationFrame(() => measurePelaksanaBounds())
      })
      ro.observe(container)
      observers.push(ro)
    }
    return () => observers.forEach((ro) => ro.disconnect())
  }, [allPages.length, measurePelaksanaBounds])

  /* ── Render ─────────────────────────────────────── */

  return (
    <div className="flex flex-col gap-8 overflow-x-auto">
      {allPages.map((pageSteps, pageIndex) => {
        const pageRows = rows.filter((r) =>
          pageSteps.some((s) => s.seq_number === r.no),
        )
        const conns = pageConnections[pageIndex] ?? []
        const obstacles = pageObstacles[pageIndex] ?? []
        const { top: opcTop, bottom: opcBottom } = getOpcShapesForPage(pageIndex, opcPairs)
        const areaId = sopAreaId(pageIndex)

        return (
          <FlowchartPage
            key={pageIndex}
            pageIndex={pageIndex}
            areaId={areaId}
            pageSteps={pageSteps}
            pageRows={pageRows}
            implementers={implementers}
            config={config}
            pelaksanaColWidth={pelaksanaColWidth}
            connections={conns}
            obstacles={obstacles}
            opcTop={opcTop}
            opcBottom={opcBottom}
            usedSides={usedSides}
            arrowsReady={arrowsReady}
            arrowConfig={arrowConfig}
            labelConfig={labelConfig}
            onPathUpdated={onPathUpdated}
            pelaksanaBounds={pelaksanaBoundsRef.current[pageIndex] ?? null}
            isLastPage={pageIndex === allPages.length - 1}
            routedSegmentsRef={routedSegmentsRef}
            reservedSidesRef={reservedSidesRef}
          />
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
 *  FlowchartPage — renders a single print-page with its
 *  table, OPC shapes, and arrow SVG overlay.
 * ─────────────────────────────────────────────────────── */

interface FlowchartPageProps {
  pageIndex: number
  areaId: string
  pageSteps: SOPStep[]
  pageRows: ProsedurRow[]
  implementers: Implementer[]
  config: typeof DEFAULT_LAYOUT
  pelaksanaColWidth: number
  connections: FlowchartConnection[]
  obstacles: { id: string }[]
  opcTop: OpcPair[]
  opcBottom: OpcPair[]
  usedSides: UsedSides
  arrowsReady: boolean
  arrowConfig?: ArrowConfig
  labelConfig?: LabelConfig
  onPathUpdated: (payload: PathUpdatedPayload) => void
  pelaksanaBounds: { left: number; top: number; right: number; bottom: number } | null
  isLastPage: boolean
  routedSegmentsRef: RoutedPathsRef
  reservedSidesRef: MutableRefObject<Map<string, Set<string>>>
}

function scanCorridorCells(
  container: HTMLElement,
): CellInfo[][] {
  const cRect = container.getBoundingClientRect()
  const grid: CellInfo[][] = []
  const table = container.querySelector('table')
  if (!table) return grid

  const SHAPE_PAD = 8
  const HEADER_EXTRA_PAD = 12 // Extra padding untuk header agar path tidak menimpa

  const thead = table.querySelector('thead')
  if (thead) {
    const thRect = thead.getBoundingClientRect()
    const numImplCols = table.querySelectorAll('td[data-implementer-id]').length
      ? new Set(
          Array.from(table.querySelectorAll<HTMLElement>('td[data-implementer-id]')).map(
            (td) => td.dataset.implementerId,
          ),
        ).size
      : 1
    const headerRow: CellInfo[] = []
    for (let ci = 0; ci < numImplCols; ci++) {
      const rect = {
        left: Math.round(thRect.left - cRect.left),
        top: Math.round(thRect.top - cRect.top),
        width: Math.round(thRect.width / numImplCols),
        height: Math.round(thRect.height) + HEADER_EXTRA_PAD, // Extend header obstacle downward
      }
      rect.left += ci * rect.width
      // shapeRect lebih besar dari rect biasa untuk header
      const shapeRect = {
        left: rect.left - SHAPE_PAD,
        top: rect.top - SHAPE_PAD,
        width: rect.width + SHAPE_PAD * 2,
        height: rect.height + SHAPE_PAD * 2,
      }
      headerRow.push({
        row: 0,
        col: ci,
        rect,
        center: { x: Math.round(rect.left + rect.width / 2), y: Math.round(rect.top + rect.height / 2) },
        occupied: true,
        shapeRect,
      })
    }
    if (headerRow.length > 0) grid.push(headerRow)
  }

  const tbody = table.querySelector('tbody')
  if (!tbody) return grid

  const trs = tbody.querySelectorAll('tr')
  const headerRows = grid.length

  for (let ri = 0; ri < trs.length; ri++) {
    const tr = trs[ri]
    const row: CellInfo[] = []
    const tds = tr.querySelectorAll<HTMLElement>('td[data-implementer-id]')

    for (let ci = 0; ci < tds.length; ci++) {
      const td = tds[ci]
      const tdRect = td.getBoundingClientRect()
      const rect = {
        left: Math.round(tdRect.left - cRect.left),
        top: Math.round(tdRect.top - cRect.top),
        width: Math.round(tdRect.width),
        height: Math.round(tdRect.height),
      }

      const shapeEl = td.querySelector<HTMLElement>('span[id^="sop-step-"], span[id^="opc-"]')
      let occupied = false
      let shapeRect: CellInfo['shapeRect']

      if (shapeEl) {
        const sr = shapeEl.getBoundingClientRect()
        occupied = true
        shapeRect = {
          left: Math.round(sr.left - cRect.left) - SHAPE_PAD,
          top: Math.round(sr.top - cRect.top) - SHAPE_PAD,
          width: Math.round(sr.width) + SHAPE_PAD * 2,
          height: Math.round(sr.height) + SHAPE_PAD * 2,
        }
      }

      row.push({
        row: ri + headerRows,
        col: ci,
        rect,
        center: {
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2),
        },
        occupied,
        shapeRect,
      })
    }

    if (row.length > 0) grid.push(row)
  }

  return grid
}

function FlowchartPage({
  pageIndex,
  areaId,
  pageSteps,
  pageRows,
  implementers,
  config,
  pelaksanaColWidth,
  connections,
  obstacles,
  opcTop,
  opcBottom,
  usedSides,
  arrowsReady,
  arrowConfig,
  labelConfig,
  onPathUpdated,
  pelaksanaBounds,
  isLastPage,
  routedSegmentsRef,
  reservedSidesRef,
}: FlowchartPageProps) {
  const corridorGraphRef = useRef<CorridorGraph | null>(null)
  const [graphReady, setGraphReady] = useState(false)

  useEffect(() => {
    if (!arrowsReady) return
    const container = document.getElementById(areaId)
    if (!container) return

    const frame = requestAnimationFrame(() => {
      const cells = scanCorridorCells(container)
      if (cells.length > 0) {
        corridorGraphRef.current = buildCorridorGraph(cells)
      }
      setGraphReady(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [arrowsReady, areaId, pageSteps.length, implementers.length])

  return (
    <div
      className={`print-page px-4 lg:px-0 print:px-0 mx-auto ${PAGE_WIDTH_CLASS} box-border print:my-0 print:mx-auto [print-color-adjust:exact] [-webkit-print-color-adjust:exact] ${isLastPage ? 'print-last-page' : ''}`}
    >
      <div id={areaId} className="relative">
        {opcTop.length > 0 && (
          <div className={`flex items-end pb-2 ${opcTop.length > 3 ? 'flex-wrap gap-2 justify-start px-4' : 'justify-evenly'}`}>
            {opcTop
              .sort((a, b) => a.toSeq - b.toSeq)
              .map((opc) => (
                <FlowchartOffPageConnector
                  key={`opc-in-${opc.fromSeq}-${opc.toSeq}`}
                  id={`opc-in-step-${opc.fromSeq}-to-step-${opc.toSeq}`}
                  letter={opc.letter}
                />
              ))}
          </div>
        )}

        <table
          className="w-full border-collapse border-2 border-black table-fixed text-sm bg-white"
        >
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: `${config.widthKegiatan}%` }} />
            {implementers.map((impl) => (
              <col key={impl.id} style={{ width: `${pelaksanaColWidth}%` }} />
            ))}
            <col style={{ width: `${config.widthKelengkapan}%` }} />
            <col style={{ width: `${config.widthWaktu}%` }} />
            <col style={{ width: `${config.widthOutput}%` }} />
            <col style={{ width: `${config.widthKeterangan}%` }} />
          </colgroup>
          <thead id={`sop-page-${pageIndex}-table-header`}>
            <tr className="bg-[#D9D9D9]">
              <th rowSpan={2} className="border-2 py-0.5 border-black">NO</th>
              <th rowSpan={2} className="border-2 py-0.5 border-black">KEGIATAN</th>
              <th colSpan={implementers.length || 1} className="border-2 py-0.5 px-1 border-black">PELAKSANA</th>
              <th colSpan={3} className="border-2 py-0.5 px-1 border-black">MUTU BAKU</th>
              <th rowSpan={2} className="border-2 py-0.5 px-1 border-black">KET</th>
            </tr>
            <tr className="bg-[#D9D9D9]">
              {implementers.map((impl) => (
                <th key={impl.id} className="border-2 py-0.5 border-black font-bold text-xs">
                  {impl.name.toUpperCase()}
                </th>
              ))}
              <th className="border-2 py-0.5 border-black text-xs">KELENGKAPAN</th>
              <th className="border-2 py-0.5 border-black text-xs">WAKTU</th>
              <th className="border-2 py-0.5 border-black text-xs">OUTPUT</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => {
              const step = pageSteps.find((s) => s.seq_number === row.no)
              if (!step) return null
              const isTerminator = step.type === 'terminator'
              const isDecision = step.type === 'decision'

              return (
                <tr key={row.id}>
                  <td className="border-2 border-black py-0.5 text-center align-top">
                    {step.seq_number}
                  </td>
                  <td
                    className="border-2 border-black py-0.5 px-1 text-justify break-words hyphens-auto align-top text-xs"
                    lang="id"
                  >
                    {step.name}
                  </td>
                  {implementers.map((impl) => (
                    <td
                      key={impl.id}
                      className="border-2 border-black p-0 text-center align-middle relative"
                      data-implementer-id={impl.id}
                    >
                      {step.id_implementer === impl.id && (
                        <div className="flex flex-col justify-around items-center px-2 py-5 min-h-[70px] relative z-10">
                          <span
                            id={`sop-step-${step.seq_number}`}
                            className="inline-block leading-[0]"
                            aria-hidden
                          >
                            {isTerminator && (
                              <svg width={86} height={42} viewBox="-4 -2 86 42" xmlns="http://www.w3.org/2000/svg">
                                <rect width={76} height={36} x={0.8} y={0.8} rx={19.2} ry={19.2} fill="none" stroke="black" strokeWidth={2} />
                              </svg>
                            )}
                            {isDecision && (
                              <svg width={66} height={66} viewBox="-3 -3 66 66" xmlns="http://www.w3.org/2000/svg">
                                <polygon points="30,1 59,30 30,59 1,30" fill="none" stroke="black" strokeWidth={2} />
                              </svg>
                            )}
                            {!isTerminator && !isDecision && (
                              <svg width={82} height={42} viewBox="-2 -2 82 42" xmlns="http://www.w3.org/2000/svg">
                                <rect width={76} height={36} x={1} y={1} fill="none" stroke="black" strokeWidth={2} />
                              </svg>
                            )}
                          </span>
                        </div>
                      )}
                    </td>
                  ))}
                  <td
                    className="border-2 border-black py-0.5 px-1 text-justify break-words hyphens-auto whitespace-pre-line align-top text-xs"
                    lang="id"
                  >
                    {row.mutu_kelengkapan || ' - '}
                  </td>
                  <td
                    className="border-2 border-black py-0.5 px-1 text-justify break-words hyphens-auto align-top text-xs"
                    lang="id"
                  >
                    {row.time !== undefined && row.time_unit != null
                      ? row.time === 0 ? '' : `${row.time} ${getFullTimeUnit(row.time_unit)}`
                      : row.mutu_waktu || ' - '}
                  </td>
                  <td
                    className="border-2 border-black py-0.5 px-1 text-justify break-words hyphens-auto whitespace-pre-line align-top text-xs"
                    lang="id"
                  >
                    {row.output || ' - '}
                  </td>
                  <td
                    className="border-2 border-black py-0.5 px-1 text-justify break-words hyphens-auto whitespace-pre-line align-top text-xs"
                    lang="id"
                  >
                    {row.keterangan || ' - '}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {opcBottom.length > 0 && (
          <div className={`flex items-start pt-2 ${opcBottom.length > 3 ? 'flex-wrap gap-2 justify-start px-4' : 'justify-evenly'}`}>
            {opcBottom
              .sort((a, b) => a.fromSeq - b.fromSeq)
              .map((opc) => (
                <FlowchartOffPageConnector
                  key={`opc-out-${opc.fromSeq}-${opc.toSeq}`}
                  id={`opc-out-step-${opc.fromSeq}-to-step-${opc.toSeq}`}
                  letter={opc.letter}
                />
              ))}
          </div>
        )}

        {arrowsReady && graphReady && connections.length > 0 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20 print:break-inside-avoid"
            aria-hidden
          >
            {connections.map((conn, idx) => (
              <FlowchartArrowConnector
                key={conn.id}
                connection={conn}
                idcontainer={areaId}
                idarrow={`p${pageIndex}-${idx}-${conn.id}`}
                obstacles={obstacles}
                usedSides={usedSides}
                manualConfig={arrowConfig?.[conn.id]}
                manualLabelPosition={labelConfig?.positions?.[conn.id]}
                onPathUpdated={onPathUpdated}
                constraintRect={pelaksanaBounds}
                routedSegmentsRef={routedSegmentsRef}
                reservedSidesRef={reservedSidesRef}
              />
            ))}
          </svg>
        )}
      </div>
    </div>
  )
}
