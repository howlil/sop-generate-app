import { measureDiagramTextBox, wrapDiagramText } from './wrapDiagramText'

/** Radius lingkaran Mulai/Selesai (SVG). */
export const BPMN_EVENT_RADIUS = 26

/** Kotak layout untuk terminator (selaras dengan diameter lingkaran). */
export const BPMN_EVENT_SIZE = BPMN_EVENT_RADIUS * 2

/** Setengah sisi diamond gateway (jarak pusat ke sudut). */
export const BPMN_GATEWAY_HALF_SIZE = 28

export const BPMN_GATEWAY_SIZE = BPMN_GATEWAY_HALF_SIZE * 2

export const BPMN_TASK_MIN_WIDTH = 80
export const BPMN_TASK_MIN_HEIGHT = 40

/** Padding kotak task — harus sama dengan Activity.tsx dan layout engine. */
export const BPMN_TASK_PADDING = 14

/** Tinggi minimum satu swimlane (tetap nyaman untuk label aktor vertikal). */
export const BPMN_BASE_ROW_HEIGHT = 160

/** Jarak antar baris swimlane. */
export const BPMN_ROW_SPACING = 20

/** Jarak antar kolom langkah di dalam diagram. */
export const BPMN_COLUMN_SPACING = 40

export const BPMN_BASE_X = 10

/** Margin kanan kanvas diagram (bukan tinggi swimlane). */
export const BPMN_RIGHT_MARGIN = 72

/** Ruang kosong vertikal di swimlane di atas/bawah shape tertinggi. */
export const BPMN_LANE_STEP_PADDING = 60

/** Jarak horizontal minimum antar pusat kolom (selaras task ~220 + gap). */
export const BPMN_HORIZONTAL_GAP = 120

/** Jarak ekstra lebar kolom jika ada decision/gateway. */
export const BPMN_GATEWAY_EXTRA_GAP = 40

/** Offset teks decision di bawah pusat diamond (global Y). */
export const BPMN_DECISION_TEXT_OFFSET_Y = BPMN_GATEWAY_HALF_SIZE + 24

/** Padding antar rect saat deteksi tabrakan layout. */
export const BPMN_COLLISION_PADDING = 16

export interface BpmnStepDimensions {
  width: number
  height: number
  /** Tinggi tambahan di bawah diamond untuk label keputusan. */
  decisionTextReserve: number
}

function measureDecisionTextReserve(stepName: string | undefined): number {
  if (!stepName?.trim()) return BPMN_DECISION_TEXT_OFFSET_Y + 24
  const lines = wrapDiagramText(stepName)
  const box = measureDiagramTextBox({
    lines,
    minWidth: BPMN_TASK_MIN_WIDTH,
    minHeight: 24,
    horizontalPadding: BPMN_TASK_PADDING,
    verticalPadding: 8,
  })
  return BPMN_DECISION_TEXT_OFFSET_Y + box.height
}

/** Ukuran layout per tipe step (routing + obstacle + lane height). */
export function getBpmnStepLayoutDimensions(
  stepName: string | undefined,
  stepType: string,
): BpmnStepDimensions {
  if (stepType === 'terminator') {
    return {
      width: BPMN_EVENT_SIZE,
      height: BPMN_EVENT_SIZE,
      decisionTextReserve: 0,
    }
  }
  if (stepType === 'decision') {
    return {
      width: BPMN_GATEWAY_SIZE,
      height: BPMN_GATEWAY_SIZE,
      decisionTextReserve: measureDecisionTextReserve(stepName),
    }
  }
  if (stepType !== 'task') {
    return {
      width: BPMN_TASK_MIN_WIDTH,
      height: BPMN_TASK_MIN_HEIGHT,
      decisionTextReserve: 0,
    }
  }
  if (!stepName) {
    return {
      width: BPMN_TASK_MIN_WIDTH,
      height: BPMN_TASK_MIN_HEIGHT,
      decisionTextReserve: 0,
    }
  }
  const lines = wrapDiagramText(stepName)
  const box = measureDiagramTextBox({
    lines,
    minWidth: BPMN_TASK_MIN_WIDTH,
    minHeight: BPMN_TASK_MIN_HEIGHT,
    horizontalPadding: BPMN_TASK_PADDING,
    verticalPadding: BPMN_TASK_PADDING,
  })
  return {
    width: box.width,
    height: box.height,
    decisionTextReserve: 0,
  }
}
