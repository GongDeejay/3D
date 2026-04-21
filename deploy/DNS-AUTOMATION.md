# 自动化：二级域名解析（3d.mplusm.site）

本仓库提供脚本，通过 **腾讯云 DNSPod API** 幂等创建/更新记录：

- **主机记录**：`3d`
- **类型**：`A`
- **记录值**：`43.133.145.77`（可用环境变量覆盖）
- **线路**：`默认`（可用环境变量覆盖）

## 前置条件

1. 域名 **`mplusm.site`** 已在 **腾讯云 DNS 解析（DNSPod）** 中托管（与注册商处修改 NS 指向腾讯云一致）。  
2. 在 [访问管理 - API 密钥](https://console.cloud.tencent.com/cam/capi) 创建 **SecretId / SecretKey**，并授予 **DNS 解析相关权限**（如 `QcloudDNSFullAccess` 或自定义包含 `dnspod` 写权限的策略）。  
3. **勿将密钥写入 Git**；仅在本地终端使用环境变量。

## 一键执行

在**本机**（已 `git pull` 的 `platform` 目录）：

```bash
export TENCENTCLOUD_SECRET_ID="你的 SecretId"
export TENCENTCLOUD_SECRET_KEY="你的 SecretKey"
npm run dns:3d
```

可选覆盖默认值：

```bash
export DNS_DOMAIN=mplusm.site
export DNS_SUB=3d
export DNS_TARGET_IP=43.133.145.77
export DNS_RECORD_LINE=默认
npm run dns:3d
```

成功后会打印「已创建」或「无需变更」或「已更新」。全球 DNS 生效可能 **数分钟～数小时**，可用：

```bash
dig +short 3d.mplusm.site
```

## 与「可访问网站」的关系

- **解析自动化**只解决「域名指向 IP」。  
- **https://3d.mplusm.site 能打开页面** 还需要在 **43.133.145.77** 上按 [`deploy/MPLUSM.md`](./MPLUSM.md) 部署 Next.js、Nginx、HTTPS。

## 故障排查

| 现象 | 可能原因 |
|------|----------|
| `UnauthorizedOperation` / 鉴权失败 | 密钥错误、子账号无 DNS 权限 |
| `InvalidParameter.DomainNotFound` | 域名未在腾讯云 DNS 中 |
| `InvalidParameter.RecordLineInvalid` | 线路名与控制台不一致，尝试改 `DNS_RECORD_LINE` |
