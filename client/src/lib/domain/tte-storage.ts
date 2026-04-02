/**
 * TTE Storage Stubs
 * These are stubs for backward compatibility - use hooks for real data
 */

export function getTTEProfile(_role: string): null {
  return null
}

export function setTTEProfile(_role: string, _profile: any): void {
  // no-op
}

export function addTTESignature(_id: string, _signature: any): void {
  // no-op
}

export function getValidasiPengesahanUrl(_id: string): string {
  return '#'
}

export function getTTEVerificationSuccessUrl(): string {
  return '#'
}
