import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { parseEnv } from '@common/config';
import { createApiResponse } from '@common/utils';
import type { ApiResponse } from '@common/types';

// Initialize environment
const env = parseEnv();

// Initialize Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Health check endpoint
app.get('/health', (c) => {
  return c.json(createApiResponse({ status: 'healthy', service: 'suru' }));
});

// Root endpoint
app.get('/', (c) => {
  return c.json(createApiResponse({
    service: 'suru',
    version: '0.0.1',
    description: 'Task management service'
  }));
});

// Tasks endpoints (placeholder)
app.get('/api/tasks', (c) => {
  return c.json(createApiResponse({
    tasks: [],
    total: 0
  }));
});

app.post('/api/tasks', async (c) => {
  const body = await c.req.json();
  return c.json(createApiResponse({
    id: '1',
    ...body,
    createdAt: new Date().toISOString()
  }), 201);
});

// 404 handler
app.notFound((c) => {
  const response: ApiResponse<null> = {
    error: 'Not Found',
    status: 'error'
  };
  return c.json(response, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(err);
  const response: ApiResponse<null> = {
    error: err.message || 'Internal Server Error',
    status: 'error'
  };
  return c.json(response, 500);
});

// Start server
const port = 3003;
serve({
  fetch: app.fetch,
  port
});

console.log(`🚀 Suru API running on http://localhost:${port}`);