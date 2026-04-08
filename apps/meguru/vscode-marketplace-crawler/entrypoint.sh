#!/bin/bash
set -e

# Pass environment variables to cron
printenv | grep -E '^(DATABASE_URL|CRAWL_DELAY_MS)=' >> /etc/environment

echo "$(date): Running initial collection..."
bun run src/index.ts 2>&1 | tee -a /var/log/crawler.log

echo "$(date): Initial collection done. Starting cron daemon..."
cron -f
