import { useMemo } from 'react'
import {
  DIAGRAM_LINE_HEIGHT,
  measureDiagramTextBox,
  wrapDiagramText,
} from '../../layout/wrapDiagramText'

const LINE_HEIGHT = DIAGRAM_LINE_HEIGHT

interface ActivityProps {
  id?: string
  x?: number
  y?: number
  width?: number
  height?: number
  name?: string
}

export function Activity({
  id,
  x = 0,
  y = 0,
  width = 80,
  height = 40,
  name = '',
}: ActivityProps) {
  const textLines = useMemo(() => wrapDiagramText(name ?? ''), [name])

  const { computedWidth, computedHeight } = useMemo(() => {
    const measured = measureDiagramTextBox({
      lines: textLines,
      minWidth: width,
      minHeight: height,
    })
    return { computedWidth: measured.width, computedHeight: measured.height }
  }, [textLines, width, height])

  const firstTspanDy = useMemo(() => {
    if (textLines.length <= 1) return -((textLines.length - 1) * LINE_HEIGHT) / 2
    return -(textLines.length - 1) * (LINE_HEIGHT / 2)
  }, [textLines])

  return (
    <g id={id}>
      <rect
        x={x - computedWidth / 2}
        y={y - computedHeight / 2}
        width={computedWidth}
        height={computedHeight}
        fill="white"
        stroke="#000"
        strokeWidth="2"
        rx="10"
        ry="10"
      />
      <text x={x} y={y} textAnchor="middle" fontSize="13" dominantBaseline="central">
        {textLines.map((line, index) => (
          <tspan key={index} x={x} dy={index === 0 ? firstTspanDy : LINE_HEIGHT}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  )
}
