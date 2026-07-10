import { z } from 'zod'

/** A connected email account (multi-account support). */
export const emailAccountSchema = z.object({
  id: z.string(),
  provider: z.string(),
  address: z.email(),
})
export type EmailAccount = z.infer<typeof emailAccountSchema>

/** An ingested email. */
export const emailSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  subject: z.string(),
  from: z.string(),
  receivedAt: z.coerce.date(),
  category: z.string().nullable(),
})
export type Email = z.infer<typeof emailSchema>
