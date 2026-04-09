# ADR: v1.0.0 技術スタック選定

## Status

Accepted (2026-04-09)

## Context

VSCode Marketplace Trend Tracker v1.0.0 の技術スタックを選定する。
Crawler Core と Frontend の2コンポーネントがあり、いずれも Cloudflare 上で動作する。

## Decisions

### Runtime / Platform

| 項目 | 選定 | 理由 |
|---|---|---|
| Runtime | Cloudflare Workers | R2/Queues とネイティブ連携、無料枠大きい |
| Language | TypeScript | 既存モノレポと統一、型安全 |
| Package Manager | Bun | モノレポ全体で統一済み |

### Crawler Core

| 項目 | 選定 | 理由 |
|---|---|---|
| Framework | なし（Raw Workers API） | Cron + Queue ハンドラのみ、フレームワーク不要 |
| Queue | Cloudflare Queues | Workers ネイティブ、ページング制御に最適 |
| Storage | Cloudflare R2 | Workers バインディングで直接アクセス、egress 無料 |
| Data Format | NDJSON (gzip) | Workers 内で生成が容易、DuckDB が直接読める |
| Validation | なし（TypeScript 型定義のみ） | API レスポンスは固定構造、Zod のランタイムコスト不要 |

### Frontend

| 項目 | 選定 | 理由 |
|---|---|---|
| Framework | Hono | Workers ネイティブ対応、軽量、ルーティング・ミドルウェア充実 |
| Analysis | DuckDB-WASM（検討中） | ブラウザ上で NDJSON を直接クエリ可能 |
| UI | Hono JSX + 最小限の CSS | SSR で十分、SPA フレームワーク不要 |
| API | Hono RPC | 型安全な API エンドポイント |

### Storage Worker (Repository)

| 項目 | 選定 | 理由 |
|---|---|---|
| Framework | なし（Raw Workers API） | Service Binding のハンドラのみ |
| Storage | Cloudflare R2 (Workers Binding) | ネイティブ連携、egress 無料 |
| Analysis | DuckDB-WASM | NDJSON を直接クエリ、集計処理を一元化 |

### CLI

| 項目 | 選定 | 理由 |
|---|---|---|
| Runtime | Bun | モノレポ統一、起動が速い |
| HTTP Client | fetch (Bun built-in) | 依存なし |
| Output | JSON (default) / table / text | AI エージェント向けに JSON デフォルト、人間向けに table/text |
| 将来拡張 | MCP Server 対応 | AI ツール連携（Claude Code 等）から直接呼び出し可能に |

### 開発・テスト・CI

| 項目 | 選定 | 理由 |
|---|---|---|
| ローカル開発 | Wrangler | Workers/R2/Queues のローカルエミュレーション |
| テスト | Vitest + @cloudflare/vitest-pool-workers | Workers 環境でのユニットテスト |
| Lint / Format | Biome | モノレポ全体で統一済み |
| Deploy | Wrangler (GitHub Actions) | `wrangler deploy` でCI/CDから自動デプロイ |

## Alternatives Considered

### Data Format: Parquet vs NDJSON

**Parquet:**
- 列指向で分析クエリが高速、圧縮率が高い
- Workers 内で書くには parquet-wasm が必要（バンドルサイズ増、メモリ 128MB 制限）

**NDJSON (gzip):**
- Workers で `JSON.stringify()` + gzip するだけ
- DuckDB は `read_ndjson_auto()` で直接読める
- 圧縮率は Parquet に劣るが、年間 ~1.5GB なので問題なし

→ Workers の制約を考慮し **NDJSON** を採用。将来データ量が増えた場合、バッチで Parquet 変換するオプションは残す。

### Frontend Framework: Hono vs Next.js vs なし

**Next.js:**
- Workers 上で動くが重い、このユースケースにはオーバースペック

**フレームワークなし:**
- 可能だが、ルーティング・ミドルウェア・JSX を自前で書くことになる

**Hono:**
- Workers ネイティブ、バンドルサイズ極小（~14KB）
- JSX サポート、RPC、ミドルウェア
- Cloudflare の公式サンプルでも多用

→ **Hono** を採用

### Validation: Zod vs なし

**Zod:**
- API レスポンスのランタイム検証に有用
- ただしバンドルサイズ増（~13KB min+gzip）
- Workers の CPU 時間を消費する

**なし:**
- API レスポンスは Microsoft が管理する固定構造
- TypeScript 型定義 + optional chaining で十分安全
- `statistics` が undefined のケースなどは型で対応済み

→ v1.0.0 では **Zod なし**。API 構造が変わった場合に再検討。

## Consequences

### Positive
- 全て Cloudflare 内で完結、プラットフォーム管理が最小
- 無料枠内で運用可能
- モノレポの既存ツールチェーン（Bun, Biome, TypeScript）と統一
- Hono + Workers の組み合わせは Cloudflare のエコシステムで最も成熟

### Negative
- Cloudflare Workers 固有の制約（CPU 時間、メモリ、Node.js API の制限）
- Workers 以外への移植性が低い（R2 バインディング、Queues 等）
- DuckDB-WASM のブラウザ上での挙動は要検証（大量データ時のメモリ）
