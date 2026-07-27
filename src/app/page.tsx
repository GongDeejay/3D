"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const missions = [
  { id: "01", title: "电台解码", meta: "语音编码 · 6 MIN", icon: "wave", status: "ready" },
  { id: "02", title: "指令拆解", meta: "逻辑关系 · 7 MIN", icon: "nodes", status: "locked" },
  { id: "03", title: "情报研判", meta: "阅读推断 · 15 MIN", icon: "scan", status: "locked" },
  { id: "04", title: "古文密令", meta: "文言基础 · 8 MIN", icon: "scroll", status: "locked" },
];

const dimensions = [
  "语音编码", "词句切分", "字面理解", "逻辑关系", "隐含推断",
  "证据表达", "任务执行", "结构表达", "书写交付",
];

function Icon({ type }: { type: string }) {
  if (type === "wave") {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 16h3m2-5v10m4-15v20m4-14v8m4-12v16m4-11v6m2-3h3" /></svg>;
  }
  if (type === "nodes") {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="8" cy="8" r="3" /><circle cx="24" cy="8" r="3" /><circle cx="16" cy="24" r="3" /><path d="m10.5 9.5 4 11m7-11-4 11M11 8h10" /></svg>;
  }
  if (type === "scan") {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 11V5h6m10 0h6v6m0 10v6h-6M11 27H5v-6M9 16h14M16 9v14" /><circle cx="16" cy="16" r="4" /></svg>;
  }
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 4h14l3 3v21H8zM8 4 5 7v21h3M12 11h9m-9 5h9m-9 5h6" /></svg>;
}

