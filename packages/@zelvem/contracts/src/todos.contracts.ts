import { z } from 'zod'

/** A project grouping related todos. */
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
})
export type Project = z.infer<typeof projectSchema>

/** A todo captured from any source (multi-source ingestion pipeline). */
export const todoSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['open', 'done']),
  source: z.enum(['manual', 'audio', 'email', 'idea']),
  projectId: z.string().nullable(),
})
export type Todo = z.infer<typeof todoSchema>
