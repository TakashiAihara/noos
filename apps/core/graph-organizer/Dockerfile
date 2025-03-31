ARG PNPM_VERSION=10.7.0
ARG NODE_VERSION=22.14.0

ARG APP_NAME=@core/graph-organizer
ARG APP_DIR=apps/core/graph-organizer
ARG WORK_DIR=/app

#################################################################
# Base Stage: 共通のベースイメージ（pnpm のインストールなど）
#################################################################

FROM node:${NODE_VERSION}-slim AS base

# ビルド引数を再宣言（RUN 命令で利用するため）
ARG PNPM_VERSION
ARG WORK_DIR

# pnpm をグローバルにインストール
RUN npm install -g pnpm@${PNPM_VERSION}

# 作業ディレクトリを設定
WORKDIR ${WORK_DIR}

# ソースコード全体をコピー
COPY . .

# 依存関係のインストール
RUN pnpm install --frozen-lockfile

#################################################################
# Builder Stage: プロダクション用のビルド（ソースコードのビルド＆本番依存のインストール）
#################################################################

FROM base AS builder

# 必要な引数を再宣言
ARG APP_DIR
ARG WORK_DIR

# 作業ディレクトリを設定
WORKDIR ${WORK_DIR}

# ビルド
RUN pnpm build

# deploy に依存モジュールを格納
RUN pnpm --filter ./${APP_DIR} --production deploy ./deploy

# Workaround for Prisma + pnpm bug
RUN find . -path '*/node_modules/.pnpm/@prisma+client*/node_modules/.prisma' | xargs -r -I{} sh -c "cp -R {} ./deploy/{}"

#################################################################
# Prod Stage: 本番用イメージ（builder ステージの成果物を利用）
#################################################################
FROM node:${NODE_VERSION}-slim AS production

ARG APP_DIR
ARG WORK_DIR

# ワークスペースルートを設定
WORKDIR ${WORK_DIR}

# NODE_ENV を production に設定
ENV NODE_ENV=production

# deploy されたアプリケーションを一括コピー
COPY --from=builder ${WORK_DIR}/deploy .

# 必要なポートを公開
EXPOSE 3100

# 非特権ユーザーに切り替え（必要に応じて）
USER node

# 本番実行コマンド
CMD ["node", "dist/main.js"]

#################################################################
# Dev Stage: 開発用イメージ（ソース全体をコピーして dev 用コマンドで起動）
#################################################################
FROM base AS development

ARG WORK_DIR
ARG APP_NAME

ENV APP_NAME=${APP_NAME}
ENV NODE_ENV=development

# ワークスペースルートを設定
WORKDIR ${WORK_DIR}

# 必要なポートを公開
EXPOSE 3100
