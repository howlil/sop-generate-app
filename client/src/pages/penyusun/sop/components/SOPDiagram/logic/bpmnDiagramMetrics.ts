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

/** Tinggi minimum satu swimlane (tetap nyaman untuk label aktor vertikal). */
export const BPMN_BASE_ROW_HEIGHT = 160

/** Jarak antar baris swimlane. */
export const BPMN_ROW_SPACING = 20

/** Jarak antar kolom langkah di dalam diagram. */
export const BPMN_COLUMN_SPACING = 36

export const BPMN_BASE_X = 10

/** Margin kanan kanvas diagram (bukan tinggi swimlane). */
export const BPMN_RIGHT_MARGIN = 72

/** Ruang kosong vertikal di swimlane di atas/bawah shape tertinggi. */
export const BPMN_LANE_STEP_PADDING = 60

/** Ukuran layout per tipe step (routing + obstacle). */
export function getBpmnStepLayoutDimensions(
  stepName: string | undefined,
  stepType: string,
): { width: number; height: number } {
  if (stepType === 'terminator') {
    return { width: BPMN_EVENT_SIZE, height: BPMN_EVENT_SIZE }
  }
  if (stepType === 'decision') {
    return { width: BPMN_GATEWAY_SIZE, height: BPMN_GATEWAY_SIZE }
  }
  if (stepType !== 'task') {
    return { width: BPMN_TASK_MIN_WIDTH, height: BPMN_TASK_MIN_HEIGHT }
  }
  if (!stepName) {
    return { width: BPMN_TASK_MIN_WIDTH, height: BPMN_TASK_MIN_HEIGHT }
  }
  const lines = wrapDiagramText(stepName)
  return measureDiagramTextBox({
    lines,
    minWidth: BPMN_TASK_MIN_WIDTH,
    minHeight: BPMN_TASK_MIN_HEIGHT,
    horizontalPadding: 14,
    verticalPadding: 14,
  })
}
