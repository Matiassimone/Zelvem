import { z } from 'zod'

/** A calendar event. */
export const calendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
})
export type CalendarEvent = z.infer<typeof calendarEventSchema>
