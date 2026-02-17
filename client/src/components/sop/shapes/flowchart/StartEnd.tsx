interface StartEndProps {
  id?: string
  x?: number
  y?: number
  width?: number
  height?: number
  text?: string
  className?: string
}

export function StartEnd({
  id,
  x = 0,
  y = 0,
  width = 76,
  height = 36,
  text,
  className,
}: StartEndProps) {
  const rx = height / 2
  return (
    <g id={id} className={className} transform={`translate(${x - width / 2}, ${y - height / 2})`}>
      <rect
        width={width}
        height={height}
        x={0.8}
        y={0.8}
        rx={rx}
        ry={rx}
        fill="white"
        stroke="#000"
        strokeWidth="2"
      />
      {text != null && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="600"
          fill="black"
        >
          {text}
        </text>
      )}
    </g>
  )
}
