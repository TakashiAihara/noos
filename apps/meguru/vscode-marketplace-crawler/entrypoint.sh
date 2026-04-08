#!/bin/bash
set -e

# Pass DATABASE_URL to cron environment
printenv | grep -E '^DATABASE_URL=' >> /etc/environment

echo "$(date): Running initial collection..."
bun run src/index.ts 2>&1 | tee -a /var/log/crawler.log

echo "$(date): Initial collection done. Starting cron daemon..."
cron -f
