FROM oven/bun:1-debian

WORKDIR /app

# Install cron
RUN apt-get update && apt-get install -y cron && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY apps/meguru/vscode-marketplace-crawler/package.json ./
RUN bun install --production

COPY apps/meguru/vscode-marketplace-crawler/src/ src/
COPY apps/meguru/vscode-marketplace-crawler/tsconfig.json ./

# Cron: run daily at 03:00 UTC
RUN echo '0 3 * * * cd /app && DATABASE_URL="$DATABASE_URL" /usr/local/bin/bun run src/index.ts >> /var/log/crawler.log 2>&1' > /etc/cron.d/crawler \
    && chmod 0644 /etc/cron.d/crawler \
    && crontab /etc/cron.d/crawler

# Entrypoint: run once immediately, then start cron
COPY apps/meguru/vscode-marketplace-crawler/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
