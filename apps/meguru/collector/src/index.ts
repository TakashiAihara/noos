import type { CrawlQueueMessage } from '@meguru/types';
import { Hono } from 'hono';
import { SortBy, queryExtensions, toExtensionSnapshot } from './marketplace-api.js';

interface Env {
  REPOSITORY: Fetcher;
  CRAWL_QUEUE: Queue<CrawlQueueMessage>;
  TRIGGER_SECRET: string;
  INTERNAL_SECRET: string;
}

const PAGE_SIZE = 100;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ----------------------------------------------------------------
// HTTP handler (manual trigger / health check)
// ----------------------------------------------------------------
const app = new Hono<{ Bindings: Env }>();

// POST /trigger — protected by TRIGGER_SECRET env var
app.post('/trigger', async (c) => {
  const provided = c.req.header('X-Trigger-Secret');
  if (!c.env.TRIGGER_SECRET || provided !== c.env.TRIGGER_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  try {
    await enqueueFirstPage(c.env, todayISO());
    return c.json({ ok: true, message: 'Collection triggered' });
  } catch (err) {
    console.error('[collector] /trigger error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

app.get('/health', (c) => c.json({ ok: true }));

// ----------------------------------------------------------------
// Enqueue the first page to kick off collection
// ----------------------------------------------------------------
async function enqueueFirstPage(env: Env, snapshotDate: string): Promise<void> {
  await env.CRAWL_QUEUE.send({ pageNumber: 1, snapshotDate });
  console.log(`[collector] Enqueued page 1 for ${snapshotDate}`);
}

// ----------------------------------------------------------------
// Invalidate caches (checks response status)
// ----------------------------------------------------------------
async function invalidateRepositoryCaches(env: Env): Promise<void> {
  const res = await env.REPOSITORY.fetch('http://internal/invalidate', {
    method: 'POST',
    headers: { 'X-Internal-Secret': env.INTERNAL_SECRET },
  });
  if (!res.ok) {
    throw new Error(`Repository invalidate failed: ${res.status} ${res.statusText}`);
  }
}

// ----------------------------------------------------------------
// Process a single page from the Queue
// ----------------------------------------------------------------
async function processPage(env: Env, pageNumber: number, snapshotDate: string): Promise<void> {
  console.log(`[collector] Processing page ${pageNumber} for ${snapshotDate}`);

  const extensions = await queryExtensions({
    sortBy: SortBy.Installs,
    pageSize: PAGE_SIZE,
    pageNumber,
  });

  if (extensions.length === 0) {
    console.log(`[collector] Page ${pageNumber} empty — collection complete`);
    await invalidateRepositoryCaches(env);
    return;
  }

  const records = extensions.map((ext) => toExtensionSnapshot(ext, snapshotDate));

  const res = await env.REPOSITORY.fetch('http://internal/write', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Secret': env.INTERNAL_SECRET,
    },
    body: JSON.stringify({ date: snapshotDate, chunkId: `page-${pageNumber}`, records }),
  });

  if (!res.ok) {
    throw new Error(`Repository write failed: ${res.status} ${res.statusText}`);
  }

  console.log(`[collector] Page ${pageNumber}: wrote ${records.length} records`);

  if (extensions.length === PAGE_SIZE) {
    await env.CRAWL_QUEUE.send({ pageNumber: pageNumber + 1, snapshotDate });
  } else {
    console.log(`[collector] Collection complete for ${snapshotDate}`);
  }
}

// ----------------------------------------------------------------
// Worker export (fetch + scheduled + queue)
// ----------------------------------------------------------------
export default {
  fetch: app.fetch,

  // Cron Trigger: daily at 03:00 UTC (configured in wrangler.toml)
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    try {
      await enqueueFirstPage(env, todayISO());
    } catch (err) {
      console.error('[collector] scheduled error:', err);
      throw err;
    }
  },

  // Queue consumer: max_batch_size = 1, so one message per invocation
  async queue(
    batch: MessageBatch<CrawlQueueMessage>,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<void> {
    for (const message of batch.messages) {
      try {
        await processPage(env, message.body.pageNumber, message.body.snapshotDate);
        message.ack();
      } catch (err) {
        console.error(`[collector] Failed to process page ${message.body.pageNumber}:`, err);
        message.retry();
      }
    }
  },
};
