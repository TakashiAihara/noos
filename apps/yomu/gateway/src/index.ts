import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { env } from './env'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'gateway',
    environment: env.NODE_ENV,
    services: {
      user: env.USER_SERVICE_URL,
      feed: env.FEED_SERVICE_URL,
      article: env.ARTICLE_SERVICE_URL,
      crawler: env.CRAWLER_SERVICE_URL,
    },
  })
})

console.log(`API Gateway is running on port ${env.PORT} (${env.NODE_ENV})`)

serve({
  fetch: app.fetch,
  port: env.PORT,
})
