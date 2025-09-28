import { baseEnvSchema, validateEnv } from '@yomi/shared'
import { z } from 'zod'

const crawlerServiceEnvSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().min(1).max(65535).default(50054),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  CRAWLER_TIMEOUT: z.coerce.number().int().min(5000).default(30000), // 30 seconds in milliseconds
  CRAWLER_RETRY_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(3),
  CRAWLER_CONCURRENT_JOBS: z.coerce.number().int().min(1).max(50).default(5),
})

export const env = validateEnv(crawlerServiceEnvSchema)
export type CrawlerServiceEnv = z.infer<typeof crawlerServiceEnvSchema>
