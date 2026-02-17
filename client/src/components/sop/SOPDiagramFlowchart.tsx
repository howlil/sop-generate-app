import { useMemo, useState, useEffect, useCallback } from 'react'
import {
  FlowchartArrowConnector,
  type FlowchartConnection,
  type UsedSides,
  type PathUpdatedPayload,
} from './shapes/FlowchartArrowConnector'
import type {
  ProsedurRow,
  LayoutConfig,
  Implementer,
  SOPStep,
  ArrowConfig,
  LabelConfig,
} from './sopDiagramTypes'
import { getFullTimeUnit } from './sopDiagramTypes'

const MAIN_SOP_AREA_ID = 'main-sop-area-0'

const DEFAULT_LAYOUT = {
  widthKegiatan: 25,
  widthKelengkapan: 15,
  widthWaktu: 10,
  widthOutput: 15,
  widthKeterangan: 15,
}

export interface SOPDiagramFlowchartProps {
  rows: ProsedurRow[]
  steps: SOPStep[]
  implementers: Implementer[]
  layoutConfig?: LayoutConfig
  /** Persisted arrow paths; when set per connection, auto-routing is skipped (see SOP_DIAGRAM_LOGIC.md) */
  arrowConfig?: ArrowConfig
  /** Custom labels and label positions */
  labelConfig?: LabelConfig
  /** Called when a path is computed; parent can persist to arrowConfig / usedSides */
  onPathUpdated?: (payload: PathUpdatedPayload) => void
}

function stepShapeType(step: SOPStep): string {
  if (step.type === 'terminator') return 'flowchart-terminator'
  if (step.type === 'decision') return 'flowchart-decision'
  return 'flowchart-process'
}

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

  const obstacles = useMemo(
    () => steps.map((s) => ({ id: `sop-step-${s.seq_number}` })),
    [steps]
  )

  const [usedSides, setUsedSides] = useState<UsedSides>({})

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
    [onPathUpdatedProp]
  )

  const connections = useMemo<FlowchartConnection[]>(() => {
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
    return list
  }, [steps, rows, rowIdToSeq, labelConfig?.custom_labels])

  const [arrowsReady, setArrowsReady] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setArrowsReady(true))
    return () => cancelAnimationFrame(t)
  }, [steps])

  return (
    <div className="flex flex-col gap-8 overflow-x-auto">
      <div className="px-4 lg:px-0 print:px-0 mx-auto w-[calc(297mm-3cm)] min-w-[calc(297mm-3cm)] max-w-[calc(297mm-3cm)] print:max-w-[calc(297mm-3cm)]">
        <div id={MAIN_SOP_AREA_ID} className="relative">
          <table
            className="w-full border-collapse border-2 border-black table-fixed text-sm bg-white"
            id="sop-container-0"
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
                <th rowSpan={2} className="border-2 py-0.5 border-black">
                  NO
                </th>
                <th rowSpan={2} className="border-2 py-0.5 border-black">
                  KEGIATAN
                </th>
                <th
                  colSpan={implementers.length || 1}
                  className="border-2 py-0.5 px-1 border-black"
                >
                  PELAKSANA
                </th>
                <th colSpan={3} className="border-2 py-0.5 px-1 border-black">
                  MUTU BAKU
                </th>
                <th rowSpan={2} className="border-2 py-0.5 px-1 border-black">
                  KET
                </th>
              </tr>
              <tr className="bg-[#D9D9D9]">
                {implementers.map((impl) => (
                  <th
                    key={impl.id}
                    className="border-2 py-0.5 border-black font-bold text-xs"
                  >
                    {impl.name.toUpperCase()}
                  </th>
                ))}
                <th className="border-2 py-0.5 border-black text-xs">KELENGKAPAN</th>
                <th className="border-2 py-0.5 border-black text-xs">WAKTU</th>
                <th className="border-2 py-0.5 border-black text-xs">OUTPUT</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const step = steps[index]
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
                                  <rect
                                    width={76}
                                    height={36}
                                    x={0.8}
                                    y={0.8}
                                    rx={19.2}
                                    ry={19.2}
                                    fill="none"
                                    stroke="black"
                                    strokeWidth={2}
                                  />
                                </svg>
                              )}
                              {isDecision && (
                                <svg width={60} height={60} xmlns="http://www.w3.org/2000/svg">
                                  <polygon
                                    points="30,1 59,30 30,59 1,30"
                                    fill="none"
                                    stroke="black"
                                    strokeWidth={2}
                                  />
                                </svg>
                              )}
                              {!isTerminator && !isDecision && (
                                <svg width={78} height={38} xmlns="http://www.w3.org/2000/svg">
                                  <rect
                                    width={76}
                                    height={36}
                                    x={1}
                                    y={1}
                                    fill="none"
                                    stroke="black"
                                    strokeWidth={2}
                                  />
                                  <text
                                    x="50%"
                                    y="50%"
                                    dominantBaseline="middle"
                                    textAnchor="middle"
                                    fontSize={14}
                                    fontFamily="Arial"
                                    fill="black"
                                  >
                                    {step.seq_number}
                                  </text>
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
                        ? row.time === 0
                          ? ''
                          : `${row.time} ${getFullTimeUnit(row.time_unit)}`
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

          {arrowsReady && connections.length > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              aria-hidden
            >
              {connections.map((conn, idx) => (
                <FlowchartArrowConnector
                  key={conn.id}
                  connection={conn}
                  idcontainer={MAIN_SOP_AREA_ID}
                  idarrow={`${idx}-${conn.id}`}
                  obstacles={obstacles}
                  usedSides={usedSides}
                  manualConfig={arrowConfig?.[conn.id]}
                  manualLabelPosition={labelConfig?.positions?.[conn.id]}
                  onPathUpdated={onPathUpdated}
                />
              ))}
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}
