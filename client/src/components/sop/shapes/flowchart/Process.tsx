interface ProcessProps {
  id?: string
  x?: number
  y?: number
  width?: number
  height?: number
  text?: string
  className?: string
}

export function Process({
  id,
  x = 0,
  y = 0,
  width = 76,
  height = 36,
  text,
  className,
}: ProcessProps) {
  return (
    <g id={id} className={className} transform={`translate(${x - width / 2}, ${y - height / 2})`}>
      <rect
        width={width}
        height={height}
        x={1}
        y={1}
        fill="white"
        stroke="#000"
        strokeWidth="2"
      />
      {text != null && (
        <text
          x={width / 2 + 1}
          y={height / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fill="black"
        >
          {text}
        </text>
      )}
    </g>
  )
}
