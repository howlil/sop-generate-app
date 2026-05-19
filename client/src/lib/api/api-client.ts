import { clientEnv } from '@/config/env'

export function buildQueryString(
  params: Record<string, unknown> | undefined,
): string {
  if (!params) return ''
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null) searchParams.append(key, String(item))
      }
      continue
    }
    searchParams.set(key, String(value))
  }

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

const API_BASE_URL = clientEnv.VITE_API_BASE_URL

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  // CSRF Token (if available) — hanya di browser; `document` tidak ada saat SSR.
  if (typeof document !== 'undefined') {
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute('content')
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }
  }

  return headers
}

export class ApiError extends Error {
  status: number
  code?: string
  errors?: string[]

  constructor(status: number, message: string, code?: string, errors?: string[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
  }
}


interface ErrorResponseBody {
  message?: string;
  errors?: string[];
  error?: string[];
  code?: string;
  statusCode?: number;
  status?: number;
}

function extractErrors(errorBody: ErrorResponseBody): { message: string; errors?: string[]; code?: string } {
  const errors = Array.isArray(errorBody.errors)
    ? errorBody.errors
    : Array.isArray(errorBody.error)
    ? errorBody.error
    : undefined

  const message = errors
    ? errors.join('\n')
    : errorBody.message || `HTTP ${errorBody.statusCode || errorBody.status || 'unknown'}`

  // Extract error code if present
  const code = 'code' in errorBody ? errorBody.code as string : undefined

  return { message, errors, code }
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
 * Refresh access token using refresh token cookie.
 * Returns true if refresh succeeded, false otherwise.
 * Tokens are delivered via HttpOnly cookies — no tokens in response body.
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const url = `${API_BASE_URL}/auth/refresh`
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include', // Include cookies
    })

    return response.ok
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
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies in requests
      signal: controller.signal,
    })
  } catch (networkError: unknown) {
    const isTimeout = networkError instanceof DOMException && networkError.name === 'AbortError'
    const message = isTimeout 
      ? 'Permintaan melebihi batas waktu' 
      : 'Tidak dapat terhubung ke server'
    throw new ApiError(0, message)
  } finally {
    clearTimeout(timeoutId)
  }

  const isAuthSessionEndpoint =
    endpoint === '/auth/login' ||
    endpoint === '/auth/refresh' ||
    endpoint.startsWith('/auth/login?')

  // Handle 401 Unauthorized - attempt token refresh
  if (response.status === 401 && !isAuthSessionEndpoint) {
    if (retryCount === 0) {
      const refreshed = await waitForRefresh()
      if (refreshed) {
        return request<T>(endpoint, options, retryCount + 1)
      }
    }
    const { handleUnauthorizedSession } = await import('@/stores/authStore')
    handleUnauthorizedSession()
    throw new ApiError(401, 'Sesi berakhir. Silakan login kembali.')
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Request failed' }))
    const { message, errors, code } = extractErrors(errorBody)
    throw new ApiError(response.status, message, code, errors)
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
  delete: <T = void>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
}
