FROM oven/bun:1
WORKDIR /app

COPY apps/meguru/vscode-marketplace-crawler/src/ src/
COPY apps/meguru/vscode-marketplace-crawler/tsconfig.json ./

RUN mkdir -p data

VOLUME ["/app/data"]

CMD ["bun", "run", "src/index.ts"]
