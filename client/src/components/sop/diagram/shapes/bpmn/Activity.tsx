import { useMemo } from 'react'

const MAX_LINE_LENGTH_TARGET = 15
const CHAR_WIDTH_APPROX = 8
const LINE_HEIGHT = 15
const HORIZONTAL_PADDING = 20
const VERTICAL_PADDING = 20

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
  width = 120,
  height = 60,
  name = '',
}: ActivityProps) {
  const textLines = useMemo(() => {
    if (!name) return [] as string[]
    const lines: string[] = []
    const words = name.split(' ')
    let currentLine = ''
    for (const word of words) {
      if (currentLine === '') {
        currentLine = word
      } else if (currentLine.length + 1 + word.length <= MAX_LINE_LENGTH_TARGET) {
        currentLine += ` ${word}`
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    if (currentLine !== '') lines.push(currentLine)
    return lines.length > 0 ? lines : [name]
  }, [name])

  const computedWidth = useMemo(() => {
    if (textLines.length === 0) return width
    const longestLineLength = textLines.reduce((max, line) => Math.max(max, line.length), 0)
    const requiredTextWidth = longestLineLength * CHAR_WIDTH_APPROX
    return Math.max(width, requiredTextWidth + HORIZONTAL_PADDING)
  }, [textLines, width])

  const computedHeight = useMemo(() => {
    if (textLines.length === 0) return height
    const requiredTextHeight = textLines.length * LINE_HEIGHT
    return Math.max(height, requiredTextHeight + VERTICAL_PADDING)
  }, [height, textLines])

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
