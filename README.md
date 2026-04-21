# 超级个体能力 · AI 交互素养 MVP

大众化入门向的 **短问卷** + **按场景发放的管理后台**：每次发放自带当时场景说明，回收后按批次查看分布与规则化「下一步建议」。未来可接入既有对话式 AI（见 `src/lib/integrations/conversation-adapter.ts`）。

**GitHub 仓库**：https://github.com/GongDeejay/3D（`main` 分支）。若你本地路径仍是 `.../3D/platform`，该目录与 GitHub 仓库根目录内容一致，在 `platform` 里执行 `git pull` / `git push` 即可。

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

**在另一台电脑继续开发**（克隆后根目录即为本项目，内含 `package.json`）：

```bash
git clone https://github.com/GongDeejay/3D.git
cd 3D
cp .env.example .env
# 编辑 .env（ADMIN_PASSWORD、SESSION_SECRET 等；勿提交）
npm install
npx prisma db push
npm run dev
```

日常同步：

```bash
git pull origin main
# 改代码后
git add -A && git commit -m "描述你的修改"
git push origin main
```

使用 **SSH** 时，将远程改为 `git@github.com:GongDeejay/3D.git`：`git remote set-url origin git@github.com:GongDeejay/3D.git`。

## 腾讯云部署（固定域名）

- **主流程**：[deploy/MPLUSM.md](./deploy/MPLUSM.md)（`3d.mplusm.site`、目录 `/var/www/3d-mplusm`、PM2 名 `3d-mplusm`、`deploy/release.sh` 发版）
- 通用补充：[DEPLOY.md](./DEPLOY.md)
