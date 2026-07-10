import { z } from 'zod'

/** A blog draft. Publishing always requires explicit human review. */
export const blogDraftSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  content: z.string(),
  status: z.enum(['draft', 'in_review', 'published']),
  sourceType: z.enum(['text', 'audio']),
})
export type BlogDraft = z.infer<typeof blogDraftSchema>
