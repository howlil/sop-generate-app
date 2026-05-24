export interface BpmnLayoutStepInput {
  id_step: string
  seq_number: number
  name?: string
  id_implementer?: string | null
  type: string
}

export interface BpmnLayoutConnectionInput {
  from: string
  to: string
}

function parseBpmnStepSeq(nodeId: string): number | null {
  const match = nodeId.match(/^bpmn-step-(\d+)$/)
  if (!match) return null
  return Number(match[1])
}

function laneIndexForStep(
  step: BpmnLayoutStepInput,
  implementerIds: string[],
): number {
  if (!step.id_implementer) return 0
  const idx = implementerIds.findIndex((id) => id === step.id_implementer)
  return idx === -1 ? 0 : idx
}

/**
 * Assign kolom berdasarkan urutan workflow global.
 *
 * BPMN harus terbaca kiri → kanan lintas swimlane. Karena itu successor forward
 * selalu ditempatkan minimal satu kolom di kanan predecessor, dan setiap langkah
 * berikutnya mendapat floor sekuensial agar lane berbeda tidak "reset" ke kiri.
 * Loop-back tetap boleh kembali ke target lama, jadi edge mundur tidak menaikkan
 * kolom target.
 */
export function assignStepColumns(
  steps: BpmnLayoutStepInput[],
  connections: BpmnLayoutConnectionInput[],
  implementerIds: string[],
): Map<string, number> {
  const seqToIdStep = new Map<number, string>()
  for (const step of steps) {
    seqToIdStep.set(step.seq_number, step.id_step)
  }
  const predsByIdStep = new Map<string, string[]>()
  for (const step of steps) {
    predsByIdStep.set(step.id_step, [])
  }
  for (const conn of connections) {
    const fromSeq = parseBpmnStepSeq(conn.from)
    const toSeq = parseBpmnStepSeq(conn.to)
    if (fromSeq === null || toSeq === null) continue
    if (fromSeq >= toSeq) continue
    const fromId = seqToIdStep.get(fromSeq)
    const toId = seqToIdStep.get(toSeq)
    if (!fromId || !toId) continue
    const list = predsByIdStep.get(toId) ?? []
    list.push(fromId)
    predsByIdStep.set(toId, list)
  }
  const sorted = [...steps].sort((a, b) => a.seq_number - b.seq_number)
  const rawColumns = new Map<string, number>()
  let previousSequentialColumn = -1
  for (const step of sorted) {
    const preds = predsByIdStep.get(step.id_step) ?? []
    let columnIndex = Math.max(0, previousSequentialColumn + 1)
    for (const predId of preds) {
      const pred = steps.find((s) => s.id_step === predId)
      if (!pred) continue
      const predCol = rawColumns.get(predId) ?? 0
      columnIndex = Math.max(columnIndex, predCol + 1)
    }
    if (step.type === 'decision') {
      columnIndex = Math.max(columnIndex, 0)
    }
    rawColumns.set(step.id_step, columnIndex)
    previousSequentialColumn = columnIndex
  }
  bumpDecisionBranchColumns(steps, connections, rawColumns, implementerIds)
  return rawColumns
}

/** Cabang Ya/Tidak dari gateway: minimal kolom decision+1, tidak satu kolom. */
function bumpDecisionBranchColumns(
  steps: BpmnLayoutStepInput[],
  connections: BpmnLayoutConnectionInput[],
  rawColumns: Map<string, number>,
  implementerIds: string[],
): void {
  for (const step of steps) {
    if (step.type !== 'decision') continue
    const fromNode = `bpmn-step-${step.seq_number}`
    const outs = connections.filter((c) => c.from === fromNode)
    if (outs.length < 2) continue
    const baseCol = rawColumns.get(step.id_step) ?? 0
    const lane = laneIndexForStep(step, implementerIds)
    const targetIds: string[] = []
    for (const conn of outs) {
      const toSeq = parseBpmnStepSeq(conn.to)
      if (toSeq === null) continue
      const toStep = steps.find((s) => s.seq_number === toSeq)
      if (!toStep) continue
      if (laneIndexForStep(toStep, implementerIds) === lane) {
        targetIds.push(toStep.id_step)
      }
    }
    if (targetIds.length < 2) continue
    targetIds.forEach((id, i) => {
      const minCol = baseCol + 1 + i
      rawColumns.set(id, Math.max(rawColumns.get(id) ?? 0, minCol))
    })
  }
}
