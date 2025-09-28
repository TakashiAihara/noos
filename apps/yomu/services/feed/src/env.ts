import { baseEnvSchema, validateEnv } from '@yomi/shared'
import { z } from 'zod'

const feedServiceEnvSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().min(1).max(65535).default(50052),
  DATABASE_URL: z.string().default('postgresql://localhost:5432/yomi_feeds'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  FEED_UPDATE_INTERVAL: z.coerce.number().int().min(60).default(900), // 15 minutes in seconds
})

export const env = validateEnv(feedServiceEnvSchema)
export type FeedServiceEnv = z.infer<typeof feedServiceEnvSchema>
