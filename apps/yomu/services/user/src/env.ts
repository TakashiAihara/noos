import { baseEnvSchema, validateEnv } from '@yomi/shared'
import { z } from 'zod'

const userServiceEnvSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().min(1).max(65535).default(50051),
  DATABASE_URL: z.string().default('postgresql://localhost:5432/yomi_users'),
  JWT_SECRET: z.string().min(32).default('development-secret-key-change-in-production'),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
})

export const env = validateEnv(userServiceEnvSchema)
export type UserServiceEnv = z.infer<typeof userServiceEnvSchema>
