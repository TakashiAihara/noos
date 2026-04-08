import {
  type QueryOptions,
  type RawExtension,
  SortBy,
  getStat,
  queryExtensions,
} from "./marketplace-api.js";
import { getDb, insertSnapshot, upsertExtension } from "./db.js";

const PAGE_SIZE = 100;
const DELAY_MS = 5000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function processExtension(
  ext: RawExtension,
  snapshotDate: string,
): Promise<void> {
  await upsertExtension({
    id: ext.extensionId,
    name: `${ext.publisher.publisherName}.${ext.extensionName}`,
    display_name: ext.displayName,
    publisher_id: ext.publisher.publisherId,
    publisher_name: ext.publisher.publisherName,
    publisher_display_name: ext.publisher.displayName,
    short_description: ext.shortDescription ?? null,
    published_date: ext.publishedDate,
    categories: ext.categories?.join(",") ?? null,
    tags: ext.tags?.join(",") ?? null,
  });

  await insertSnapshot({
    extension_id: ext.extensionId,
    snapshot_date: snapshotDate,
    install_count: getStat(ext, "install") ?? null,
    download_count: getStat(ext, "downloadCount") ?? null,
    average_rating: getStat(ext, "averagerating") ?? null,
    rating_count: getStat(ext, "ratingcount") ?? null,
    trending_daily: getStat(ext, "trendingdaily") ?? null,
    trending_weekly: getStat(ext, "trendingweekly") ?? null,
    trending_monthly: getStat(ext, "trendingmonthly") ?? null,
    update_count: getStat(ext, "updateCount") ?? null,
    latest_version: ext.versions[0]?.version ?? null,
    last_updated: ext.lastUpdated ?? null,
  });
}

export async function collect(): Promise<void> {
  const snapshotDate = todayISO();
  const db = getDb();
  let page = 1;
  let total = 0;

  console.log(`Starting full collection: date=${snapshotDate}`);

  while (true) {
    const options: QueryOptions = {
      sortBy: SortBy.Installs,
      pageSize: PAGE_SIZE,
      pageNumber: page,
    };

    console.log(`  page ${page}...`);
    const extensions = await queryExtensions(options);

    if (extensions.length === 0) {
      console.log("  no more results, done.");
      break;
    }

    await db.begin(async () => {
      for (const ext of extensions) {
        await processExtension(ext, snapshotDate);
      }
    });

    total += extensions.length;
    console.log(`  saved ${extensions.length} (total: ${total})`);

    if (extensions.length < PAGE_SIZE) {
      break;
    }

    await sleep(DELAY_MS);
    page++;
  }

  console.log(`Collection complete. Total: ${total} extensions`);
}
