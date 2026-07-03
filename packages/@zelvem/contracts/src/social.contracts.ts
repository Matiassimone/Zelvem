import { z } from 'zod'

/** Supported platforms — LinkedIn and X only (closed decision). */
export const socialPlatformSchema = z.enum(['linkedin', 'x'])
export type SocialPlatform = z.infer<typeof socialPlatformSchema>

/** A social post draft or published entry. */
export const socialPostSchema = z.object({
  id: z.string(),
  platform: socialPlatformSchema,
  content: z.string(),
  status: z.enum(['draft', 'published']),
  scheduledAt: z.coerce.date().nullable(),
})
export type SocialPost = z.infer<typeof socialPostSchema>
