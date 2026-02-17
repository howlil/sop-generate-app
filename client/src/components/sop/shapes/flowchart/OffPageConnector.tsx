import type { CSSProperties } from 'react'

interface FlowchartOffPageConnectorProps {
  id: string
  letter?: string
  style?: CSSProperties
}

export function FlowchartOffPageConnector({
  id,
  letter = 'A',
  style = {},
}: FlowchartOffPageConnectorProps) {
  return (
    <div style={style} className="inline-block">
      <svg width="50" height="60" xmlns="http://www.w3.org/2000/svg">
        <polygon
          id={id}
          points="25,55 5,40 5,5 45,5 45,40"
          stroke="#000"
          fill="white"
          strokeWidth="2"
        />
        <text
          x="50%"
          y="45%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="20"
          fontFamily="Arial"
          fill="black"
        >
          {letter}
        </text>
      </svg>
    </div>
  )
}
