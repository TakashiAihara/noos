# ADR: NDJSON データスキーマ定義

## Status

Accepted (2026-04-09)

## Context

Marketplace Gallery API (flags=950) から取得可能な全フィールドを整理し、
R2 に保存する NDJSON のスキーマを定義する。

### API フラグ

```
flags = 950 = 0x3B6
  IncludeFiles (2)
  IncludeCategoryAndTags (4)
  IncludeVersionProperties (64)
  ExcludeNonValidated (128)
  IncludeStatistics (256)
  IncludeLatestVersionOnly (512)
```

旧実装の flags=914 では categories/tags が取得できなかった。flags=950 に変更。

## Decision

### NDJSON レコード構造

1行 = 1拡張機能。日次スナップショットファイル (`snapshots/YYYY-MM-DD.ndjson.gz`) に格納。

```typescript
interface ExtensionSnapshot {
  // === 識別 ===
  extension_id: string;            // UUID
  name: string;                    // "publisher.extensionName"
  display_name: string;
  snapshot_date: string;           // "YYYY-MM-DD"

  // === パブリッシャー ===
  publisher_id: string;
  publisher_name: string;
  publisher_display_name: string;
  publisher_domain: string | null;        // NEW: "https://microsoft.com"
  publisher_domain_verified: boolean;     // NEW
  publisher_verified: boolean;            // NEW: flags === "verified"

  // === メタデータ ===
  short_description: string | null;
  categories: string[];                   // NEW (was missing): ["Programming Languages", ...]
  tags: string[];                         // NEW (was missing): ["python", ...]
  published_date: string;                 // ISO 8601
  release_date: string;                   // NEW: 初回リリース日
  last_updated: string;                   // ISO 8601

  // === 統計 (日次変動を追跡) ===
  install_count: number | null;
  download_count: number | null;
  average_rating: number | null;
  rating_count: number | null;
  weighted_rating: number | null;         // NEW: Marketplace 内部のランキングスコア
  trending_daily: number | null;
  trending_weekly: number | null;
  trending_monthly: number | null;
  update_count: number | null;

  // === バージョン情報 ===
  latest_version: string | null;
  target_platform: string | null;         // NEW: "alpine-x64", "web" etc.
  engine: string | null;                  // NEW: VS Code 互換バージョン "^1.95.0"
  is_pre_release: boolean;                // NEW
  pricing: string | null;                 // NEW: "Free" | "Trial" | ...
  executes_code: boolean;                 // NEW: 拡張機能がコードを実行するか

  // === 依存関係グラフ ===
  extension_dependencies: string[];       // NEW: 依存する拡張機能 ID のリスト
  extension_pack: string[];               // NEW: パックに含まれる拡張機能のリスト
  extension_kind: string[];               // NEW: "workspace" | "ui" | "web"
}
```

### 現行 (PostgreSQL) → 新スキーマ 差分

| フィールド | 旧 | 新 | 備考 |
|---|---|---|---|
| categories, tags | CSV 文字列 | 配列 | NDJSON なので自然に配列 |
| publisher_domain | - | ✅ | ドメイン認証情報 |
| publisher_verified | - | ✅ | 認証パブリッシャーの判別 |
| weighted_rating | - | ✅ | Marketplace ランキングスコア |
| release_date | - | ✅ | published_date と別 (初回リリース日) |
| target_platform | - | ✅ | プラットフォーム別分析 |
| engine | - | ✅ | VS Code バージョン互換性追跡 |
| is_pre_release | - | ✅ | プレリリース版の判別 |
| pricing | - | ✅ | 有料/無料の区別 |
| executes_code | - | ✅ | セキュリティ分析 |
| extension_dependencies | - | ✅ | 依存グラフ分析 |
| extension_pack | - | ✅ | パック構成分析 |
| extension_kind | - | ✅ | UI/Workspace/Web 分類 |
| onpremDownloads | - | 除外 | ほぼ全て 0、分析価値なし |
| files (asset URLs) | - | 除外 | サイズ大、分析不要 |
| branding (color/theme) | - | 除外 | トレンド分析に不要 |
| links (GitHub/Support) | - | 除外 | 別途スクレイピングで取得可能 |

### サイズ見積もり

| 項目 | 旧 (flags=914) | 新 (flags=950) |
|---|---|---|
| 1レコード | ~300 bytes | ~500 bytes |
| 1日分 (118k件) | ~35 MB | ~59 MB |
| 1日分 (gzip) | ~4 MB | ~7 MB |
| 年間 (gzip) | ~1.5 GB | ~2.5 GB |

R2 無料枠 (10 GB) 内に収まる。

## Error Handling

### リトライ戦略

- Exponential Backoff: 初回 1s, 2s, 4s, 8s, 16s (5回)
- 5回失敗で該当ページを諦め、収集を途中停止
- Queue (Workers 版) では DLQ にメッセージを退避

### 部分失敗

- 途中停止した場合、次回の日次実行で最初から再収集
- UPSERT なので同日の重複書き込みは安全

## Consequences

### Positive

- 依存関係グラフの分析が可能に（エコシステム可視化）
- 認証パブリッシャーの比率追跡
- プラットフォーム別・有料/無料の分析
- weightedRating で Marketplace 内部ランキングを追跡可能

### Negative

- レコードサイズが ~1.7 倍に増加（年間 +1 GB、R2 無料枠内）
- version properties のパースが必要（オプショナルチェイニングで対応）
