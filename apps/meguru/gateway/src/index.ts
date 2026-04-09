import { Hono } from 'hono';
import { cors } from 'hono/cors';

interface Env {
  REPOSITORY: Fetcher;
}

const app = new Hono<{ Bindings: Env }>();

// Allow all origins (CLI + browser)
app.use('/api/*', cors());

// ----------------------------------------------------------------
// Helper: forward to repository via Service Binding
// ----------------------------------------------------------------
function repo(env: Env, path: string): Promise<Response> {
  return env.REPOSITORY.fetch(`http://internal${path}`);
}

// ----------------------------------------------------------------
// GET /api/trending?period=weekly&limit=20
// ----------------------------------------------------------------
app.get('/api/trending', async (c) => {
  const period = c.req.query('period') ?? 'weekly';
  const limit = c.req.query('limit') ?? '20';
  const res = await repo(c.env, `/trending?period=${period}&limit=${limit}`);
  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
});

// ----------------------------------------------------------------
// GET /api/growth?id=<extensionId>&days=30
// ----------------------------------------------------------------
app.get('/api/growth', async (c) => {
  const id = c.req.query('id');
  if (!id) return c.json({ error: 'id is required' }, 400);
  const days = c.req.query('days') ?? '30';
  const res = await repo(c.env, `/growth/${encodeURIComponent(id)}?days=${days}`);
  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
});

// ----------------------------------------------------------------
// GET /api/categories
// ----------------------------------------------------------------
app.get('/api/categories', async (c) => {
  const res = await repo(c.env, '/categories');
  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
});

// ----------------------------------------------------------------
// GET /api/search?q=<keyword>&limit=50
// ----------------------------------------------------------------
app.get('/api/search', async (c) => {
  const q = c.req.query('q');
  if (!q) return c.json({ error: 'q is required' }, 400);
  const limit = c.req.query('limit') ?? '50';
  const res = await repo(c.env, `/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
});

// ----------------------------------------------------------------
// GET /health
// ----------------------------------------------------------------
app.get('/health', (c) => c.json({ ok: true }));

export default app;
