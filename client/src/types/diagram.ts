/**
 * Diagram types - stub
 */

export type DiagramType = 'FLOWCHART' | 'BPMN'
export type LangkahType = 'TERMINATOR' | 'TASK' | 'DECISION'

export interface DiagramNode {
  id: string
  type: LangkahType
  x: number
  y: number
  label: string
}

export interface DiagramEdge {
  id: string
  from: string
  to: string
  label?: string
}
