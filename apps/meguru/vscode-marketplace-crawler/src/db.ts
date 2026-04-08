import postgres from "postgres";

const DATABASE_URL =
  process.env["DATABASE_URL"] ??
  "postgres://crawler:crawler@localhost:5432/marketplace";

let sql: postgres.Sql | null = null;

export function getDb(): postgres.Sql {
  if (!sql) {
    sql = postgres(DATABASE_URL);
  }
  return sql;
}

export async function closeDb(): Promise<void> {
  if (sql) {
    await sql.end();
    sql = null;
  }
}

export async function initDb(): Promise<void> {
  const db = getDb();

  await db`
    CREATE TABLE IF NOT EXISTS extensions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      display_name TEXT NOT NULL,
      publisher_id TEXT NOT NULL,
      publisher_name TEXT NOT NULL,
      publisher_display_name TEXT NOT NULL,
      short_description TEXT,
      published_date TIMESTAMPTZ NOT NULL,
      categories TEXT,
      tags TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS daily_snapshots (
      id SERIAL PRIMARY KEY,
      extension_id TEXT NOT NULL REFERENCES extensions(id),
      snapshot_date DATE NOT NULL,
      install_count DOUBLE PRECISION,
      download_count DOUBLE PRECISION,
      average_rating DOUBLE PRECISION,
      rating_count DOUBLE PRECISION,
      trending_daily DOUBLE PRECISION,
      trending_weekly DOUBLE PRECISION,
      trending_monthly DOUBLE PRECISION,
      update_count DOUBLE PRECISION,
      latest_version TEXT,
      last_updated TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(extension_id, snapshot_date)
    )
  `;

  await db`
    CREATE INDEX IF NOT EXISTS idx_snapshots_date
      ON daily_snapshots(snapshot_date)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS idx_snapshots_ext_date
      ON daily_snapshots(extension_id, snapshot_date)
  `;
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

export async function upsertExtension(row: ExtensionRow): Promise<void> {
  const db = getDb();
  await db`
    INSERT INTO extensions (id, name, display_name, publisher_id, publisher_name, publisher_display_name, short_description, published_date, categories, tags)
    VALUES (${row.id}, ${row.name}, ${row.display_name}, ${row.publisher_id}, ${row.publisher_name}, ${row.publisher_display_name}, ${row.short_description}, ${row.published_date}, ${row.categories}, ${row.tags})
    ON CONFLICT(id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      short_description = EXCLUDED.short_description,
      categories = EXCLUDED.categories,
      tags = EXCLUDED.tags
  `;
}

export async function insertSnapshot(row: SnapshotRow): Promise<void> {
  const db = getDb();
  await db`
    INSERT INTO daily_snapshots (extension_id, snapshot_date, install_count, download_count, average_rating, rating_count, trending_daily, trending_weekly, trending_monthly, update_count, latest_version, last_updated)
    VALUES (${row.extension_id}, ${row.snapshot_date}, ${row.install_count}, ${row.download_count}, ${row.average_rating}, ${row.rating_count}, ${row.trending_daily}, ${row.trending_weekly}, ${row.trending_monthly}, ${row.update_count}, ${row.latest_version}, ${row.last_updated})
    ON CONFLICT(extension_id, snapshot_date) DO UPDATE SET
      install_count = EXCLUDED.install_count,
      download_count = EXCLUDED.download_count,
      average_rating = EXCLUDED.average_rating,
      rating_count = EXCLUDED.rating_count,
      trending_daily = EXCLUDED.trending_daily,
      trending_weekly = EXCLUDED.trending_weekly,
      trending_monthly = EXCLUDED.trending_monthly,
      update_count = EXCLUDED.update_count,
      latest_version = EXCLUDED.latest_version,
      last_updated = EXCLUDED.last_updated
  `;
}
