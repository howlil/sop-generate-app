/**
 * Shared UI constants — tab keys, locale, common labels.
 */

export const LOCALE_ID = 'id-ID' as const

/** Diagram view mode tabs (used in SOPPreviewTemplate & DetailSOPPenyusun). */
export const DIAGRAM_TAB = {
  FLOWCHART: 'flowchart',
  BPMN: 'bpmn',
} as const

export type DiagramTab = (typeof DIAGRAM_TAB)[keyof typeof DIAGRAM_TAB]
