import type { ExtensionSnapshot } from '@meguru/types';
import { Hono } from 'hono';
import {
  getCategories,
  getGrowth,
  getTrending,
  invalidateCaches,
  searchExtensions,
} from './aggregate.js';
import { writeSnapshotChunk } from './r2.js';

interface Env {
  VSCODE_MARKETPLACE_BUCKET: R2Bucket;
}

const app = new Hono<{ Bindings: Env }>();

// ----------------------------------------------------------------
// POST /write  — collector writes snapshot batches here
// Body: { date: string; records: ExtensionSnapshot[] }
// ----------------------------------------------------------------
app.post('/write', async (c) => {
  const { date, records } = await c.req.json<{
    date: string;
    records: ExtensionSnapshot[];
  }>();

  if (!date || !Array.isArray(records)) {
    return c.json({ error: 'date and records are required' }, 400);
  }

  await writeSnapshotChunk(c.env.VSCODE_MARKETPLACE_BUCKET, date, records);
  return c.json({ ok: true, count: records.length });
});

// ----------------------------------------------------------------
// POST /invalidate  — called after collection completes
// ----------------------------------------------------------------
app.post('/invalidate', async (c) => {
  await invalidateCaches(c.env.VSCODE_MARKETPLACE_BUCKET);
  return c.json({ ok: true });
});

// ----------------------------------------------------------------
// GET /trending?period=weekly&limit=50
// ----------------------------------------------------------------
app.get('/trending', async (c) => {
  const period = (c.req.query('period') ?? 'weekly') as 'daily' | 'weekly' | 'monthly';
  const limit = Math.min(Number(c.req.query('limit') ?? '50'), 500);
  const result = await getTrending(c.env.VSCODE_MARKETPLACE_BUCKET, period, limit);
  return c.json(result);
});

// ----------------------------------------------------------------
// GET /growth/:extensionId?days=30
// ----------------------------------------------------------------
app.get('/growth/:extensionId', async (c) => {
  const extensionId = c.req.param('extensionId');
  const days = Math.min(Number(c.req.query('days') ?? '30'), 365);
  const result = await getGrowth(c.env.VSCODE_MARKETPLACE_BUCKET, extensionId, days);
  return c.json(result);
});

// ----------------------------------------------------------------
// GET /categories
// ----------------------------------------------------------------
app.get('/categories', async (c) => {
  const result = await getCategories(c.env.VSCODE_MARKETPLACE_BUCKET);
  return c.json(result);
});

// ----------------------------------------------------------------
// GET /search?q=<keyword>&limit=50
// ----------------------------------------------------------------
app.get('/search', async (c) => {
  const query = c.req.query('q') ?? '';
  const limit = Math.min(Number(c.req.query('limit') ?? '50'), 200);
  if (!query) return c.json({ error: 'q is required' }, 400);
  const result = await searchExtensions(c.env.VSCODE_MARKETPLACE_BUCKET, query, limit);
  return c.json(result);
});

export default app;
