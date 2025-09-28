import { baseEnvSchema, validateEnv } from '@yomi/shared'
import { z } from 'zod'

const gatewayEnvSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  USER_SERVICE_URL: z.string().default('localhost:50051'),
  FEED_SERVICE_URL: z.string().default('localhost:50052'),
  ARTICLE_SERVICE_URL: z.string().default('localhost:50053'),
  CRAWLER_SERVICE_URL: z.string().default('localhost:50054'),
})

export const env = validateEnv(gatewayEnvSchema)
export type GatewayEnv = z.infer<typeof gatewayEnvSchema>
