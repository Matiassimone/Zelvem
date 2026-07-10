import { z } from 'zod'

/** Credentials accepted by `POST /auth/login`. */
export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})
export type LoginRequest = z.infer<typeof loginRequestSchema>

/** Body accepted by `POST /auth/refresh`. */
export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
})
export type RefreshRequest = z.infer<typeof refreshRequestSchema>

/** Access + refresh token pair returned by login and refresh. */
export const tokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})
export type TokenPair = z.infer<typeof tokenPairSchema>
