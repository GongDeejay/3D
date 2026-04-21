# 部署到腾讯云（或其它 Linux 云主机）

以下假设：**Ubuntu 22.04+**、已有域名解析到服务器公网 IP，使用 **Nginx** 反向代理 + **PM2** 守护 Node 进程。

## 1. 服务器准备

```bash
# Node.js 20 LTS（示例：使用 nvm）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 20
nvm use 20

npm install -g pm2
```

## 2. 代码与依赖

```bash
git clone <你的仓库地址> super-individual-platform
cd super-individual-platform
cp .env.example .env
# 编辑 .env：DATABASE_URL、ADMIN_PASSWORD、SESSION_SECRET、NEXT_PUBLIC_BASE_URL
npm ci
npx prisma generate
npx prisma db push   # 首次；生产更建议 migrate，见下
npm run build
```

生产数据库建议使用 **PostgreSQL**，将 `DATABASE_URL` 改为官方连接串后执行：

```bash
npx prisma migrate dev --name init   # 开发机生成迁移
# 服务器上：
npx prisma migrate deploy
```

SQLite 文件路径需对运行用户可写，且注意备份 `prisma/dev.db`。

## 3. 进程守护（PM2）

```bash
cd /path/to/super-individual-platform
pm2 start npm --name "si-platform" -- start
pm2 save
pm2 startup
```

环境变量也可写入 `ecosystem` 配置或系统环境，确保 **`NODE_ENV=production`**。

## 4. Nginx

将 HTTPS 请求代理到 `127.0.0.1:3000`（Next 默认端口）。证书可使用腾讯云 SSL 或 Let’s Encrypt。

```nginx
server {
  listen 443 ssl http2;
  server_name your-domain.com;

  # ssl_certificate / ssl_certificate_key ...

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

`X-Forwarded-Proto` 有助于应用生成正确的绝对链接（见 `getPublicOrigin`）。

## 5. 防火墙与安全组

- 云安全组放行 **80 / 443**（及 SSH 端口）。
- **勿**将数据库端口对公网开放。
- 定期更新 `ADMIN_PASSWORD` / `SESSION_SECRET`。

## 6. 发布新版本

```bash
git pull
npm ci
npx prisma migrate deploy   # 若使用 migrate
npm run build
pm2 restart si-platform
```

## 7. 可选：Docker

若你更熟悉容器化，可自行编写 `Dockerfile`（多阶段 build + `node server.js` 或 `next start`），将上述环境变量注入容器即可；数据库建议独立 RDS。
