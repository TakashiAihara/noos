import type { CategorySummary, GrowthPoint, TrendingItem } from '@meguru/types';
import {
  iterateSnapshotRecords,
  listSnapshotDates,
  readAggregated,
  writeAggregated,
} from './r2.js';

// ----------------------------------------------------------------
// Trending
// ----------------------------------------------------------------

/**
 * Compute trending extensions from the latest snapshot.
 * Results are cached in R2 as aggregated/trending-<period>.json.
 */
export async function getTrending(
  bucket: R2Bucket,
  period: 'daily' | 'weekly' | 'monthly',
  limit: number,
): Promise<TrendingItem[]> {
  const cacheKey = `trending-${period}.json`;
  const cached = await readAggregated<TrendingItem[]>(bucket, cacheKey);
  if (cached) return cached.slice(0, limit);

  const dates = await listSnapshotDates(bucket);
  const date = dates[0];
  if (!date) return [];

  const items: TrendingItem[] = [];

  for await (const record of iterateSnapshotRecords(bucket, date)) {
    items.push({
      extension_id: record.extension_id,
      name: record.name,
      display_name: record.display_name,
      publisher_name: record.publisher_name,
      install_count: record.install_count,
      trending_weekly: record.trending_weekly,
      trending_daily: record.trending_daily,
      trending_monthly: record.trending_monthly,
      average_rating: record.average_rating,
      categories: record.categories,
    });
  }

  const sortField =
    period === 'daily'
      ? 'trending_daily'
      : period === 'monthly'
        ? 'trending_monthly'
        : 'trending_weekly';

  items.sort((a, b) => (b[sortField] ?? 0) - (a[sortField] ?? 0));

  await writeAggregated(bucket, cacheKey, items);
  return items.slice(0, limit);
}

// ----------------------------------------------------------------
// Growth
// ----------------------------------------------------------------

/**
 * Growth history for a single extension across recent dates.
 * Checks per-extension cache first.
 */
export async function getGrowth(
  bucket: R2Bucket,
  extensionId: string,
  days: number,
): Promise<GrowthPoint[]> {
  const allDates = await listSnapshotDates(bucket);
  const latestDate = allDates[0];
  if (!latestDate) return [];

  // Cache key includes latestDate + days window to avoid stale results
  const cacheKey = `growth/${latestDate}/${days}/${extensionId}.json`;
  const cached = await readAggregated<GrowthPoint[]>(bucket, cacheKey);
  if (cached) return cached;

  const dates = allDates.slice(0, days);
  const points: GrowthPoint[] = [];

  for (const date of dates) {
    for await (const record of iterateSnapshotRecords(bucket, date)) {
      if (record.extension_id === extensionId) {
        points.push({
          date,
          install_count: record.install_count,
          trending_weekly: record.trending_weekly,
        });
        break;
      }
    }
  }

  points.sort((a, b) => a.date.localeCompare(b.date));
  await writeAggregated(bucket, cacheKey, points);
  return points;
}

// ----------------------------------------------------------------
// Categories
// ----------------------------------------------------------------

export async function getCategories(bucket: R2Bucket): Promise<CategorySummary[]> {
  const cacheKey = 'categories.json';
  const cached = await readAggregated<CategorySummary[]>(bucket, cacheKey);
  if (cached) return cached;

  const dates = await listSnapshotDates(bucket);
  const date = dates[0];
  if (!date) return [];

  const categoryMap = new Map<string, { count: number; installs: number }>();

  for await (const record of iterateSnapshotRecords(bucket, date)) {
    for (const category of record.categories) {
      const existing = categoryMap.get(category) ?? { count: 0, installs: 0 };
      existing.count++;
      existing.installs += record.install_count ?? 0;
      categoryMap.set(category, existing);
    }
  }

  const result: CategorySummary[] = [...categoryMap.entries()]
    .map(([category, { count, installs }]) => ({
      category,
      total_extensions: count,
      total_installs: installs,
    }))
    .sort((a, b) => b.total_installs - a.total_installs);

  await writeAggregated(bucket, cacheKey, result);
  return result;
}

// ----------------------------------------------------------------
// Search
// ----------------------------------------------------------------

export async function searchExtensions(bucket: R2Bucket, query: string, maxResults = 50) {
  const dates = await listSnapshotDates(bucket);
  const date = dates[0];
  if (!date) return [];

  const lowerQuery = query.toLowerCase();
  const results = [];

  for await (const record of iterateSnapshotRecords(bucket, date)) {
    const matches =
      record.name.toLowerCase().includes(lowerQuery) ||
      record.display_name.toLowerCase().includes(lowerQuery) ||
      record.short_description?.toLowerCase().includes(lowerQuery) ||
      record.categories.some((c) => c.toLowerCase().includes(lowerQuery)) ||
      record.tags.some((t) => t.toLowerCase().includes(lowerQuery));

    if (matches) {
      results.push({
        extension_id: record.extension_id,
        name: record.name,
        display_name: record.display_name,
        publisher_name: record.publisher_name,
        short_description: record.short_description,
        install_count: record.install_count,
        average_rating: record.average_rating,
        categories: record.categories,
      });
      if (results.length >= maxResults) break;
    }
  }

  return results;
}

// ----------------------------------------------------------------
// Invalidate aggregated caches (after collection completes)
// ----------------------------------------------------------------

export async function invalidateCaches(bucket: R2Bucket): Promise<void> {
  const keys = [
    'vscode-marketplace/aggregated/trending-daily.json',
    'vscode-marketplace/aggregated/trending-weekly.json',
    'vscode-marketplace/aggregated/trending-monthly.json',
    'vscode-marketplace/aggregated/categories.json',
  ];
  await Promise.all(keys.map((k) => bucket.delete(k)));
}
