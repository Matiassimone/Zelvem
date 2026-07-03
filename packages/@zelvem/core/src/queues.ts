/**
 * BullMQ queue names shared by the API (producer) and workers (consumers).
 * One queue per genuinely async/heavy task — nothing else goes through BullMQ.
 */
export const QUEUES = {
  transcription: 'transcription',
  embeddings: 'embeddings',
  emailDigest: 'email-digest',
} as const
