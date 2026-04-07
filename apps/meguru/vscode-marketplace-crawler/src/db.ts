import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

const DB_PATH = path.join(
  import.meta.dirname,
  "..",
  "data",
  "marketplace.db",
);

export function initDb(): Database {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });

  const db = new Database(DB_PATH, { create: true });
  db.exec("PRAGMA journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS extensions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      display_name TEXT NOT NULL,
      publisher_id TEXT NOT NULL,
      publisher_name TEXT NOT NULL,
      publisher_display_name TEXT NOT NULL,
      short_description TEXT,
      published_date TEXT NOT NULL,
      categories TEXT,
      tags TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      extension_id TEXT NOT NULL REFERENCES extensions(id),
      snapshot_date TEXT NOT NULL,
      install_count REAL,
      download_count REAL,
      average_rating REAL,
      rating_count REAL,
      trending_daily REAL,
      trending_weekly REAL,
      trending_monthly REAL,
      update_count REAL,
      latest_version TEXT,
      last_updated TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(extension_id, snapshot_date)
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_date
      ON daily_snapshots(snapshot_date);
    CREATE INDEX IF NOT EXISTS idx_snapshots_ext_date
      ON daily_snapshots(extension_id, snapshot_date);
  `);

  return db;
}

export interface ExtensionRow {
  id: string;
  name: string;
  display_name: string;
  publisher_id: string;
  publisher_name: string;
  publisher_display_name: string;
  short_description: string | null;
  published_date: string;
  categories: string | null;
  tags: string | null;
}

export interface SnapshotRow {
  extension_id: string;
  snapshot_date: string;
  install_count: number | null;
  download_count: number | null;
  average_rating: number | null;
  rating_count: number | null;
  trending_daily: number | null;
  trending_weekly: number | null;
  trending_monthly: number | null;
  update_count: number | null;
  latest_version: string | null;
  last_updated: string | null;
}

export function upsertExtension(db: Database, row: ExtensionRow) {
  db.prepare(`
    INSERT INTO extensions (id, name, display_name, publisher_id, publisher_name, publisher_display_name, short_description, published_date, categories, tags)
    VALUES ($id, $name, $display_name, $publisher_id, $publisher_name, $publisher_display_name, $short_description, $published_date, $categories, $tags)
    ON CONFLICT(id) DO UPDATE SET
      display_name = excluded.display_name,
      short_description = excluded.short_description,
      categories = excluded.categories,
      tags = excluded.tags
  `).run({
    $id: row.id,
    $name: row.name,
    $display_name: row.display_name,
    $publisher_id: row.publisher_id,
    $publisher_name: row.publisher_name,
    $publisher_display_name: row.publisher_display_name,
    $short_description: row.short_description,
    $published_date: row.published_date,
    $categories: row.categories,
    $tags: row.tags,
  });
}

export function insertSnapshot(db: Database, row: SnapshotRow) {
  db.prepare(`
    INSERT INTO daily_snapshots (extension_id, snapshot_date, install_count, download_count, average_rating, rating_count, trending_daily, trending_weekly, trending_monthly, update_count, latest_version, last_updated)
    VALUES ($extension_id, $snapshot_date, $install_count, $download_count, $average_rating, $rating_count, $trending_daily, $trending_weekly, $trending_monthly, $update_count, $latest_version, $last_updated)
    ON CONFLICT(extension_id, snapshot_date) DO UPDATE SET
      install_count = excluded.install_count,
      download_count = excluded.download_count,
      average_rating = excluded.average_rating,
      rating_count = excluded.rating_count,
      trending_daily = excluded.trending_daily,
      trending_weekly = excluded.trending_weekly,
      trending_monthly = excluded.trending_monthly,
      update_count = excluded.update_count,
      latest_version = excluded.latest_version,
      last_updated = excluded.last_updated
  `).run({
    $extension_id: row.extension_id,
    $snapshot_date: row.snapshot_date,
    $install_count: row.install_count,
    $download_count: row.download_count,
    $average_rating: row.average_rating,
    $rating_count: row.rating_count,
    $trending_daily: row.trending_daily,
    $trending_weekly: row.trending_weekly,
    $trending_monthly: row.trending_monthly,
    $update_count: row.update_count,
    $latest_version: row.latest_version,
    $last_updated: row.last_updated,
  });
}
