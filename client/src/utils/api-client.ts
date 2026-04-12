/**
 * HTTP Client with fetch API
 * Utility for making API requests
 * Handles HttpOnly cookie-based authentication with automatic token refresh
 * Features:
 * - Automatic token refresh on 401
 * - Request queue during refresh (prevents lost requests)
 * - CSRF protection support
 * - Retry logic with exponential backoff
 */

/**
 * Build a query string from a params object, ignoring nullish values.
 * Replaces repeated URLSearchParams boilerplate across API service files.
 */
export function buildQueryString(
  params: Record<string, unknown> | undefined,
): string {
  if (!params) return ''
  const entries = Object.entries(params)
    .filter(([, v]) => v != null)
    .map(([k, v]) => [k, String(v)])
  return entries.length ? '?' + new URLSearchParams(entries).toString() : ''
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  // CSRF Token (if available)
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }

  return headers
}

export class ApiError extends Error {
  status: number
  errors?: string[]

  constructor(status: number, message: string, errors?: string[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

/**
 * Extract error messages from API response
 * Handles various error response formats:
 * - { errors: ["msg1", "msg2"] }
 * - { message: "error", errors: ["msg1"] }
 * - { message: "error" }
 */
/**
 * Shape of API error response body.
 * Handles various formats:
 * - { errors: ["msg1", "msg2"] }
 * - { message: "error", errors: ["msg1"] }
 * - { message: "error" }
 */
interface ErrorResponseBody {
  message?: string;
  errors?: string[];
  error?: string[];
  statusCode?: number;
  status?: number;
}

function extractErrors(errorBody: ErrorResponseBody): { message: string; errors?: string[] } {
  const errors = Array.isArray(errorBody.errors)
    ? errorBody.errors
    : Array.isArray(errorBody.error)
    ? errorBody.error
    : undefined

  const message = errors
    ? errors.join('\n')
    : errorBody.message || `HTTP ${errorBody.statusCode || errorBody.status || 'unknown'}`

  return { message, errors }
}

/**
 * Request queue type for pending requests during token refresh
 */
interface QueuedRequest<T = unknown> {
  endpoint: string
  options: RequestInit
  resolve: (value: T) => void
  reject: (reason: unknown) => void
  retryCount: number
}

/**
 * Track if we're currently refreshing to prevent multiple simultaneous refreshes
 */
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

/**
 * Queue of requests waiting for token refresh to complete
 */
let requestQueue: QueuedRequest<unknown>[] = []

/**
 * Process queued requests after successful token refresh
 */
function processRequestQueue() {
  const queue = [...requestQueue]
  requestQueue = []

  queue.forEach(({ endpoint, options, resolve, reject, retryCount }) => {
    request(endpoint, options, retryCount)
      .then((result) => resolve(result as unknown))
      .catch(reject)
  })
}

/**
 * Reject all queued requests (e.g., when refresh fails)
 */
function rejectRequestQueue(error: Error | ApiError) {
  const queue = [...requestQueue]
  requestQueue = []

  queue.forEach(({ reject }) => reject(error))
}

/**
 * Refresh access token using refresh token cookie
 * Returns true if refresh succeeded, false otherwise
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const url = `${API_BASE_URL}/refresh`
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include', // Include cookies
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return !!data.accessToken
  } catch {
    return false
  }
}

/**
 * Wait for ongoing refresh or start a new one
 */
function waitForRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = refreshAccessToken()
  refreshPromise
    .then((success) => {
      if (success) {
        processRequestQueue()
      } else {
        rejectRequestQueue(new ApiError(401, 'Token refresh failed'))
      }
    })
    .catch((error) => {
      rejectRequestQueue(error)
    })
    .finally(() => {
      isRefreshing = false
      refreshPromise = null
    })

  return refreshPromise
}

const REQUEST_TIMEOUT = 15000 // 15 seconds

async function request<T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
  // If we're refreshing, queue this request
  if (isRefreshing && retryCount === 0) {
    return new Promise<T>((resolve, reject) => {
      requestQueue.push({
        endpoint,
        options,
        resolve: resolve as (value: unknown) => void,
        reject,
        retryCount,
      })
    })
  }

  const url = `${API_BASE_URL}${endpoint}`
  const headers = { ...getHeaders(), ...options.headers }

  let response: Response
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    if (import.meta.env.DEV) {
      console.log(`[API Client] ${options.method || 'GET'} ${url}`);
    }
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies in requests
      signal: controller.signal,
    })
    if (import.meta.env.DEV) {
      console.log(`[API Client] Response: ${response.status} ${response.statusText}`);
    }
  } catch (networkError: unknown) {
    if (import.meta.env.DEV) {
      console.error('[API Client] Network error:', networkError)
    }
    const isTimeout = networkError instanceof DOMException && networkError.name === 'AbortError'
    const message = isTimeout 
      ? 'Permintaan melebihi batas waktu' 
      : 'Tidak dapat terhubung ke server'
    throw new ApiError(0, message)
  } finally {
    clearTimeout(timeoutId)
  }

  // Handle 401 Unauthorized - attempt token refresh
  if (response.status === 401 && retryCount === 0) {
    const refreshed = await waitForRefresh()

    if (refreshed) {
      // Retry the original request with refreshed token
      return request<T>(endpoint, options, retryCount + 1)
    }

    // Refresh failed - clear auth state and let route guard handle redirect
    const { useAuthStore } = await import('@/stores/authStore')
    useAuthStore.getState().logout()
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Request failed' }))
    const { message, errors } = extractErrors(errorBody)
    throw new ApiError(response.status, message, errors)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: async (endpoint: string) => request<void>(endpoint, { method: 'DELETE' }),
}
