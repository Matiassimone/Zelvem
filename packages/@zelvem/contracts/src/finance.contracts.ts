import { z } from 'zod'

/**
 * A personal expense. `amount` travels as a decimal string to preserve
 * precision end to end (Prisma Decimal <-> API <-> frontend).
 */
export const expenseSchema = z.object({
  id: z.string(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'decimal string, max 2 fraction digits'),
  currency: z.string().length(3),
  category: z.string(),
  incurredAt: z.coerce.date(),
  note: z.string().nullable(),
})
export type Expense = z.infer<typeof expenseSchema>
