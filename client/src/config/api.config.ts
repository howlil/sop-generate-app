/**
 * API Configuration
 * Base URL and headers configuration
 * Note: Authentication handled via HttpOnly cookies (backend-managed)
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

/**
 * Get default headers
 * Note: Auth token is automatically sent via HttpOnly cookies by browser
 * No need to manually set Authorization header
 */
export function getHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  // Don't set Authorization header - browser sends cookies automatically
  return headers
}

/**
 * Build full URL from endpoint
 */
export function buildUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`
}