export default function HomePage() {
  const [script, setScript] = useState<"简" | "繁">("简");
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [time, setTime] = useState("00:00:00");

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("zh-CN", { hour12: false, timeZone: "Asia/Hong_Kong" }));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="DSE中文情报侦察站首页">
          <span className={styles.brandMark}>
            <span />
            <span />
          </span>
          <span className={styles.brandText}>
            <strong>DSE中文</strong>
            <small>情报侦察站</small>
          </span>
        </Link>

        <div className={styles.systemLine}>
          <span className={styles.liveDot} />
          <span>系统在线</span>
          <i />
          <span>HK {time}</span>
        </div>

        <nav className={styles.nav}>
          <button className={styles.ruleButton} onClick={() => setBriefingOpen(true)}>
            任务规则
          </button>
          <div className={styles.scriptToggle} aria-label="简繁显示切换">
            {(["简", "繁"] as const).map((item) => (
              <button
                key={item}
                className={script === item ? styles.activeScript : ""}
                onClick={() => setScript(item)}
                aria-pressed={script === item}
              >
                {item}
              </button>
            ))}
          </div>
          <Link className={styles.parentLink} href="/admin">
            家长通道 <span>↗</span>
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><span>机密任务</span> / 代号 CHI-08</div>
          <h1>
            每一条信息，
            <br />
            <em>在哪里失真？</em>
          </h1>
          <p className={styles.lead}>
            这不是一场考试。你将作为情报分析员，接收线索、判断意图并提交行动报告。系统会追踪信息从进入大脑到写在纸上的每一个环节。
          </p>

          <div className={styles.heroActions}>
            <Link
              className={styles.primaryCta}
              href="/diagnostic"
            >
              <span className={styles.crosshair}>⌖</span>
              接收首项任务
              <span className={styles.arrow}>→</span>
            </Link>
            <button className={styles.secondaryCta} onClick={() => setBriefingOpen(true)}>
              查看任务简报
            </button>
          </div>

          <div className={styles.protocol}>
            <span><b>02</b> 场独立任务</span>
            <span><b>~68</b> 分钟总时长</span>
            <span><b>09</b> 项能力追踪</span>
          </div>
        </div>

        <div className={styles.radarPanel} aria-label="任务侦察地图">
          <div className={styles.mapLabel}>SECTOR MAP // NT-09</div>
          <div className={styles.coordinates}>22.3193° N<br />114.1694° E</div>
          <svg className={styles.contours} viewBox="0 0 600 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <path d="M-30 60C90 10 130 120 215 88S340 5 430 54s80 126 180 94" />
            <path d="M-20 102C82 55 134 157 224 125S351 43 436 88s82 118 176 100" />
            <path d="M-45 350c100-72 197-9 263-58s94-123 184-100 72 117 200 104" />
            <path d="M-55 398c102-69 206-5 274-57s97-117 180-96 84 108 212 94" />
            <path d="M41 481c57-81 117-45 175-84s85-106 156-80 71 103 166 92" />
            <path d="M390-10c-24 62 28 99 4 158s-91 65-82 143 84 80 47 165" />
          </svg>
          <div className={styles.gridOverlay} />
          <div className={`${styles.mapPoint} ${styles.pointOne}`}><span>01</span><small>接收</small></div>
          <div className={`${styles.mapPoint} ${styles.pointTwo}`}><span>02</span><small>切分</small></div>
          <div className={`${styles.mapPoint} ${styles.pointThree}`}><span>03</span><small>研判</small></div>
          <div className={`${styles.mapPoint} ${styles.pointFour}`}><span>04</span><small>输出</small></div>
          <div className={styles.radar}>
            <span className={styles.radarSweep} />
            <span className={styles.radarCore} />
          </div>
          <div className={styles.signalCard}>
            <span className={styles.signalIcon}>⌁</span>
            <div>
              <small>当前信号</small>
              <strong>等待分析员接入</strong>
            </div>
            <span className={styles.signalBars}>▂▄▆█</span>
          </div>
        </div>
      </section>

      <section className={styles.pipeline} aria-label="诊断路径">
        <span className={styles.pipelineTitle}>情报处理链</span>
        {["接收信息", "切分词句", "理解逻辑", "推断意图", "书面输出"].map((step, index) => (
          <div className={styles.pipelineStep} key={step}>
            <b>0{index + 1}</b>
            <span>{step}</span>
            {index < 4 && <i>→</i>}
          </div>
        ))}
        <span className={styles.pipelineNote}>全程记录速度 · 修正 · 提示反应</span>
      </section>

      <section className={styles.missionSection} id="mission-map">
        <div className={styles.sectionIntro}>
          <div>
            <span className={styles.kicker}>MISSION SEQUENCE / 任务序列</span>
            <h2>第一场 · 信息侦察</h2>
            <p>确认中文信息在哪一个节点开始丢失、变慢或变形。</p>
          </div>
          <div className={styles.sessionMeta}>
            <div><small>预计用时</small><strong>36 MIN</strong></div>
            <div><small>任务数量</small><strong>04 / 07</strong></div>
            <span className={styles.readyStatus}>准备就绪</span>
          </div>
        </div>

        <div className={styles.missionGrid}>
          {missions.map((mission, index) => (
            <article className={`${styles.missionCard} ${index === 0 ? styles.currentMission : ""}`} key={mission.id}>
              <div className={styles.cardTop}>
                <span className={styles.missionNumber}>{mission.id}</span>
                <span className={styles.missionState}>
                  {mission.status === "ready" ? "开放" : "待解锁"}
                </span>
              </div>
              <div className={styles.missionIcon}><Icon type={mission.icon} /></div>
              <h3>{mission.title}</h3>
              <p>{mission.meta}</p>
              <div className={styles.cardLine}><span /></div>
              <button
                disabled={mission.status !== "ready"}
                onClick={() => {
                  if (mission.status === "ready") window.location.href = "/diagnostic";
                }}
              >
                {mission.status === "ready" ? "开始解码" : "完成前序任务"}
                <span>{mission.status === "ready" ? "→" : "⌕"}</span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.diagnosticSection}>
        <div className={styles.diagnosticCopy}>
          <span className={styles.kicker}>DIAGNOSTIC, NOT PREDICTION</span>
          <h2>不是预测等级，<br />而是定位<em>卡点。</em></h2>
          <p>同一道任务会记录无提示、结构提示与选项提示下的变化，分清“不会”和“会但来不及”。</p>
          <div className={styles.hintMetric}>
            <div className={styles.hintGauge}><span /></div>
            <div><small>核心指标</small><strong>战术适应力</strong></div>
            <b>提示后改善速度</b>
          </div>
        </div>
        <div className={styles.dimensionPanel}>
          <div className={styles.dimensionHeader}>
            <span>能力侦察矩阵</span>
            <small>09 SIGNALS TRACKED</small>
          </div>
          <div className={styles.dimensionGrid}>
            {dimensions.map((dimension, index) => (
              <div key={dimension}>
                <span>0{index + 1}</span>
                <strong>{dimension}</strong>
                <i><b style={{ width: `${34 + (index % 4) * 13}%` }} /></i>
              </div>
            ))}
          </div>
          <p>结果仅显示“三级能力距离”，不换算正式 DSE 等级。</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.brandMark}><span /><span /></span>
          <div><strong>DSE中文 · 情报侦察站</strong><small>让看不见的思考过程显影</small></div>
        </div>
        <p>本工具不用于医学或学习障碍诊断</p>
        <span>PROTOCOL 01 / BETA</span>
      </footer>

      {briefingOpen && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setBriefingOpen(false)}>
          <section className={styles.briefingModal} role="dialog" aria-modal="true" aria-labelledby="briefing-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setBriefingOpen(false)} aria-label="关闭">×</button>
            <span className={styles.kicker}>MISSION BRIEF / 任务简报</span>
            <h2 id="briefing-title">分析员须知</h2>
            <p>你不需要预先学过 DSE 题型。请按自己的理解完成任务；遇到困难时，可调用提示。</p>
            <ol>
              <li><b>先独立判断</b><span>系统会保存你的首次答案，不必追求一次完美。</span></li>
              <li><b>需要时申请提示</b><span>提示不是扣分，而是帮助判断你适合哪种策略。</span></li>
              <li><b>可以暂停任务</b><span>两场任务可分开完成，进度会自动保存。</span></li>
            </ol>
            <button className={styles.modalAction} onClick={() => setBriefingOpen(false)}>确认简报 · 准备接入</button>
          </section>
        </div>
      )}
    </main>
  );
}
