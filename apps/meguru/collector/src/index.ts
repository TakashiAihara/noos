import type { CrawlQueueMessage } from '@meguru/types';
import { Hono } from 'hono';
import { SortBy, queryExtensions, toExtensionSnapshot } from './marketplace-api.js';

interface Env {
  REPOSITORY: Fetcher;
  CRAWL_QUEUE: Queue<CrawlQueueMessage>;
}

const PAGE_SIZE = 100;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ----------------------------------------------------------------
// HTTP handler (manual trigger / health check)
// ----------------------------------------------------------------
const app = new Hono<{ Bindings: Env }>();

app.get('/trigger', async (c) => {
  await enqueueFirstPage(c.env, todayISO());
  return c.json({ ok: true, message: 'Collection triggered' });
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
    // Invalidate caches now that collection is done
    await env.REPOSITORY.fetch('http://internal/invalidate', { method: 'POST' });
    return;
  }

  const records = extensions.map((ext) => toExtensionSnapshot(ext, snapshotDate));

  const res = await env.REPOSITORY.fetch('http://internal/write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: snapshotDate, records }),
  });

  if (!res.ok) {
    throw new Error(`Repository write failed: ${res.status} ${res.statusText}`);
  }

  console.log(`[collector] Page ${pageNumber}: wrote ${records.length} records`);

  // Enqueue next page if there are more results
  if (extensions.length === PAGE_SIZE) {
    await env.CRAWL_QUEUE.send({ pageNumber: pageNumber + 1, snapshotDate });
  } else {
    // Last page — invalidate caches
    await env.REPOSITORY.fetch('http://internal/invalidate', { method: 'POST' });
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
    await enqueueFirstPage(env, todayISO());
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
