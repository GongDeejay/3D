import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buildDiagnosticReport } from "@/lib/dse-diagnostic";
import { prisma } from "@/lib/prisma";
import styles from "./result.module.css";

export const metadata: Metadata = {
  title: "侦察报告 | DSE中文情报侦察站",
};

const levelLabels = ["", "基础待稳定", "依赖提示", "接近三级所需", "稳定优势"];

export default async function DiagnosticResultPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string }>;
}) {
  const { id, token } = await searchParams;
  if (!id || !token) notFound();

  const attempt = await prisma.diagnosticAttempt.findFirst({
    where: { id, accessToken: token },
    include: { answers: true },
  });
  if (!attempt) notFound();

  const report = buildDiagnosticReport(attempt.answers);
  const strongest = report.strengths[0] ?? "任务坚持";
  const nextSkill =
    report.primaryBottleneck.type === "strategy"
      ? "主动圈出转折词、条件词和指代词"
      : report.primaryBottleneck.type === "output"
        ? "每个判断都带上一条文本证据"
        : report.primaryBottleneck.type === "speed"
          ? "在限定时间内先锁定关键信息"
          : "用短任务稳定最薄弱的信息节点";

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>⌖ <span>DSE中文 · 情报侦察站</span></Link>
        <span>MISSION 01 / DEBRIEF</span>
      </header>

      <section className={styles.hero}>
        <span className={styles.kicker}>ANALYST DEBRIEF / 战后复盘</span>
        <h1>第一场侦察报告</h1>
        <p>这不是 DSE 等级预测。报告只描述本次任务中，信息处理在哪个环节开始掉速或失真。</p>
        <div className={styles.summaryGrid}>
          <div>
            <small>最强能力</small>
            <strong>{strongest}</strong>
            <span>已获得能力徽章</span>
          </div>
          <div className={styles.obstacle}>
            <small>当前任务障碍</small>
            <strong>{report.primaryBottleneck.title}</strong>
            <span>{report.primaryBottleneck.summary}</span>
          </div>
          <div>
            <small>战术适应力</small>
            <strong>{Math.round(report.tacticalAdaptability * 100)}%</strong>
            <span>提示后成功改善的比例</span>
          </div>
        </div>
      </section>

      <section className={styles.reportBody}>
        <div className={styles.dimensionSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>09 CAPABILITY SIGNALS</span>
              <h2>能力侦察矩阵</h2>
            </div>
            <p>“接近三级所需”表示能力距离，不代表正式等级。</p>
          </div>
          <div className={styles.dimensionGrid}>
            {report.dimensions.map((dimension, index) => (
              <article key={dimension.id}>
                <span>0{index + 1}</span>
                <div>
                  <strong>{dimension.label}</strong>
                  <small>{dimension.level ? levelLabels[dimension.level] : "第二场补充证据"}</small>
                </div>
                <i>
                  {[1, 2, 3, 4].map((level) => (
                    <b key={level} className={dimension.level && level <= dimension.level ? styles.filled : ""} />
                  ))}
                </i>
                <em>{dimension.evidenceCount} 条证据</em>
              </article>
            ))}
          </div>
        </div>

        <aside className={styles.evidencePanel}>
          <span className={styles.kicker}>EVIDENCE LOG</span>
          <h2>为什么得出这个判断？</h2>
          <ul>
            {[...report.primaryBottleneck.evidence, ...report.evidence].map((item, index) => (
              <li key={`${item}-${index}`}><span>0{index + 1}</span><p>{item}</p></li>
            ))}
          </ul>
          <div className={styles.nextSkill}>
            <small>下一项需要解锁的技能</small>
            <strong>{nextSkill}</strong>
          </div>
        </aside>
      </section>

      <section className={styles.nextMission}>
        <div>
          <span className={styles.kicker}>NEXT MISSION / 02</span>
          <h2>行动报告</h2>
          <p>第二场将比较口头构思、结构提纲和手写交付，确认理解到书面表达之间是否发生损耗。</p>
        </div>
        <button type="button" disabled>第二场功能规划中</button>
      </section>

      <footer className={styles.footer}>
        <span>报告生成于 {attempt.completedAt?.toLocaleString("zh-CN", { timeZone: "Asia/Hong_Kong" }) ?? "任务进行中"}</span>
        <Link href="/">返回侦察站首页</Link>
      </footer>
    </main>
  );
}
