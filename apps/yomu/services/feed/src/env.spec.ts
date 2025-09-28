import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

describe('Feed Service Environment', () => {
  it('should validate environment variables', async () => {
    // Store original env
    const originalEnv = process.env

    // Mock environment variables
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      PORT: '50052',
    }

    // Dynamic import to get fresh module
    vi.resetModules()
    const { env } = await import('./env')

    expect(env.NODE_ENV).toBe('test')
    expect(env.PORT).toBe(50052)

    // Restore original env
    process.env = originalEnv
  })

  it('should use default values when not provided', async () => {
    const originalEnv = process.env

    process.env = {
      NODE_ENV: 'test',
    }

    vi.resetModules()
    const { env } = await import('./env')

    expect(env.PORT).toBe(50052)

    process.env = originalEnv
  })

  it('should throw on invalid PORT', async () => {
    const originalEnv = process.env

    process.env = {
      ...originalEnv,
      PORT: 'invalid',
    }

    vi.resetModules()

    await expect(async () => await import('./env')).rejects.toThrow()

    process.env = originalEnv
  })

  it('should throw on PORT out of range', async () => {
    const originalEnv = process.env

    process.env = {
      ...originalEnv,
      PORT: '99999',
    }

    vi.resetModules()

    await expect(async () => await import('./env')).rejects.toThrow()

    process.env = originalEnv
  })
})
