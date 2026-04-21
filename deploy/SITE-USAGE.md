# 访问地址与使用说明（3d.mplusm.site）

> 以下在 **DNS 已指向 43.133.145.77** 且 **服务器已按 `deploy/MPLUSM.md` 部署完成** 后成立。

## 对外地址

| 用途 | URL |
|------|-----|
| 访客首页 | https://3d.mplusm.site |
| 管理后台登录 | https://3d.mplusm.site/admin/login |
| 能力阶梯说明 | https://3d.mplusm.site/ladder |
| 提示词小抄（巩固） | https://3d.mplusm.site/resources/prompt-basics |

## 管理员

1. 使用服务器 `.env` 中的 **`ADMIN_PASSWORD`** 登录后台。  
2. **新建发放**：填写批次标题与「场景说明」，保存后复制 **链接** 或 **二维码** 发给填写者。  
3. 在批次详情页查看 **回收数量、分布统计、规则化建议**。

## 填写者

1. 用手机/浏览器打开组织者分享的 **`https://3d.mplusm.site/s/...`**（每批唯一）。  
2. 填完提交后，在 **完成页** 查看 **个人评级** 与 **下一阶梯** 入口。  
3. 无需注册账号。

## 发版（服务器上）

```bash
APP_ROOT=/var/www/3d-mplusm /var/www/3d-mplusm/deploy/release.sh
```
