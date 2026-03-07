/**
 * Shape BPMN sederhana: Event (lingkaran) dan Gateway (diamond).
 * Digabung dalam satu file karena ukuran kecil (~25–38 baris masing-masing).
 */
import { useMemo } from 'react'

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
        r={37}
        fill="white"
        stroke="#000"
        strokeWidth="2"
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
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

const DIAMOND_SIZE = 40

export function Gateway({ id, x = 0, y = 0 }: GatewayProps) {
  const diamondPath = useMemo(
    () =>
      `M ${x} ${y - DIAMOND_SIZE} L ${x + DIAMOND_SIZE} ${y} L ${x} ${y + DIAMOND_SIZE} L ${x - DIAMOND_SIZE} ${y} Z`,
    [x, y]
  )

  return (
    <g id={id}>
      <path d={diamondPath} fill="white" stroke="#000" strokeWidth="2" />
    </g>
  )
}
