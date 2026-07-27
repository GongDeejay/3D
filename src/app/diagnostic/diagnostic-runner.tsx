"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";

import {
  completeDiagnosticAttemptAction,
  saveDiagnosticAnswerAction,
  startOrResumeDiagnosticAction,
} from "@/app/diagnostic/actions";
import type {
  DiagnosticModule,
  PublicDiagnosticQuestion,
} from "@/lib/question-bank/dse-chinese-diagnostic-v1";
import styles from "./diagnostic.module.css";

type PublicBank = {
  title: string;
  description: string;
  modules: DiagnosticModule[];
  questions: PublicDiagnosticQuestion[];
};

type DistributionContext = {
  slug: string;
  title: string;
  scenarioSummary: string;
  scenarioDetail: string;
};

const saveErrorMessages: Record<string, string> = {
  invalid_payload: "作答过程数据格式异常，请重新点击保存；你的当前答案仍保留在页面上。",
  attempt_unavailable: "本次任务已结束或续做凭证失效，请重新打开发放链接。",
  unknown_question: "题库版本不一致，请刷新页面后重试。",
  invalid_answer: "答案格式未通过校验，请重新选择或补充答案。",
  storage_error: "存储服务暂时繁忙，答案仍保留在页面上，请再次点击保存。",
};

