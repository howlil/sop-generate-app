/**
 * Promise-based delay untuk simulasi latency di mock (fe.md: 200–500ms).
 * Dipakai hanya di data layer / mock adapter, tidak di hook atau component.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
