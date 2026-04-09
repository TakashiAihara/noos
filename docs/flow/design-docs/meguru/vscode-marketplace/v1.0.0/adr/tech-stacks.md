# ADR: v1.0.0 技術スタック選定

## Status

Accepted (2026-04-09)

## Context

VSCode Marketplace Trend Tracker v1.0.0 の技術スタックを選定する。
5コンポーネント（repository, collector, gateway, dashboard, cli）があり、
Bun + TypeScript + Hono で統一する。

## Decisions

### 共通方針

| 項目 | 選定 | 理由 |
|---|---|---|
| Language | TypeScript | 型安全、モノレポ統一 |
| Runtime | Bun | 高速、モノレポ全体で統一済み |
| Framework | Hono | 全サービス共通。Workers ネイティブ、軽量（~14KB） |
| Lint / Format | Biome | モノレポ全体で統一済み |
| Test | Vitest | Bun / Workers 両方で利用可能 |

### repository（中核サービス）

| 項目 | 選定 | 理由 |
|---|---|---|
| Framework | Hono | Service Binding 経由のリクエストをルーティング |
| Storage | Cloudflare R2 (Workers Binding) | ネイティブ連携、egress 無料 |
| Data Format | NDJSON (gzip) | Workers 内で生成が容易、DuckDB が直接読める |
| Analysis | DuckDB-WASM | NDJSON を直接クエリ、集計処理を一元化 |

### collector（データ収集）

| 項目 | 選定 | 理由 |
|---|---|---|
| Framework | Hono | fetch ハンドラ。queue/scheduled は Raw Workers API |
| Queue | Cloudflare Queues | ページング制御、リトライ、DLQ |
| Validation | なし（TypeScript 型定義のみ） | API レスポンスは固定構造、ランタイムコスト不要 |

### gateway（API サービス）

| 項目 | 選定 | 理由 |
|---|---|---|
| Framework | Hono | ルーティング、ミドルウェア |
| API スタイル | Hono RPC | 型安全なエンドポイント、CLI との型共有 |
| データアクセス | Service Binding → repository | 直接 R2 にアクセスしない |

### dashboard（フロントエンド）

| 項目 | 選定 | 理由 |
|---|---|---|
| Framework | Hono | gateway と同一 Hono アプリ内で提供も可 |
| UI | Hono JSX (SSR) + 最小限の CSS | SPA フレームワーク不要 |
| データアクセス | Service Binding → repository | サーバーサイドで集計済みデータを取得 |

### cli（コマンドラインツール）

| 項目 | 選定 | 理由 |
|---|---|---|
| Runtime | Bun | 起動が速い、fetch 組み込み |
| HTTP Client | fetch (Bun built-in) | 依存なし |
| Output | JSON (default) / table / text | AI エージェント向けに JSON デフォルト |
| 型共有 | Hono RPC client | gateway と型を共有、型安全なAPI呼び出し |
| 将来拡張 | MCP Server 対応 | Claude Code 等から直接呼び出し可能に |

### 開発・デプロイ

| 項目 | 選定 | 理由 |
|---|---|---|
| ローカル開発 | Wrangler | Workers/R2/Queues のローカルエミュレーション |
| Workers テスト | @cloudflare/vitest-pool-workers | Workers 環境でのユニットテスト |
| Deploy | Wrangler (GitHub Actions) | `wrangler deploy` でCI/CDから自動デプロイ |

## Alternatives Considered

### フレームワーク統一: Hono vs 混在

**混在（Hono + Raw Workers API）:**
- collector や repository はハンドラが少ないのでフレームワーク不要という判断もあり得る

**Hono 統一:**
- コードの書き味が全サービスで統一される
- Hono は `fetch`, `queue`, `scheduled` を同一 export で共存可能
- Service Binding 経由のリクエストもルーティング・ミドルウェアが使える
- 将来 HTTP API として外部公開したくなっても対応しやすい

→ **Hono 統一** を採用。オーバーヘッドは ~14KB のバンドルサイズのみ。

### Data Format: Parquet vs NDJSON

**Parquet:**
- 列指向で分析クエリが高速、圧縮率が高い
- Workers 内で書くには parquet-wasm が必要（バンドルサイズ増、メモリ 128MB 制限）

**NDJSON (gzip):**
- Workers で `JSON.stringify()` + gzip するだけ
- DuckDB は `read_ndjson_auto()` で直接読める
- 圧縮率は Parquet に劣るが、年間 ~1.5GB なので問題なし

→ **NDJSON** を採用。将来バッチで Parquet 変換するオプションは残す。

### Frontend: Hono JSX vs Next.js vs React SPA

**Next.js:** Workers 上で動くが重い、オーバースペック。
**React SPA:** ビルド・配信が複雑になる。
**Hono JSX:** SSR で十分、バンドルサイズ極小、Workers ネイティブ。

→ **Hono JSX** を採用。

### Validation: Zod vs なし

**Zod:** バンドルサイズ増（~13KB）、Workers CPU 時間を消費。
**なし:** TypeScript 型定義 + optional chaining で対応済み。

→ v1.0.0 では **Zod なし**。API 構造が変わった場合に再検討。

## Consequences

### Positive
- Bun + Hono + TypeScript で全コンポーネント統一、学習コスト最小
- Hono RPC で gateway ↔ cli 間の型安全を実現
- 全て Cloudflare 内で完結、プラットフォーム管理が最小
- 無料枠内で運用可能

### Negative
- Cloudflare Workers 固有の制約（CPU 時間、メモリ、Node.js API の制限）
- Workers 以外への移植性が低い（R2 バインディング、Queues 等）
- DuckDB-WASM の Workers 上での挙動は要検証（メモリ 128MB 制限）
