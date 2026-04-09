# VSCode Marketplace Trend Tracker v1.0.0 — Architecture

## Overview

VSCode Marketplace の拡張機能データを日次で全件収集し、トレンド分析を可視化・CLIで提供するシステム。
全コンポーネントは Bun + TypeScript で統一。

```
┌──────────────────────────────────────────────────────────────┐
│                       Cloudflare                             │
│                                                              │
│  ┌──────────────┐    ┌────────────┐    ┌─────────────┐       │
│  │ Cron Trigger │───▶│ collector  │───▶│   Queue     │       │
│  │  (日次)      │    │  (Hono)    │◀───│ (Paging)    │       │
│  └──────────────┘    └─────┬──────┘    └─────────────┘       │
│                            │                                 │
│                            ▼ Service Binding                 │
│                    ┌───────────────┐                         │
│                    │  repository   │                         │
│                    │   (Hono)      │──▶ R2 (NDJSON)          │
│                    │  + DuckDB    │                         │
│                    └──────┬────────┘                         │
│                      ▲    ▲                                  │
│          Service     │    │  Service                         │
│          Binding     │    │  Binding                         │
│                 ┌────┘    └────┐                             │
│                 │              │                             │
│          ┌──────────┐  ┌─────────────┐                      │
│          │dashboard │  │   gateway   │                      │
│          │  (Hono)  │  │   (Hono)    │                      │
│          └──────────┘  └─────────────┘                      │
│                              ▲                               │
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
│                              │ HTTP
│                        ┌─────────────┐
│                        │    cli      │
│                        │   (Bun)    │
│                        └─────────────┘
```

## Components

### 1. repository

全コンポーネントの中核。R2 へのデータアクセスと DuckDB 集計を一元管理する。

**責務:**
- R2 への NDJSON 書き込み・読み取り
- DuckDB による集計クエリ実行
- トレンド検知ロジック（週次成長率、急上昇検出）
- 事前集計データのキャッシュ

**インターフェース（Service Binding 経由）:**
- `POST /write` — スナップショット書き込み
- `GET /query/:type` — 集計クエリ実行
- `GET /trending` — トレンド取得
- `GET /growth/:extensionId` — 成長率取得

**技術:**
- Hono + Cloudflare Workers + R2 Binding
- DuckDB-WASM（集計処理）

### 2. collector

Marketplace Gallery API から全拡張機能データを日次収集する。

**実行フロー:**

1. Cron Trigger が日次で起動
2. 1ページ(100件)取得
3. repository に書き込みを委譲（Service Binding）
4. 次ページのメッセージを Queue に投入
5. Queue が次の実行を起動（間隔 5秒）
6. 空ページが返るまで繰り返し（~1,180ページ）

**技術:**
- Hono + Cloudflare Workers + Queues
- Hono: fetch ハンドラ / Raw Workers API: queue, scheduled ハンドラ

### 3. gateway

外部クライアント（CLI 等）向けの HTTP API。repository の集計結果を JSON で提供する。

**エンドポイント:**
- `GET /api/trending?period=weekly` — トレンドランキング
- `GET /api/growth?id=<extensionId>` — 拡張機能の成長推移
- `GET /api/categories` — カテゴリ別サマリー
- `GET /api/search?q=<keyword>` — 拡張機能検索

**技術:**
- Hono (Cloudflare Workers)
- Service Binding → repository

### 4. dashboard

ブラウザ向けダッシュボード。

**機能 (v1.0.0):**
- トレンド急上昇の拡張機能一覧
- カテゴリ別インストール数推移
- 週次成長率ランキング

**技術:**
- Hono JSX (SSR)
- 最小限の CSS
- Service Binding → repository

### 5. cli

ローカルまたは AI エージェントから利用するコマンドラインツール。gateway を叩く。

**設計方針:**
- AI フレンドリー: JSON 出力がデフォルト、構造化されたレスポンス
- パイプライン向き: stdout に結果、stderr にログ
- MCP Server としても動作可能（将来）

**コマンド例:**
```bash
meguru trending --period weekly --limit 20
meguru growth ms-python.python --days 30
meguru categories --sort installs
meguru search "copilot" --format table
meguru summary --format text
```

**技術:**
- Bun (TypeScript)
- gateway への HTTP リクエスト

## 技術統一方針

| 項目 | 選定 |
|---|---|
| 言語 | TypeScript |
| ランタイム | Bun (ローカル / CLI) + Cloudflare Workers (クラウド) |
| フレームワーク | Hono（全サービス共通） |
| Lint / Format | Biome |
| テスト | Vitest |

## Data Flow

```
Marketplace API
      │
      ▼
  collector
      │ Service Binding
      ▼
  repository ──▶ R2 (raw NDJSON)
      │                │
      │ (集計)          │
      ▼                ▼
  aggregated cache   snapshots/
      │
      ▼
  gateway (Hono)
      │
   ┌──┴──┐
   ▼     ▼
dashboard  cli
```

## Storage Layout (R2)

```
vscode-marketplace/
├── snapshots/
│   ├── 2026-04-08.ndjson.gz
│   ├── 2026-04-09.ndjson.gz
│   └── ...
└── aggregated/
    ├── trending-daily.json
    ├── trending-weekly.json
    └── growth/
        └── <extension-id>.json
```

## Scalability

- クローラー追加（例: Paperspace monitor）は collector + Queue ペアを追加
- repository は共通基盤として全クローラーが利用
- R2 バケット内はプレフィックスで分離: `paperspace/snapshots/...`
- gateway / dashboard はデータソースを増やすだけで拡張可能
- cli は gateway エンドポイント追加に追従するだけ