export function DiagnosticRunner({
  bank,
  distribution,
}: {
  bank: PublicBank;
  distribution?: DistributionContext;
}) {
  const [accessToken, setAccessToken] = useState("");
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [firstAnswer, setFirstAnswer] = useState("");
  const [firstResponseMs, setFirstResponseMs] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [revisionCount, setRevisionCount] = useState(0);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const startedRef = useRef(false);
  const questionStartedAt = useRef(0);

  const question = bank.questions[questionIndex];
  const currentModule = bank.modules.find((item) => item.id === question?.moduleId);
  const progress = Math.round((answeredIds.length / bank.questions.length) * 100);
  const storageKey = `dse-diagnostic-v1:${distribution?.slug ?? "demo"}:access-token`;

  const moduleQuestionCounts = useMemo(
    () => Object.fromEntries(bank.modules.map((item) => [
      item.id,
      bank.questions.filter((questionItem) => questionItem.moduleId === item.id).length,
    ])),
    [bank.modules, bank.questions],
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const savedToken = window.localStorage.getItem(storageKey) ?? undefined;
    startTransition(async () => {
      const result = await startOrResumeDiagnosticAction(savedToken, distribution?.slug);
      if (!result.ok) {
        setError("本次评测链接不可用，请联系发放者获取新链接。");
        return;
      }
      if (result.status === "completed") {
        window.localStorage.removeItem(storageKey);
        window.location.href = `/diagnostic/result?id=${encodeURIComponent(result.attemptId)}&token=${encodeURIComponent(result.accessToken)}`;
        return;
      }
      window.localStorage.setItem(storageKey, result.accessToken);
      setAccessToken(result.accessToken);
      setAnsweredIds(result.answeredQuestionIds);
      const firstUnanswered = bank.questions.findIndex((item) => !result.answeredQuestionIds.includes(item.id));
      setQuestionIndex(firstUnanswered >= 0 ? firstUnanswered : bank.questions.length - 1);
      questionStartedAt.current = window.performance.now();
    });
  }, [bank.questions, distribution?.slug, storageKey]);

  function resetQuestionState(nextIndex: number) {
    setQuestionIndex(nextIndex);
    setAnswer("");
    setFirstAnswer("");
    setFirstResponseMs(0);
    setHintLevel(0);
    setRevisionCount(0);
    setError("");
    questionStartedAt.current = window.performance.now();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectAnswer(value: string, eventTime: number) {
    if (!firstAnswer) {
      setFirstAnswer(value);
      setFirstResponseMs(Math.max(0, Math.round(eventTime - questionStartedAt.current)));
    } else if (value !== answer) {
      setRevisionCount((count) => count + 1);
    }
    setAnswer(value);
    setError("");
  }

  function requestHint() {
    if (!answer.trim()) {
      setError("请先留下你的首次判断，再申请提示。");
      return;
    }
    if (!firstAnswer) {
      setFirstAnswer(answer);
      setFirstResponseMs(Math.max(0, Math.round(window.performance.now() - questionStartedAt.current)));
    }
    setHintLevel((level) => Math.min(2, level + 1));
    setError("");
  }

  function playAudio() {
    if (!question.audioText || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(question.audioText);
    utterance.lang = "zh-CN";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  function saveAndContinue() {
    if (!answer.trim() || !question || !accessToken) {
      setError("请先完成本题。");
      return;
    }
    const initialAnswer = firstAnswer || answer;
    const initialMs = firstResponseMs || Math.max(0, Math.round(window.performance.now() - questionStartedAt.current));
    const totalResponseMs = Math.max(0, Math.round(window.performance.now() - questionStartedAt.current));

    startTransition(async () => {
      try {
        const result = await saveDiagnosticAnswerAction({
          accessToken,
          questionId: question.id,
          firstAnswer: initialAnswer,
          finalAnswer: answer,
          firstResponseMs: initialMs,
          totalResponseMs,
          hintLevel,
          revisionCount,
        });
        if (!result.ok) {
          setError(saveErrorMessages[result.error] ?? "保存未完成，请重试；你的当前答案仍保留在页面上。");
          return;
        }

        const nextAnswered = Array.from(new Set([...answeredIds, question.id]));
        setAnsweredIds(nextAnswered);
        const nextIndex = bank.questions.findIndex((item, index) => index > questionIndex && !nextAnswered.includes(item.id));
        if (nextIndex >= 0) {
          resetQuestionState(nextIndex);
          return;
        }

        const completed = await completeDiagnosticAttemptAction(accessToken);
        if (!completed.ok) {
          setError("任务记录尚未完整，请稍后重试。");
          return;
        }
        window.location.href = `/diagnostic/result?id=${encodeURIComponent(completed.attemptId)}&token=${encodeURIComponent(completed.accessToken)}`;
      } catch {
        setError("无法连接保存服务，请检查网络后重试；你的当前答案仍保留在页面上。");
      }
    });
  }

  if (!question || !currentModule) return null;

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span className={styles.reticle}>⌖</span>
          <span><strong>DSE中文</strong><small>情报侦察站</small></span>
        </Link>
        <div className={styles.progressWrap}>
          <span>任务进度</span>
          <i><b style={{ width: `${progress}%` }} /></i>
          <strong>{String(answeredIds.length).padStart(2, "0")} / {bank.questions.length}</strong>
        </div>
        <span className={styles.saveState}>
          <i /> {isPending ? "正在同步" : accessToken ? "进度已连接" : "正在接入"}
        </span>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <p>MISSION 01</p>
          <h1>信息侦察</h1>
          <span className={styles.duration}>预计 36 分钟</span>
          {distribution && (
            <div className={styles.batchContext}>
              <span>本次发放</span>
              <strong>{distribution.title}</strong>
              <p>{distribution.scenarioSummary}</p>
            </div>
          )}
          <nav>
            {bank.modules.map((item) => {
              const moduleQuestions = bank.questions.filter((q) => q.moduleId === item.id);
              const completedCount = moduleQuestions.filter((q) => answeredIds.includes(q.id)).length;
              const active = item.id === question.moduleId;
              return (
                <div className={`${styles.moduleItem} ${active ? styles.activeModule : ""}`} key={item.id}>
                  <span>{item.number}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{completedCount} / {moduleQuestionCounts[item.id]} · {item.estimatedMinutes} MIN</small>
                  </div>
                  <i>{completedCount === moduleQuestionCounts[item.id] ? "✓" : active ? "●" : "○"}</i>
                </div>
              );
            })}
          </nav>
          <div className={styles.sidebarNote}>
            <span>记录协议</span>
            <p>首次答案、修改、耗时和提示反应都会被保存。</p>
          </div>
        </aside>

        <section className={styles.questionArea}>
          <div className={styles.questionHeader}>
            <div>
              <span className={styles.kicker}>{currentModule.number} / {currentModule.title}</span>
              <h2>{question.title}</h2>
            </div>
            <span className={styles.scriptBadge}>
              {question.script === "traditional" ? "繁体材料" : "简体材料"}
            </span>
          </div>

          {question.instruction && <p className={styles.instruction}>{question.instruction}</p>}

          <article className={styles.intelCard}>
            <div className={styles.intelTop}>
              <span>INTELLIGENCE FEED</span>
              {question.audioText && (
                <button type="button" onClick={playAudio}>
                  <span>▶</span> 播放电台
                </button>
              )}
            </div>
            <p>{question.stimulus}</p>
          </article>

          <div className={styles.prompt}>
            <span>分析问题</span>
            <h3>{question.prompt}</h3>
          </div>

          {question.kind === "single_choice" ? (
            <div className={styles.options}>
              {question.options?.map((option, index) => (
                <button
                  type="button"
                  key={option.id}
                  className={answer === option.id ? styles.selectedOption : ""}
                  onClick={(event) => selectAnswer(option.id, event.timeStamp)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  <strong>{option.label}</strong>
                  <i>{answer === option.id ? "●" : ""}</i>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.textAnswer}>
              <textarea
                value={answer}
                maxLength={500}
                placeholder="输入你的结论，并尽量带上一条文本证据……"
                onChange={(event) => selectAnswer(event.target.value, event.timeStamp)}
              />
              <span>{answer.length} / 500</span>
            </div>
          )}

          {hintLevel > 0 && (
            <div className={styles.hintPanel}>
              <span>战术提示 {hintLevel} / 2</span>
              <p>{question.hints[hintLevel - 1]}</p>
              <small>提示后可以修改答案；系统会比较修改前后的变化。</small>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.controls}>
            <button
              type="button"
              className={styles.hintButton}
              onClick={requestHint}
              disabled={hintLevel >= 2 || isPending}
            >
              {hintLevel === 0 ? "申请结构提示" : hintLevel === 1 ? "申请方向提示" : "提示已全部使用"}
            </button>
            <button type="button" className={styles.nextButton} onClick={saveAndContinue} disabled={isPending}>
              {isPending ? "正在保存…" : questionIndex === bank.questions.length - 1 ? "完成侦察" : "锁定答案并继续"} <span>→</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
