interface DecisionProps {
  id?: string
  x?: number
  y?: number
  size?: number
  text?: string
  className?: string
}

/** Diamond: center (x,y), half-size 29 → points (x,y-29), (x+29,y), (x,y+29), (x-29,y) */
export function Decision({ id, x = 0, y = 0, size = 58, text, className }: DecisionProps) {
  const h = size / 2
  const points = `${x},${y - h} ${x + h},${y} ${x},${y + h} ${x - h},${y}`
  return (
    <g id={id} className={className}>
      <polygon
        points={points}
        fill="white"
        stroke="#000"
        strokeWidth="2"
      />
      {text != null && (
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="black"
        >
          {text}
        </text>
      )}
    </g>
  )
}
