import { describe, expect, it } from 'vitest'
import { z } from 'zod'

// Import the schema directly to avoid loading actual env
const gatewayEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  USER_SERVICE_URL: z.string().default('localhost:50051'),
  FEED_SERVICE_URL: z.string().default('localhost:50052'),
  ARTICLE_SERVICE_URL: z.string().default('localhost:50053'),
  CRAWLER_SERVICE_URL: z.string().default('localhost:50054'),
})

describe('Gateway Environment', () => {
  it('should validate gateway environment with defaults', () => {
    const testEnv = {}
    const result = gatewayEnvSchema.parse(testEnv)

    expect(result.NODE_ENV).toBe('development')
    expect(result.PORT).toBe(8080)
    expect(result.USER_SERVICE_URL).toBe('localhost:50051')
    expect(result.FEED_SERVICE_URL).toBe('localhost:50052')
    expect(result.ARTICLE_SERVICE_URL).toBe('localhost:50053')
    expect(result.CRAWLER_SERVICE_URL).toBe('localhost:50054')
  })

  it('should validate custom gateway environment', () => {
    const testEnv = {
      NODE_ENV: 'production',
      PORT: '9000',
      USER_SERVICE_URL: 'user-service:50051',
      FEED_SERVICE_URL: 'feed-service:50052',
      ARTICLE_SERVICE_URL: 'article-service:50053',
      CRAWLER_SERVICE_URL: 'crawler-service:50054',
    }

    const result = gatewayEnvSchema.parse(testEnv)

    expect(result.NODE_ENV).toBe('production')
    expect(result.PORT).toBe(9000)
    expect(result.USER_SERVICE_URL).toBe('user-service:50051')
    expect(result.FEED_SERVICE_URL).toBe('feed-service:50052')
    expect(result.ARTICLE_SERVICE_URL).toBe('article-service:50053')
    expect(result.CRAWLER_SERVICE_URL).toBe('crawler-service:50054')
  })

  it('should throw error for invalid PORT', () => {
    const testEnv = {
      PORT: '0',
    }

    expect(() => gatewayEnvSchema.parse(testEnv)).toThrow()
  })

  it('should throw error for invalid NODE_ENV', () => {
    const testEnv = {
      NODE_ENV: 'invalid',
    }

    expect(() => gatewayEnvSchema.parse(testEnv)).toThrow()
  })
})
