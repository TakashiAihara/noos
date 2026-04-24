// ============================================================
// Extension snapshot — 1 record = 1 extension per day
// Stored as NDJSON in R2: vscode-marketplace/snapshots/<date>/<chunk>.ndjson
// ============================================================

export interface ExtensionSnapshot {
  // === 識別 ===
  extension_id: string; // UUID
  name: string; // "publisher.extensionName"
  display_name: string;
  snapshot_date: string; // "YYYY-MM-DD"

  // === パブリッシャー ===
  publisher_id: string;
  publisher_name: string;
  publisher_display_name: string;
  publisher_domain: string | null;
  publisher_domain_verified: boolean;
  publisher_verified: boolean;

  // === メタデータ ===
  short_description: string | null;
  categories: string[];
  tags: string[];
  published_date: string; // ISO 8601
  release_date: string; // 初回リリース日
  last_updated: string; // ISO 8601

  // === 統計 (日次変動を追跡) ===
  install_count: number | null;
  download_count: number | null;
  average_rating: number | null;
  rating_count: number | null;
  weighted_rating: number | null;
  trending_daily: number | null;
  trending_weekly: number | null;
  trending_monthly: number | null;
  update_count: number | null;

  // === バージョン情報 ===
  latest_version: string | null;
  target_platform: string | null;
  engine: string | null; // VS Code 互換バージョン e.g. "^1.95.0"
  is_pre_release: boolean;
  pricing: string | null; // "Free" | "Trial" | ...
  executes_code: boolean;

  // === 依存関係グラフ ===
  extension_dependencies: string[];
  extension_pack: string[];
  extension_kind: string[]; // "workspace" | "ui" | "web"
}

// ============================================================
// API response types (gateway → cli / browser)
// ============================================================

export interface TrendingItem {
  extension_id: string;
  name: string;
  display_name: string;
  publisher_name: string;
  install_count: number | null;
  trending_weekly: number | null;
  trending_daily: number | null;
  trending_monthly: number | null;
  average_rating: number | null;
  categories: string[];
}

export interface GrowthPoint {
  date: string;
  install_count: number | null;
  trending_weekly: number | null;
}

export interface CategorySummary {
  category: string;
  total_extensions: number;
  total_installs: number;
}

export interface SearchResult {
  extension_id: string;
  name: string;
  display_name: string;
  publisher_name: string;
  short_description: string | null;
  install_count: number | null;
  average_rating: number | null;
  categories: string[];
}

// ============================================================
// Queue message shape (collector → Queue)
// ============================================================

export interface CrawlQueueMessage {
  pageNumber: number;
  snapshotDate: string;
}
