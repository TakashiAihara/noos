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
  try {
    const qs = new URLSearchParams({
      period: c.req.query('period') ?? 'weekly',
      limit: c.req.query('limit') ?? '20',
    }).toString();
    const res = await repo(c.env, `/trending?${qs}`);
    return new Response(res.body, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[gateway] /api/trending error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ----------------------------------------------------------------
// GET /api/growth?id=<extensionId>&days=30
// ----------------------------------------------------------------
app.get('/api/growth', async (c) => {
  try {
    const id = c.req.query('id');
    if (!id) return c.json({ error: 'id is required' }, 400);
    const qs = new URLSearchParams({ days: c.req.query('days') ?? '30' }).toString();
    const res = await repo(c.env, `/growth/${encodeURIComponent(id)}?${qs}`);
    return new Response(res.body, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[gateway] /api/growth error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ----------------------------------------------------------------
// GET /api/categories
// ----------------------------------------------------------------
app.get('/api/categories', async (c) => {
  try {
    const res = await repo(c.env, '/categories');
    return new Response(res.body, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[gateway] /api/categories error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ----------------------------------------------------------------
// GET /api/search?q=<keyword>&limit=50
// ----------------------------------------------------------------
app.get('/api/search', async (c) => {
  try {
    const q = c.req.query('q');
    if (!q) return c.json({ error: 'q is required' }, 400);
    const qs = new URLSearchParams({ q, limit: c.req.query('limit') ?? '50' }).toString();
    const res = await repo(c.env, `/search?${qs}`);
    return new Response(res.body, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[gateway] /api/search error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ----------------------------------------------------------------
// GET /health
// ----------------------------------------------------------------
app.get('/health', (c) => c.json({ ok: true }));

export default app;
