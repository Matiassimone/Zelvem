import { Worker } from 'bullmq'
import pino from 'pino'
import { z } from 'zod'

import { QUEUES } from '@zelvem/core'

const logger = pino()

/** Env contract for the workers process — refuses to start if not met. */
const env = z.object({ REDIS_URL: z.string().min(1) }).parse(process.env)

const redis = new URL(env.REDIS_URL)
const connection = {
  host: redis.hostname,
  port: Number(redis.port || 6379),
  password: redis.password || undefined,
}

// ponytail: no processors implemented yet — each module session registers its
// own (transcription, embeddings, email-digest). Until then, jobs fail loudly
// instead of disappearing silently.
for (const name of Object.values(QUEUES)) {
  new Worker(
    name,
    async (job) => {
      throw new Error(`No processor implemented for queue "${name}" (job ${job.id ?? 'unknown'})`)
    },
    { connection },
  )
}

logger.info({ queues: Object.values(QUEUES) }, 'Workers up — waiting for jobs')
