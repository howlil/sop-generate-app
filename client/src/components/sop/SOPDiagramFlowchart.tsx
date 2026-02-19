import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import {
  FlowchartArrowConnector,
  type FlowchartConnection,
  type UsedSides,
  type PathUpdatedPayload,
  type RoutedPathsRef,
} from './shapes/FlowchartArrowConnector'
import type { OccupiedSegment } from './shapes/orthogonalRouter'
import { FlowchartOffPageConnector } from './shapes/flowchart/OffPageConnector'
import type {
  ProsedurRow,
  LayoutConfig,
  Implementer,
  SOPStep,
  ArrowConfig,
  LabelConfig,
} from './sopDiagramTypes'
import { getFullTimeUnit } from './sopDiagramTypes'
import {
  splitStepsIntoPages,
  splitCrossPageConnections,
  getOpcShapesForPage,
  type OpcPair,
} from './flowchartPagination'

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

const PAGE_WIDTH_CLASS = 'w-[calc(297mm-3cm)] min-w-[calc(297mm-3cm)] max-w-[calc(297mm-3cm)]'

/* ───────────────────────── Props ─────────────────────────── */

export interface SOPDiagramFlowchartProps {
  rows: ProsedurRow[]
  steps: SOPStep[]
  implementers: Implementer[]
  layoutConfig?: LayoutConfig
  arrowConfig?: ArrowConfig
  labelConfig?: LabelConfig
  onPathUpdated?: (payload: PathUpdatedPayload) => void
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
}: SOPDiagramFlowchartProps) {
  const config = { ...DEFAULT_LAYOUT, ...layoutConfig }
  const pelaksanaColWidth = implementers.length > 0 ? 70 / implementers.length : 70

  const rowIdToSeq = useMemo(() => new Map(rows.map((r) => [r.id, r.no])), [rows])

  /* ── Pagination ─────────────────────────────────── */

  const allPages = useMemo(
    () => splitStepsIntoPages(steps, config.firstPageSteps, config.nextPageSteps),
    [steps, config.firstPageSteps, config.nextPageSteps],
  )

  /* ── Build connections (same logic as before) ───── */

  const allConnections = useMemo<FlowchartConnection[]>(() => {
    const list: FlowchartConnection[] = []
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      if (step.type === 'decision' && step.id_next_step_if_yes && step.id_next_step_if_no) {
        const toYes = rowIdToSeq.get(step.id_next_step_if_yes)
        const toNo = rowIdToSeq.get(step.id_next_step_if_no)
        const stepYes = steps.find((s) => s.seq_number === toYes)
        const stepNo = steps.find((s) => s.seq_number === toNo)
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
      } else if (i < steps.length - 1) {
        const toStep = steps[i + 1]
        list.push({
          id: `conn-${step.seq_number}-to-${toStep.seq_number}`,
          from: `sop-step-${step.seq_number}`,
          to: `sop-step-${toStep.seq_number}`,
          sourceType: stepShapeType(step),
          targetType: stepShapeType(toStep),
        })
      }
    }
    list.sort((a, b) => {
      const labelA = (a.label ?? '').toLowerCase()
      const labelB = (b.label ?? '').toLowerCase()
      const orderA = !a.label ? 0 : (labelA === 'ya' || labelA === 'yes') ? 1 : 2
      const orderB = !b.label ? 0 : (labelB === 'ya' || labelB === 'yes') ? 1 : 2
      return orderA - orderB
    })
    return list
  }, [steps, rowIdToSeq, labelConfig?.custom_labels])

  /* ── Split cross-page connections + OPC pairs ──── */

  const { pages: pageConnections, opcPairs } = useMemo(
    () => splitCrossPageConnections(allConnections, steps, config.firstPageSteps, config.nextPageSteps),
    [allConnections, steps, config.firstPageSteps, config.nextPageSteps],
  )

  /* ── Per-page obstacles (step shapes + OPC shapes) */

  const pageObstacles = useMemo(() => {
    return allPages.map((pageSteps, pi) => {
      const obs = pageSteps.map((s) => ({ id: `sop-step-${s.seq_number}` }))
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
  routedSegmentsRef.current = new Map()

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
  useEffect(() => {
    const t = requestAnimationFrame(() => {
      for (let pi = 0; pi < allPages.length; pi++) {
        const container = document.getElementById(sopAreaId(pi))
        if (!container) continue
        const cells = container.querySelectorAll('td[data-implementer-id]')
        if (cells.length === 0) continue
        const containerRect = container.getBoundingClientRect()
        let minLeft = Infinity, maxRight = -Infinity, minTop = Infinity, maxBottom = -Infinity
        cells.forEach((cell) => {
          const rect = cell.getBoundingClientRect()
          minLeft = Math.min(minLeft, rect.left - containerRect.left)
          maxRight = Math.max(maxRight, rect.right - containerRect.left)
          minTop = Math.min(minTop, rect.top - containerRect.top)
          maxBottom = Math.max(maxBottom, rect.bottom - containerRect.top)
        })
        pelaksanaBoundsRef.current[pi] = { left: minLeft, top: minTop, right: maxRight, bottom: maxBottom }
      }
      setArrowsReady(true)
    })
    return () => cancelAnimationFrame(t)
  }, [allPages, implementers])

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
}: FlowchartPageProps) {
  return (
    <div
      className={`print-page px-4 lg:px-0 print:px-0 mx-auto ${PAGE_WIDTH_CLASS} print:max-w-[calc(297mm-3cm)] box-border print:my-0 print:mx-auto [print-color-adjust:exact] [-webkit-print-color-adjust:exact] ${isLastPage ? 'print-last-page' : ''}`}
    >
      <div id={areaId} className="relative">
        {/* ── OPC-in shapes at top ──────────────── */}
        {opcTop.length > 0 && (
          <div className="flex justify-around items-end pb-2">
            {opcTop.map((opc) => (
              <FlowchartOffPageConnector
                key={`opc-in-${opc.fromSeq}-${opc.toSeq}`}
                id={`opc-in-step-${opc.fromSeq}-to-step-${opc.toSeq}`}
                letter={opc.letter}
              />
            ))}
          </div>
        )}

        {/* ── Table ─────────────────────────────── */}
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
          <thead>
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
                              <svg width={78} height={38} xmlns="http://www.w3.org/2000/svg">
                                <rect width={76} height={36} x={0.8} y={0.8} rx={19.2} ry={19.2} fill="none" stroke="black" strokeWidth={2} />
                              </svg>
                            )}
                            {isDecision && (
                              <svg width={60} height={60} xmlns="http://www.w3.org/2000/svg">
                                <polygon points="30,1 59,30 30,59 1,30" fill="none" stroke="black" strokeWidth={2} />
                              </svg>
                            )}
                            {!isTerminator && !isDecision && (
                              <svg width={78} height={38} xmlns="http://www.w3.org/2000/svg">
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

        {/* ── OPC-out shapes at bottom ──────────── */}
        {opcBottom.length > 0 && (
          <div className="flex justify-around items-start pt-2">
            {opcBottom.map((opc) => (
              <FlowchartOffPageConnector
                key={`opc-out-${opc.fromSeq}-${opc.toSeq}`}
                id={`opc-out-step-${opc.fromSeq}-to-step-${opc.toSeq}`}
                letter={opc.letter}
              />
            ))}
          </div>
        )}

        {/* ── Arrow SVG overlay (scoped to this page) */}
        {arrowsReady && connections.length > 0 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
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
              />
            ))}
          </svg>
        )}
      </div>
    </div>
  )
}
