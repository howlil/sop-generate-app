/**
 * Shape BPMN sederhana: Event (lingkaran) dan Gateway (diamond).
 * Digabung dalam satu file karena ukuran kecil (~25–38 baris masing-masing).
 */
import { useMemo } from 'react'
import { BPMN_EVENT_RADIUS, BPMN_GATEWAY_HALF_SIZE } from '../../layout/bpmnDiagramMetrics'

// ----- Event -----

interface EventProps {
  id?: string
  x?: number
  y?: number
  text?: string
}

export function Event({
  id,
  x = 0,
  y = 0,
  text = 'Mulai',
}: EventProps) {
  return (
    <g id={id}>
      <circle
        cx={x}
        cy={y}
        r={BPMN_EVENT_RADIUS}
        fill="white"
        stroke="#000"
        strokeWidth="2"
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fontWeight="500"
        fill="black"
      >
        {text}
      </text>
    </g>
  )
}

// ----- Gateway -----

interface GatewayProps {
  id?: string
  x?: number
  y?: number
  name?: string
}

export function Gateway({ id, x = 0, y = 0 }: GatewayProps) {
  const diamondPath = useMemo(
    () =>
      `M ${x} ${y - BPMN_GATEWAY_HALF_SIZE} L ${x + BPMN_GATEWAY_HALF_SIZE} ${y} L ${x} ${y + BPMN_GATEWAY_HALF_SIZE} L ${x - BPMN_GATEWAY_HALF_SIZE} ${y} Z`,
    [x, y]
  )

  return (
    <g id={id}>
      <path d={diamondPath} fill="white" stroke="#000" strokeWidth="2" />
    </g>
  )
}
