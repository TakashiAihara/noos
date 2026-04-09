# VSCode Marketplace Trend Tracker v1.0.0 — Architecture

## Overview

VSCode Marketplace の拡張機能データを日次で全件収集し、トレンド分析を可視化・CLIで提供するシステム。

```
┌──────────────────────────────────────────────────────────────┐
│                       Cloudflare                             │
│                                                              │
│  ┌──────────────┐    ┌────────────┐    ┌─────────────┐       │
│  │ Cron Trigger │───▶│  Crawler   │───▶│   Queue     │       │
│  │  (日次)      │    │  Worker    │◀───│ (Paging)    │       │
│  └──────────────┘    └─────┬──────┘    └─────────────┘       │
│                            │                                 │
│                            ▼ Service Binding                 │
│                    ┌───────────────┐                         │
│                    │   Storage     │                         │
│                    │   Worker      │──▶ R2 (NDJSON)          │
│                    │ (Repository   │                         │
│                    │  + DuckDB)    │                         │
│                    └──────┬────────┘                         │
│                      ▲    ▲                                  │
│          Service     │    │  Service                         │
│          Binding     │    │  Binding                         │
│                 ┌────┘    └────┐                             │
│                 │              │                             │
│          ┌──────────┐  ┌─────────────┐                      │
│          │ Frontend │  │     API     │                      │
│          │  Worker  │  │   Worker    │                      │
│          │  (Hono)  │  │  (Hono)    │                      │
│          └──────────┘  └─────────────┘                      │
│                              ▲                               │
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
                               │ HTTP
                         ┌─────────────┐
                         │    CLI      │
                         │  (Bun)     │
                         └─────────────┘
```

## Components

### 1. Storage Worker (Repository + Analysis)

全コンポーネントの中核。R2 へのデータアクセスと DuckDB 集計を一元管理する。

**責務:**
- R2 への NDJSON 書き込み・読み取り
- DuckDB による集計クエリ実行
- トレンド検知ロジック（週次成長率、急上昇検出）
- 事前集計データのキャッシュ

**インターフェース（Service Binding 経由）:**
- `write(date, extensions)` — スナップショット書き込み
- `query(type, params)` — 集計クエリ実行
- `getTrending(period)` — トレンド取得
- `getGrowth(extensionId)` — 成長率取得

**技術:**
- Cloudflare Workers + R2 Binding
- DuckDB-WASM（集計処理）

### 2. Crawler Worker

Marketplace Gallery API から全拡張機能データを日次収集する。

**実行フロー:**

1. Cron Trigger が日次で Worker を起動
2. Worker が1ページ(100件)取得
3. Storage Worker に書き込みを委譲（Service Binding）
4. 次ページのメッセージを Queue に投入
5. Queue が次の Worker を起動（間隔 5秒）
6. 空ページが返るまで繰り返し（~1,180ページ）

**技術:**
- Cloudflare Workers + Queues
- Raw Workers API（フレームワーク不要）

### 3. API Worker

外部クライアント（CLI 等）向けの HTTP API。Storage Worker の集計結果を JSON で提供する。

**エンドポイント:**
- `GET /api/trending?period=weekly` — トレンドランキング
- `GET /api/growth?id=<extensionId>` — 拡張機能の成長推移
- `GET /api/categories` — カテゴリ別サマリー
- `GET /api/search?q=<keyword>` — 拡張機能検索

**技術:**
- Hono (Cloudflare Workers)
- Service Binding → Storage Worker

### 4. Frontend Worker

ブラウザ向けダッシュボード。API Worker と同じ Hono アプリ内で提供。

**機能 (v1.0.0):**
- トレンド急上昇の拡張機能一覧
- カテゴリ別インストール数推移
- 週次成長率ランキング

**技術:**
- Hono JSX (SSR)
- 最小限の CSS

### 5. CLI

ローカルまたは AI エージェントから利用するコマンドラインツール。API Worker を叩く。

**設計方針:**
- AI フレンドリー: JSON 出力がデフォルト、構造化されたレスポンス
- パイプライン向き: stdout に結果、stderr にログ
- MCP Server としても動作可能（将来）

**コマンド例:**
```bash
# トレンドランキング（JSON）
meguru trending --period weekly --limit 20

# 特定拡張の成長推移
meguru growth ms-python.python --days 30

# カテゴリ別サマリー
meguru categories --sort installs

# 検索
meguru search "copilot" --format table

# AI 向け: 自然言語風サマリー
meguru summary --format text
```

**技術:**
- Bun (TypeScript)
- API Worker への HTTP リクエスト

## Data Flow

```
Marketplace API
      │
      ▼
  Crawler Worker
      │ Service Binding
      ▼
  Storage Worker ──▶ R2 (raw NDJSON)
      │                  │
      │ (集計)            │
      ▼                  ▼
  aggregated cache    snapshots/
      │
      ▼
  API Worker (Hono)
      │
   ┌──┴──┐
   ▼     ▼
Frontend  CLI
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

- クローラー追加（例: Paperspace monitor）は Crawler Worker + Queue ペアを追加
- Storage Worker は共通基盤として全クローラーが利用
- R2 バケット内はプレフィックスで分離: `paperspace/snapshots/...`
- API/Frontend はデータソースを増やすだけで拡張可能
- CLI は API エンドポイント追加に追従するだけ
