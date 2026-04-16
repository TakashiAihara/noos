import type { ExtensionSnapshot } from '@meguru/types';

const R2_PREFIX = 'vscode-marketplace';

// ----------------------------------------------------------------
// Write
// ----------------------------------------------------------------

/**
 * Write a batch of ExtensionSnapshot records to R2 as NDJSON.
 * Each batch is stored as a deterministic chunk file:
 *   vscode-marketplace/snapshots/<date>/<chunkId>.ndjson
 * Using a deterministic chunkId (e.g. "page-1") ensures retries overwrite
 * rather than appending duplicate records.
 */
export async function writeSnapshotChunk(
  bucket: R2Bucket,
  date: string,
  chunkId: string,
  records: ExtensionSnapshot[],
): Promise<void> {
  const ndjson = records.map((r) => JSON.stringify(r)).join('\n');
  const key = `${R2_PREFIX}/snapshots/${date}/${chunkId}.ndjson`;
  await bucket.put(key, ndjson, {
    httpMetadata: { contentType: 'application/x-ndjson' },
  });
}

// ----------------------------------------------------------------
// Aggregated cache helpers
// ----------------------------------------------------------------

export async function readAggregated<T>(bucket: R2Bucket, key: string): Promise<T | null> {
  const obj = await bucket.get(`${R2_PREFIX}/aggregated/${key}`);
  if (!obj) return null;
  try {
    return (await obj.json()) as T;
  } catch {
    return null;
  }
}

export async function writeAggregated(bucket: R2Bucket, key: string, data: unknown): Promise<void> {
  try {
    await bucket.put(`${R2_PREFIX}/aggregated/${key}`, JSON.stringify(data), {
      httpMetadata: { contentType: 'application/json' },
    });
  } catch (err) {
    console.error(`[r2] Failed to write aggregated cache ${key}:`, err);
    throw err;
  }
}

// ----------------------------------------------------------------
// Snapshot iteration
// ----------------------------------------------------------------

/**
 * Iterate over all ExtensionSnapshot records for a given date.
 * Reads all chunk files with prefix vscode-marketplace/snapshots/<date>/.
 */
export async function* iterateSnapshotRecords(
  bucket: R2Bucket,
  date: string,
): AsyncGenerator<ExtensionSnapshot> {
  const prefix = `${R2_PREFIX}/snapshots/${date}/`;
  let cursor: string | undefined;

  do {
    const listed = await bucket.list(cursor ? { prefix, cursor } : { prefix });

    for (const obj of listed.objects) {
      try {
        const file = await bucket.get(obj.key);
        if (!file) continue;
        const text = await file.text();
        for (const line of text.split('\n')) {
          const trimmed = line.trim();
          if (trimmed) {
            try {
              yield JSON.parse(trimmed) as ExtensionSnapshot;
            } catch (err) {
              console.warn(`[r2] Skipping malformed NDJSON line in ${obj.key}:`, err);
            }
          }
        }
      } catch (err) {
        console.warn(`[r2] Failed to read chunk ${obj.key}, skipping:`, err);
      }
    }

    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);
}

/**
 * List available snapshot dates (most recent first).
 */
export async function listSnapshotDates(bucket: R2Bucket): Promise<string[]> {
  const prefix = `${R2_PREFIX}/snapshots/`;
  const dateSet = new Set<string>();
  let cursor: string | undefined;

  do {
    const listed = await bucket.list(
      cursor ? { prefix, delimiter: '/', cursor } : { prefix, delimiter: '/' },
    );
    for (const cp of listed.delimitedPrefixes) {
      const date = cp.replace(prefix, '').replace('/', '');
      if (date) dateSet.add(date);
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);

  return [...dateSet].sort().reverse();
}
