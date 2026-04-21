#!/usr/bin/env bash
set -euo pipefail

# 在服务器上发布：git pull → 安装依赖 → Prisma → build → PM2 重启
# 用法：APP_ROOT=/var/www/3d-mplusm ./deploy/release.sh

ROOT="${APP_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"

echo "==> 目录: $ROOT"

git pull origin main

npm ci
npx prisma generate
npx prisma db push
npm run build

pm2 restart 3d-mplusm || pm2 start ecosystem.config.cjs

echo "==> 完成。可执行: pm2 logs 3d-mplusm"
