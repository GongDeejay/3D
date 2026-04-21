# 标准化部署：3d.mplusm.site（腾讯云）

> **固定约定**（后续「部署」均指本流程）  
> - **域名**：`3d.mplusm.site`  
> - **主机**：公网 IP `43.133.145.77`（若更换 IP，请同步改 DNS 与安全组说明）  
> - **应用目录（建议）**：`/var/www/3d-mplusm`  
> - **进程名（PM2）**：`3d-mplusm`  
> - **对内端口**：`3000`（仅本机，由 Nginx 反代对外）

---

## 0. 安全（必做）

你在其它渠道若曾发送过 **root 密码、SecretKey**，请立即：

1. **腾讯云 CAM**：作废或轮换 **SecretKey**，仅保留最小权限子账号密钥（DNS/云 API 若不用可不开）。  
2. **服务器**：修改 root 密码；改用 **SSH 公钥** 登录，关闭密码登录（可选但强烈建议）。  
3. **仓库与聊天**：永远不要把密码/SecretKey 写入 Git 或发给他人。

本仓库 **不包含** 任何密钥；生产环境变量只在服务器上的 `/var/www/3d-mplusm/.env` 维护。

---

## 1. 域名解析（二级域名）

在 **腾讯云 DNS 解析 / DNSPod** 中，域名 **`mplusm.site`** 下新增一条记录：

| 主机记录 | 记录类型 | 记录值     | TTL  |
|----------|----------|------------|------|
| `3d`     | **A**    | `43.133.145.77` | 默认 |

保存后等待解析生效（通常数分钟，最长可到 24h）。可用 `ping 3d.mplusm.site` 或 `dig 3d.mplusm.site +short` 检查是否指向该 IP。

---

## 2. 云安全组

在 **轻量应用服务器 / CVM** 对应安全组中放行：

- **22**（SSH，建议仅对你家/公司 IP 限制来源）  
- **80**（HTTP，证书申请与跳转）  
- **443**（HTTPS）

**不要**对公网开放数据库端口；本 MVP 使用 SQLite 文件在服务器本地即可。

---

## 3. 服务器一次性环境（Ubuntu 22.04 示例）

SSH 登录后（**示例**，请用你自己的用户与密钥路径）：

```bash
sudo apt update && sudo apt install -y git nginx curl
```

安装 Node 20 与 PM2（nvm 方式）：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
npm install -g pm2
```

克隆代码（**公开仓库**可直接拉；私有库需配置 deploy key 或 token，勿提交到仓库）：

```bash
sudo mkdir -p /var/www && sudo chown "$USER":"$USER" /var/www
cd /var/www
git clone https://github.com/GongDeejay/3D.git 3d-mplusm
cd 3d-mplusm
cp .env.example .env
nano .env   # 见下一节
```

---

## 4. 生产环境变量（`/var/www/3d-mplusm/.env`）

至少包含（值由你自行生成强随机串）：

```env
DATABASE_URL="file:./prisma/prod.db"
ADMIN_PASSWORD="（强密码）"
SESSION_SECRET="（至少 32 字节随机串）"
NODE_ENV=production
NEXT_PUBLIC_BASE_URL="https://3d.mplusm.site"
```

说明：

- SQLite 路径指向 **`prisma/prod.db`** 时，请确保 `prisma` 目录可写：`touch prisma/prod.db` 测试。  
- **`NEXT_PUBLIC_BASE_URL`** 必须为 `https://3d.mplusm.site`，后台复制链接与二维码才正确。

首次建库与构建：

```bash
cd /var/www/3d-mplusm
npm ci
npx prisma generate
npx prisma db push
npm run build
```

---

## 5. PM2

使用仓库根目录的 `ecosystem.config.cjs`（已随仓库提供）。首次：

```bash
cd /var/www/3d-mplusm
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
# 按提示执行它打印的 sudo 命令
```

常用：`pm2 logs 3d-mplusm`、`pm2 restart 3d-mplusm`。

---

## 6. Nginx

```bash
sudo cp /var/www/3d-mplusm/deploy/nginx-3d.mplusm.site.conf /etc/nginx/sites-available/3d.mplusm.site
sudo ln -sf /etc/nginx/sites-available/3d.mplusm.site /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 7. HTTPS（Let’s Encrypt）

DNS 已指向本机且 **80** 可从外网访问后：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d 3d.mplusm.site
```

按提示同意条款；成功后 Certbot 会改写 Nginx 的 SSL 配置。证书自动续期由 certbot 定时任务处理。

---

## 8. 发布新版本（固化命令）

在服务器上：

```bash
chmod +x /var/www/3d-mplusm/deploy/release.sh
APP_ROOT=/var/www/3d-mplusm /var/www/3d-mplusm/deploy/release.sh
```

或先 `export APP_ROOT=/var/www/3d-mplusm` 再执行 `deploy/release.sh`。

脚本内容：`git pull` → `npm ci` → `prisma generate` → `db push` → `build` → `pm2 restart 3d-mplusm`。

---

## 9. 验证

- 浏览器打开：`https://3d.mplusm.site`  
- 管理后台：`https://3d.mplusm.site/admin/login`（使用 `.env` 中 `ADMIN_PASSWORD`）

若 502：检查 `pm2 status`、应用是否监听 `3000`。若证书失败：检查 DNS 与 80 端口是否放行。

---

## 10. 与 Cursor / 协作约定

- **线上环境** = 本文件描述的 **主机 + 域名 + 目录 + PM2 名称**。  
- 代码合并到 `main` 后，在服务器执行 **`deploy/release.sh`** 即完成发布。  
- 不在对话或 Issue 中粘贴服务器密码与云 API 密钥。
