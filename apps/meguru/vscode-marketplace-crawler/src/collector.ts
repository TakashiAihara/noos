import type { Database } from "bun:sqlite";
import {
  type QueryOptions,
  type RawExtension,
  SortBy,
  type SortByValue,
  getStat,
  queryExtensions,
} from "./marketplace-api.js";
import { insertSnapshot, upsertExtension } from "./db.js";

const PAGE_SIZE = 100;
const MAX_PAGES = 10;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function processExtension(
  db: Database.Database,
  ext: RawExtension,
  snapshotDate: string,
) {
  upsertExtension(db, {
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

  insertSnapshot(db, {
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

async function collectPages(
  db: Database.Database,
  sortBy: SortByValue,
  sortLabel: string,
  maxPages: number,
): Promise<number> {
  let total = 0;
  const snapshotDate = todayISO();

  for (let page = 1; page <= maxPages; page++) {
    const options: QueryOptions = {
      sortBy,
      pageSize: PAGE_SIZE,
      pageNumber: page,
    };

    console.log(`  [${sortLabel}] page ${page}/${maxPages}...`);
    const extensions = await queryExtensions(options);

    if (extensions.length === 0) {
      console.log(`  [${sortLabel}] no more results`);
      break;
    }

    const tx = db.transaction(() => {
      for (const ext of extensions) {
        processExtension(db, ext, snapshotDate);
      }
    });
    tx();

    total += extensions.length;
    console.log(
      `  [${sortLabel}] saved ${extensions.length} extensions (total: ${total})`,
    );
  }

  return total;
}

export type SortMode = "all" | "trending" | "installs";

export async function collect(
  db: Database.Database,
  mode: SortMode = "all",
  maxPages = MAX_PAGES,
): Promise<void> {
  console.log(
    `Starting collection: mode=${mode}, maxPages=${maxPages}, date=${todayISO()}`,
  );

  const sorts: Array<{ sortBy: SortByValue; label: string }> = [];

  if (mode === "all" || mode === "installs") {
    sorts.push({ sortBy: SortBy.Installs, label: "installs" });
  }
  if (mode === "all" || mode === "trending") {
    sorts.push(
      { sortBy: SortBy.TrendingDaily, label: "trending-daily" },
      { sortBy: SortBy.TrendingWeekly, label: "trending-weekly" },
      { sortBy: SortBy.TrendingMonthly, label: "trending-monthly" },
    );
  }

  let grandTotal = 0;
  for (const { sortBy, label } of sorts) {
    const count = await collectPages(db, sortBy, label, maxPages);
    grandTotal += count;
  }

  console.log(`Collection complete. Total records processed: ${grandTotal}`);
}
