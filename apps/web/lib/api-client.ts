import type { ZodType } from 'zod'

import {
  type LoginRequest,
  loginRequestSchema,
  type TokenPair,
  tokenPairSchema,
} from '@zelvem/contracts'

/** Base URL of the Zelvem API — the only env read in the web app. */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const TOKENS_KEY = 'zelvem-auth'

// ponytail: token pair in localStorage — switch to httpOnly cookies set by
// the API when the real auth endpoints land, so tokens leave JS-readable storage.

/** Returns the stored token pair, or null if absent or malformed. */
function getStoredTokens(): TokenPair | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY)
    if (!raw) return null
    const parsed = tokenPairSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

async function post<T>(path: string, body: unknown, schema: ZodType<T>): Promise<T> {
  const tokens = getStoredTokens()
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(tokens ? { authorization: `Bearer ${tokens.accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`API request failed: ${response.status}`)
  return schema.parse(await response.json())
}

/** Typed API client — every request and response is validated with @zelvem/contracts. */
export const apiClient = {
  /** Logs in against the API and persists the issued token pair. */
  async login(input: LoginRequest): Promise<TokenPair> {
    const pair = await post('/auth/login', loginRequestSchema.parse(input), tokenPairSchema)
    localStorage.setItem(TOKENS_KEY, JSON.stringify(pair))
    return pair
  },
}
