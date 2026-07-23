const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:4000' : '')

if (!API_URL && import.meta.env.PROD) {
  console.error('VITE_API_URL must be set for production builds')
}

export type ApiError = { error: string; status: number }

let authToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function setApiToken(token: string | null) {
  authToken = token
}

export function getApiToken() {
  return authToken
}

/** Register a handler invoked once per 401 (e.g. clear local session). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export async function api<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`)

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
    })
  } catch {
    throw new Error(
      'Cannot reach the API (cold start or network). Wait ~30s and try again.',
    )
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) onUnauthorized?.()
    const err = new Error((data as { error?: string }).error ?? res.statusText) as Error & {
      status: number
    }
    err.status = res.status
    throw err
  }
  return data as T
}

export { API_URL }
