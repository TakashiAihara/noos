# ADR: エラーハンドリングとリトライ戦略

## Status

Accepted (2026-04-09)

## Context

Marketplace API は高負荷時に 400/429/5xx を返すことがある。
全 ~1,180 ページの収集中に一部ページが失敗するケースへの対応が必要。

## Decision

### リトライ戦略: Exponential Backoff (5回)

```
Attempt 1: 即時
Attempt 2: 1s 後
Attempt 3: 2s 後
Attempt 4: 4s 後
Attempt 5: 8s 後
```

合計最大待機: 15s / ページ

### 失敗時の挙動

- 5回リトライしても失敗 → **収集を途中停止**
- ログに失敗ページ番号と HTTP ステータスを記録
- Workers 版: Queue メッセージを DLQ に退避

### 途中停止からの復旧

- 翌日の日次実行で全ページを最初から再収集
- NDJSON は日付別ファイルなので、部分的な当日データは翌日上書きされる
- 手動再実行も可能（Cron Trigger の手動起動 or CLI）

### レート制限

| 環境 | 間隔 | 設定 |
|---|---|---|
| Docker (現行) | 5s (env: CRAWL_DELAY_MS) | 環境変数で変更可能 |
| Workers + Queues | Queue 配信間隔 5s | wrangler.toml で設定 |

## Consequences

### Positive

- 一時的な API エラーは自動回復
- 永続的な障害時は速やかに停止し、リソースを浪費しない
- 翌日の自動再実行で自然に復旧

### Negative

- 途中停止した日のデータは欠損（部分データは保存されるが不完全）
- DLQ の監視・アラート設定が別途必要
