/**
 * Generates a unique ID using crypto.randomUUID with an optional prefix.
 */
export function generateId(prefix?: string): string {
  const uuid = crypto.randomUUID()
  return prefix ? `${prefix}-${uuid}` : uuid
}
