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
  INTERNAL_SECRET: string;
}

/** Parse a query param as a bounded integer. Falls back to `fallback` on NaN/out-of-range. */
function parseBoundedInt(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(Math.trunc(n), max));
}

/** Guard state-changing endpoints with a shared secret (set via `wrangler secret put INTERNAL_SECRET`). */
function verifyInternalSecret(
  c: {
    req: { header: (k: string) => string | undefined };
    json: (data: unknown, status?: number) => Response;
  },
  env: Env,
): Response | null {
  const provided = c.req.header('X-Internal-Secret');
  if (!env.INTERNAL_SECRET || provided !== env.INTERNAL_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401) as Response;
  }
  return null;
}

const app = new Hono<{ Bindings: Env }>();

// ----------------------------------------------------------------
// POST /write  — collector writes snapshot batches here
// Body: { date: string; chunkId: string; records: ExtensionSnapshot[] }
// ----------------------------------------------------------------
app.post('/write', async (c) => {
  const authError = verifyInternalSecret(c, c.env);
  if (authError) return authError;

  try {
    const { date, chunkId, records } = await c.req.json<{
      date: string;
      chunkId: string;
      records: ExtensionSnapshot[];
    }>();

    if (!date || !chunkId || !Array.isArray(records)) {
      return c.json({ error: 'date, chunkId and records are required' }, 400);
    }

    await writeSnapshotChunk(c.env.VSCODE_MARKETPLACE_BUCKET, date, chunkId, records);
    return c.json({ ok: true, count: records.length });
  } catch (err) {
    console.error('[repository] /write error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ----------------------------------------------------------------
// POST /invalidate  — called after collection completes
// ----------------------------------------------------------------
app.post('/invalidate', async (c) => {
  const authError = verifyInternalSecret(c, c.env);
  if (authError) return authError;

  try {
    await invalidateCaches(c.env.VSCODE_MARKETPLACE_BUCKET);
    return c.json({ ok: true });
  } catch (err) {
    console.error('[repository] /invalidate error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ----------------------------------------------------------------
// GET /trending?period=weekly&limit=50
// ----------------------------------------------------------------
app.get('/trending', async (c) => {
  try {
    const period = (c.req.query('period') ?? 'weekly') as 'daily' | 'weekly' | 'monthly';
    const limit = parseBoundedInt(c.req.query('limit'), 50, 1, 500);
    const result = await getTrending(c.env.VSCODE_MARKETPLACE_BUCKET, period, limit);
    return c.json(result);
  } catch (err) {
    console.error('[repository] /trending error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ----------------------------------------------------------------
// GET /growth/:extensionId?days=30
// ----------------------------------------------------------------
app.get('/growth/:extensionId', async (c) => {
  try {
    const extensionId = c.req.param('extensionId');
    const days = parseBoundedInt(c.req.query('days'), 30, 1, 365);
    const result = await getGrowth(c.env.VSCODE_MARKETPLACE_BUCKET, extensionId, days);
    return c.json(result);
  } catch (err) {
    console.error('[repository] /growth error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ----------------------------------------------------------------
// GET /categories
// ----------------------------------------------------------------
app.get('/categories', async (c) => {
  try {
    const result = await getCategories(c.env.VSCODE_MARKETPLACE_BUCKET);
    return c.json(result);
  } catch (err) {
    console.error('[repository] /categories error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ----------------------------------------------------------------
// GET /search?q=<keyword>&limit=50
// ----------------------------------------------------------------
app.get('/search', async (c) => {
  try {
    const query = c.req.query('q') ?? '';
    const limit = parseBoundedInt(c.req.query('limit'), 50, 1, 200);
    if (!query) return c.json({ error: 'q is required' }, 400);
    const result = await searchExtensions(c.env.VSCODE_MARKETPLACE_BUCKET, query, limit);
    return c.json(result);
  } catch (err) {
    console.error('[repository] /search error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default app;
