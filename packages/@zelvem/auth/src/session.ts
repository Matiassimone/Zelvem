/** Authenticated session decoded from a verified access token. */
export interface Session {
  /** The unique identifier of the authenticated user (JWT `sub`). */
  userId: string
  /** When the token was issued. */
  issuedAt: Date
  /** When the token stops being valid. */
  expiresAt: Date
}
