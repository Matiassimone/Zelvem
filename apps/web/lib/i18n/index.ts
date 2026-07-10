import { type Locale, type Messages, messages } from './messages'

// ponytail: locale fixed to 'es' (primary voice) — wire user preference /
// negotiation when the EN locale ships to real users.
const locale: Locale = 'es'

/** Returns the active locale's message tree. The only way components get UI strings. */
export function t(): Messages {
  return messages[locale]
}
