# 超级个体能力 · AI 交互素养 MVP

大众化入门向的 **短问卷** + **按场景发放的管理后台**：每次发放自带当时场景说明，回收后按批次查看分布与规则化「下一步建议」。未来可接入既有对话式 AI（见 `src/lib/integrations/conversation-adapter.ts`）。

## 技术栈（已定）

- **Next.js 16**（App Router）+ **TypeScript** + **Tailwind CSS 4**
- **Prisma 6** + **SQLite**（`DATABASE_URL="file:./dev.db"`，上线可换 PostgreSQL）
- **Zod** 校验作答；**jose** 签发管理端会话（Edge middleware 可用）

## 本地运行

```bash
cp .env.example .env
# 编辑 ADMIN_PASSWORD 与 SESSION_SECRET
npm install
npm run db:push
npm run dev
```

- 首页：<http://localhost:3000>
- 管理后台：<http://localhost:3000/admin/login>（使用 `ADMIN_PASSWORD`）

## 生产环境

- 设置 `NEXT_PUBLIC_BASE_URL` 为站点根 URL，便于后台生成正确的填写链接与二维码。
- 将 `DATABASE_URL` 指向 PostgreSQL 等生产库并执行 `prisma migrate`（由 `db push` 演进而来）。

## Git 与多设备开发

```bash
# 在平台目录初始化并推到你自己的远程（GitHub / Gitee / 腾讯工蜂等）
git init
git add .
git commit -m "chore: initial MVP"
git branch -M main
git remote add origin <你的仓库 HTTPS 或 SSH 地址>
git push -u origin main
```

在其它设备：`git clone` 后复制 `.env`，执行 `npm ci && npx prisma db push && npm run dev`。

## 腾讯云部署

见仓库内 [DEPLOY.md](./DEPLOY.md)（Nginx + PM2 示例）。
