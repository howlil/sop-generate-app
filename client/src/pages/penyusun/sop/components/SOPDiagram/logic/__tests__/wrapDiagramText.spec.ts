import { wrapDiagramText, measureDiagramTextBox, DIAGRAM_MAX_CHARS_PER_LINE } from '../wrapDiagramText'

describe('wrapDiagramText', () => {
  it('should_wrap_long_unbroken_token_into_multiple_lines', () => {
    const lines = wrapDiagramText('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    expect(lines.length).toBeGreaterThan(1)
    expect(lines.every((l) => l.length <= DIAGRAM_MAX_CHARS_PER_LINE)).toBe(true)
  })

  it('should_wrap_words_with_spaces_normally', () => {
    const lines = wrapDiagramText('ini contoh peringatan singkat')
    expect(lines.join(' ')).toContain('ini contoh')
  })
})

describe('measureDiagramTextBox', () => {
  it('should_cap_width_when_lines_are_long', () => {
    const lines = wrapDiagramText('a'.repeat(80))
    const { width } = measureDiagramTextBox({ lines, minWidth: 90, minHeight: 50 })
    expect(width).toBeLessThanOrEqual(200)
  })
})
