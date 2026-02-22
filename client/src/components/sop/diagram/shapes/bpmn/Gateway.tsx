import { useMemo } from 'react'

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
