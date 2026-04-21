/**
 * PM2 配置 — 生产环境默认与 deploy/MPLUSM.md 一致：
 * 应用目录 /var/www/3d-mplusm，进程名 3d-mplusm
 *
 * 使用：在应用根目录执行  pm2 start ecosystem.config.cjs
 */
const path = require("path");

const appRoot = process.env.APP_ROOT || process.cwd();

module.exports = {
  apps: [
    {
      name: "3d-mplusm",
      cwd: appRoot,
      script: "npm",
      args: "run start",
      interpreter: "none",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
