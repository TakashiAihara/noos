ARG PNPM_VERSION=10.7.1
ARG NODE_VERSION=22.14.0

ARG APP_NAME=@noos/user-web
ARG APP_DIR=apps/user/web
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

# Next.js のビルド
RUN pnpm build

# Next.js 用の standalone output をコピー
RUN cp -R ${APP_DIR}/.next/standalone ./standalone
# 静的ファイルをコピー
RUN cp -R ${APP_DIR}/.next/static ./standalone/${APP_DIR}/.next/static
# public フォルダがあればコピー
RUN cp -R ${APP_DIR}/public ./standalone/${APP_DIR}/public 2>/dev/null || :

#################################################################
# Prod Stage: 本番用イメージ（builder ステージの成果物を利用）
#################################################################
FROM node:${NODE_VERSION}-slim AS production

ARG APP_DIR
ARG WORK_DIR

ENV APP_DIR=${APP_DIR}

# ワークスペースルートを設定
WORKDIR ${WORK_DIR}

# 非特権ユーザーに切り替え
USER node

# standalone モードでビルドされた Next.js アプリをコピー
COPY --from=builder ${WORK_DIR}/standalone ./
# 必要なポートを公開 (Next.js のデフォルトは 3000)
EXPOSE 3000

# 環境変数の設定
ENV NODE_ENV=production
ENV PORT=3000

# 本番実行コマンド
CMD ["/bin/sh", "-c", "node ${APP_DIR}/server.js"]

#################################################################
# Dev Stage: 開発用イメージ（ソース全体をコピーして dev 用コマンドで起動）
#################################################################
FROM base AS development

ARG WORK_DIR
ARG APP_NAME

ENV APP_NAME=${APP_NAME}

# ワークスペースルートを設定
WORKDIR ${WORK_DIR}

# 必要なポートを公開
EXPOSE 3000

CMD ["/bin/sh", "-c", "pnpm turbo --filter ${APP_NAME} start:dev"]
