# ADR: Crawler 実行基盤の選定

## Status

Accepted (2026-04-08)

## Context

VSCode Marketplace crawler を含む複数のクローラーを定期実行する基盤が必要。

要件:
- 日次バッチ（VSCode Marketplace: ~1,180ページ、1.5時間相当）
- 高頻度ポーリング（Paperspace: 10秒間隔）
- データ保存先は Cloudflare R2 (Parquet)
- コスト: 月1,000円以下（可能な限り無料）
- クローラーの追加が容易

## Decision

**Cloudflare Workers + Queues に統一する。**

### アーキテクチャ

```
Cron Trigger (日次/分次)
  → Worker: データ取得 → R2 に書き込み → 次ページを Queue に投入
  → Worker: 次ページ取得 → R2 に書き込み → 次ページを Queue に投入
  → ... 完了まで繰り返し
```

### VSCode Marketplace Crawler

- Cron Trigger: 日次 1回
- 1 Worker 実行 = 1ページ(100件)取得 → R2 に追記 → 次ページメッセージを Queue に投入
- Queue の配信間隔でリクエスト間隔を制御（5秒）
- 全 ~1,180ページを Queue 駆動で順次処理

### Paperspace Monitor

- Cron Trigger: 1分間隔
- 1 Worker 実行で6リクエスト（10秒間隔）
- 結果を R2 に書き込み

## Alternatives Considered

| サービス | 判定 | 理由 |
|---|---|---|
| Cloud Run Jobs | △ | R2 とは S3互換で接続可能だが、別プラットフォーム管理が増える。コスト ~$1/月 |
| Fly.io Machines | △ | Docker そのまま動くが、スケジュール実行の仕組みが弱い |
| AWS Lambda + SQS | △ | ページング構成は可能だが、R2 との連携が間接的。AWS アカウント管理が増える |
| Railway | △ | シンプルだが $5/月クレジット制。複数クローラーだと超過の可能性 |
| GitHub Actions | × | 長時間実行 + scraping を Actions から行うのはリスク（サーバー攻撃とみなされる可能性） |

## Consequences

### Positive

- R2 とネイティブ連携（同一プラットフォーム、認証不要のバインディング）
- 全て Cloudflare 無料枠内で運用可能
- クローラー追加 = Worker + Queue のペア追加のみ
- 1実行あたり数秒で完結（CPU 30秒制限に収まる）
- Queue による自動リトライ・DLQ 対応

### Negative

- JS/TS のみ（Bun/Node のネイティブモジュールは使えない）
- Workers 固有の API に依存（ポータビリティ低下）
- ローカル開発は wrangler で対応が必要
- 1回の実行で大量データを扱う処理には不向き（メモリ 128MB 制限）
