import { baseEnvSchema, validateEnv } from '@yomi/shared'
import { z } from 'zod'

const articleServiceEnvSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().min(1).max(65535).default(50053),
  DATABASE_URL: z.string().default('postgresql://localhost:5432/yomi_articles'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  ARTICLE_CACHE_TTL: z.coerce.number().int().min(60).default(3600), // 1 hour in seconds
})

export const env = validateEnv(articleServiceEnvSchema)
export type ArticleServiceEnv = z.infer<typeof articleServiceEnvSchema>
