#!/usr/bin/env node
/**
 * 通过腾讯云 DNSPod API 创建/更新：3d.mplusm.site -> A -> 指定 IP（幂等）
 *
 * 环境变量（勿提交仓库）：
 *   TENCENTCLOUD_SECRET_ID
 *   TENCENTCLOUD_SECRET_KEY
 *
 * 可选：
 *   DNS_DOMAIN=mplusm.site
 *   DNS_SUB=3d
 *   DNS_TARGET_IP=43.133.145.77
 *   DNS_RECORD_LINE=默认
 */

const { BasicCredential } = require("tencentcloud-sdk-nodejs/tencentcloud/common/credential");
const {
  Client,
} = require("tencentcloud-sdk-nodejs/tencentcloud/services/dnspod/v20210323/dnspod_client");

const domain = process.env.DNS_DOMAIN || "mplusm.site";
const sub = process.env.DNS_SUB || "3d";
const targetIp = process.env.DNS_TARGET_IP || "43.133.145.77";
const recordLine = process.env.DNS_RECORD_LINE || "默认";

const secretId = process.env.TENCENTCLOUD_SECRET_ID;
const secretKey = process.env.TENCENTCLOUD_SECRET_KEY;

async function main() {
  if (!secretId || !secretKey) {
    console.error(
      "缺少 TENCENTCLOUD_SECRET_ID / TENCENTCLOUD_SECRET_KEY。\n在终端先 export 再执行：npm run dns:3d",
    );
    process.exit(1);
  }

  const client = new Client({
    credential: new BasicCredential(secretId, secretKey),
    region: "",
    profile: { language: "zh-CN" },
  });

  const fullHost = `${sub}.${domain}`;

  const list = await client.DescribeRecordList({
    Domain: domain,
    Subdomain: sub,
    RecordType: "A",
    Limit: 100,
  });

  const items = list.RecordList || [];
  const onDefaultLine = items.filter((r) => r.Line === recordLine || r.Line === "默认");
  const existing =
    onDefaultLine.find((r) => r.Type === "A") || items.find((r) => r.Type === "A");

  if (!existing?.RecordId) {
    const created = await client.CreateRecord({
      Domain: domain,
      SubDomain: sub,
      RecordType: "A",
      RecordLine: recordLine,
      Value: targetIp,
      TTL: 600,
    });
    console.log(`已创建解析：${fullHost} -> ${targetIp}（RecordId=${created.RecordId}）`);
  } else if (existing.Value === targetIp) {
    console.log(`无需变更：${fullHost} 已是 A -> ${targetIp}（RecordId=${existing.RecordId}）`);
  } else {
    await client.ModifyRecord({
      Domain: domain,
      RecordId: existing.RecordId,
      RecordType: "A",
      RecordLine: recordLine,
      SubDomain: sub,
      Value: targetIp,
      TTL: existing.TTL || 600,
    });
    console.log(
      `已更新解析：${fullHost} ${existing.Value} -> ${targetIp}（RecordId=${existing.RecordId}）`,
    );
  }

  console.log("\n生效：全球 DNS 可能数分钟～数小时。检查：dig +short " + fullHost);
  console.log("访问：解析生效且服务器已部署后 https://" + fullHost);
}

main().catch((e) => {
  console.error(e.message || e);
  if (e.code) console.error("Code:", e.code);
  process.exit(1);
});
