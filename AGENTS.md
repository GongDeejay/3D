# 超级个体能力系统 — Agent 说明

## 当前 MVP

- **分支**：第二维「AI 素养」中的 **交互素养**（大众化入门：如何与 AI 对话、澄清需求、轻量评估与安全意识）。
- **形态**：短问卷；每次「发放」是一条 `SurveyDistribution`，带独立场景文案与填写链接。
- **集成**：对话式 AI 仅通过 `src/lib/integrations/conversation-adapter.ts` 扩展，勿在页面中直接调用外部模型。

## 命令

- 开发：`npm run dev`（需 `.env`，见 `.env.example`）
- 数据库：`npm run db:push`（SQLite 文件 `prisma/dev.db`）
- 构建：`npm run build`

## 约束

- 管理后台依赖 `ADMIN_PASSWORD` / `SESSION_SECRET`；勿将 `.env` 提交入库。
- 题库版本由 `templateKey` 标识；改题时保持旧 key 或做迁移，以免历史批次解读失真。
