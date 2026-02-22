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
