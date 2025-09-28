import { describe, expect, it } from 'vitest'
import { z } from 'zod'

const userServiceEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(50051),
  DATABASE_URL: z.string().default('postgresql://localhost:5432/yomi_users'),
  JWT_SECRET: z.string().min(32).default('development-secret-key-change-in-production'),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
})

describe('User Service Environment', () => {
  it('should validate user service environment with defaults', () => {
    const testEnv = {}
    const result = userServiceEnvSchema.parse(testEnv)

    expect(result.NODE_ENV).toBe('development')
    expect(result.PORT).toBe(50051)
    expect(result.DATABASE_URL).toBe('postgresql://localhost:5432/yomi_users')
    expect(result.JWT_SECRET).toBe('development-secret-key-change-in-production')
  })

  it('should validate custom user service environment', () => {
    const testEnv = {
      NODE_ENV: 'production',
      PORT: '51051',
      DATABASE_URL: 'postgresql://db:5432/yomi_users_prod',
      JWT_SECRET: 'super-secret-production-key-with-sufficient-length',
      NEXTAUTH_SECRET: 'nextauth-secret',
      NEXTAUTH_URL: 'https://example.com',
    }

    const result = userServiceEnvSchema.parse(testEnv)

    expect(result.NODE_ENV).toBe('production')
    expect(result.PORT).toBe(51051)
    expect(result.DATABASE_URL).toBe('postgresql://db:5432/yomi_users_prod')
    expect(result.JWT_SECRET).toBe('super-secret-production-key-with-sufficient-length')
    expect(result.NEXTAUTH_SECRET).toBe('nextauth-secret')
    expect(result.NEXTAUTH_URL).toBe('https://example.com')
  })

  it('should throw error for short JWT_SECRET', () => {
    const testEnv = {
      JWT_SECRET: 'short',
    }

    expect(() => userServiceEnvSchema.parse(testEnv)).toThrow()
  })

  it('should throw error for invalid NEXTAUTH_URL', () => {
    const testEnv = {
      NEXTAUTH_URL: 'not-a-url',
    }

    expect(() => userServiceEnvSchema.parse(testEnv)).toThrow()
  })
})
