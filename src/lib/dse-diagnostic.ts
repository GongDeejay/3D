import {
  DIAGNOSTIC_DIMENSIONS,
  DIMENSION_LABELS,
  DSE_DIAGNOSTIC_QUESTIONS,
  type DiagnosticDimension,
  type DiagnosticQuestion,
} from "@/lib/question-bank/dse-chinese-diagnostic-v1";

export type DiagnosticAnswerValue = string;

export type ScoredAnswer = {
  score: number;
  dimensionScores: Partial<Record<DiagnosticDimension, number>>;
};

export type StoredDiagnosticAnswer = {
  questionId: string;
  firstAnswer: unknown;
  finalAnswer: unknown;
  firstResponseMs: number;
  totalResponseMs: number;
  hintLevel: number;
  revisionCount: number;
  score: number;
  dimensionScores: unknown;
};

export type DimensionResult = {
  id: DiagnosticDimension;
  label: string;
  score: number | null;
  level: 1 | 2 | 3 | 4 | null;
  evidenceCount: number;
  averageResponseMs: number | null;
};

export type DiagnosticReport = {
  completionRate: number;
  overallScore: number;
  tacticalAdaptability: number;
  dimensions: DimensionResult[];
  primaryBottleneck: {
    type: "knowledge" | "strategy" | "output" | "speed" | "transfer" | "insufficient_data";
    title: string;
    summary: string;
    evidence: string[];
  };
  strengths: string[];
  evidence: string[];
};

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function findDiagnosticQuestion(questionId: string): DiagnosticQuestion | null {
  return DSE_DIAGNOSTIC_QUESTIONS.find((question) => question.id === questionId) ?? null;
}

export function validateDiagnosticAnswer(question: DiagnosticQuestion, value: unknown): value is string {
  const answer = normalize(value);
  if (!answer) return false;
  if (question.kind === "single_choice") {
    return Boolean(question.options?.some((option) => option.id === answer));
  }
  return answer.length >= 2 && answer.length <= 500;
}

export function scoreDiagnosticAnswer(question: DiagnosticQuestion, value: unknown): ScoredAnswer {
  const answer = normalize(value);
  let score = 0;

  if (question.scoring.type === "option") {
    score = answer === question.scoring.correctOptionId ? 1 : 0;
  } else {
    const matches = question.scoring.keywords.filter((keyword) => answer.includes(keyword)).length;
    score = Math.min(1, matches / question.scoring.minimumMatches);
  }

  return {
    score,
    dimensionScores: Object.fromEntries(question.dimensions.map((dimension) => [dimension, score])),
  };
}

function getLevel(score: number): 1 | 2 | 3 | 4 {
  if (score < 0.4) return 1;
  if (score < 0.65) return 2;
  if (score < 0.85) return 3;
  return 4;
}

function asDimensionScores(value: unknown): Partial<Record<DiagnosticDimension, number>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const output: Partial<Record<DiagnosticDimension, number>> = {};
  for (const dimension of DIAGNOSTIC_DIMENSIONS) {
    const score = (value as Record<string, unknown>)[dimension];
    if (typeof score === "number" && score >= 0 && score <= 1) output[dimension] = score;
  }
  return output;
}

export function buildDiagnosticReport(answers: StoredDiagnosticAnswer[]): DiagnosticReport {
  const expectedCount = DSE_DIAGNOSTIC_QUESTIONS.length;
  const completionRate = Math.min(1, answers.length / expectedCount);
  const overallScore = answers.length
    ? answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length
    : 0;

  const dimensions: DimensionResult[] = DIAGNOSTIC_DIMENSIONS.map((id) => {
    const relevant = answers.filter((answer) => asDimensionScores(answer.dimensionScores)[id] != null);
    if (!relevant.length) {
      return { id, label: DIMENSION_LABELS[id], score: null, level: null, evidenceCount: 0, averageResponseMs: null };
    }
    const score = relevant.reduce((sum, answer) => sum + (asDimensionScores(answer.dimensionScores)[id] ?? 0), 0) / relevant.length;
    const averageResponseMs = relevant.reduce((sum, answer) => sum + answer.totalResponseMs, 0) / relevant.length;
    return { id, label: DIMENSION_LABELS[id], score, level: getLevel(score), evidenceCount: relevant.length, averageResponseMs };
  });

  const hinted = answers.filter((answer) => answer.hintLevel > 0);
  const improved = hinted.filter((answer) => {
    const question = findDiagnosticQuestion(answer.questionId);
    if (!question) return false;
    return scoreDiagnosticAnswer(question, answer.firstAnswer).score < answer.score;
  });
  const tacticalAdaptability = hinted.length ? improved.length / hinted.length : 0;

  const slowAnswers = answers.filter((answer) => answer.totalResponseMs > 75_000);
  const familiar = answers.filter((answer) => findDiagnosticQuestion(answer.questionId)?.topic === "familiar");
  const unfamiliar = answers.filter((answer) => findDiagnosticQuestion(answer.questionId)?.topic === "unfamiliar");
  const familiarScore = familiar.length ? familiar.reduce((sum, answer) => sum + answer.score, 0) / familiar.length : null;
  const unfamiliarScore = unfamiliar.length ? unfamiliar.reduce((sum, answer) => sum + answer.score, 0) / unfamiliar.length : null;
  const weakest = dimensions
    .filter((dimension): dimension is DimensionResult & { score: number } => dimension.score != null)
    .sort((a, b) => a.score - b.score)[0];

  let primaryBottleneck: DiagnosticReport["primaryBottleneck"];
  if (answers.length < 4 || !weakest) {
    primaryBottleneck = {
      type: "insufficient_data",
      title: "情报样本不足",
      summary: "完成更多任务后，系统才能定位稳定卡点。",
      evidence: [`目前完成 ${answers.length} / ${expectedCount} 题。`],
    };
  } else if (tacticalAdaptability >= 0.5 && hinted.length >= 2) {
    primaryBottleneck = {
      type: "strategy",
      title: "策略调用尚未自动化",
      summary: "获得少量结构提示后能明显修正，能力基础存在，下一步应练习主动寻找逻辑标志。",
      evidence: [`${improved.length} / ${hinted.length} 道使用提示的题目在提示后改善。`],
    };
  } else if (unfamiliarScore != null && familiarScore != null && familiarScore - unfamiliarScore >= 0.3) {
    primaryBottleneck = {
      type: "transfer",
      title: "陌生题材迁移受阻",
      summary: "熟悉材料中的能力未能稳定迁移到生活、文化或社会题材。",
      evidence: [`熟悉题材正确率 ${Math.round(familiarScore * 100)}%，陌生题材正确率 ${Math.round(unfamiliarScore * 100)}%。`],
    };
  } else if (slowAnswers.length >= Math.max(3, answers.length / 3) && overallScore >= 0.6) {
    primaryBottleneck = {
      type: "speed",
      title: "正确但处理速度偏慢",
      summary: "大部分判断能够完成，但处理时间可能影响长卷中的稳定交付。",
      evidence: [`${slowAnswers.length} 道题耗时超过 75 秒。`],
    };
  } else if (weakest.id === "evidence_expression" || weakest.id === "structural_expression" || weakest.id === "written_delivery") {
    primaryBottleneck = {
      type: "output",
      title: "理解到书面交付之间有损耗",
      summary: "主要困难出现在把判断写完整、带证据并组织成可评分答案。",
      evidence: [`当前最低维度为“${weakest.label}”，正确表现为 ${Math.round(weakest.score * 100)}%。`],
    };
  } else {
    primaryBottleneck = {
      type: "knowledge",
      title: `${weakest.label}基础尚未稳定`,
      summary: "目前即使提供提示也未形成稳定改善，需要先补足相关词句知识并配合短任务练习。",
      evidence: [`“${weakest.label}”基于 ${weakest.evidenceCount} 条证据，正确表现为 ${Math.round(weakest.score * 100)}%。`],
    };
  }

  const strengths = dimensions
    .filter((dimension): dimension is DimensionResult & { score: number } => dimension.score != null && dimension.score >= 0.75)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((dimension) => dimension.label);

  const evidence = [
    `已完成 ${answers.length} / ${expectedCount} 题，原始正确表现 ${Math.round(overallScore * 100)}%。`,
    hinted.length
      ? `共调用提示 ${hinted.length} 次，其中 ${improved.length} 次带来答案改善。`
      : "本次尚未调用提示，无法判断提示后的战术适应力。",
    slowAnswers.length ? `${slowAnswers.length} 道题总耗时超过 75 秒。` : "已完成题目未出现集中性超时。",
  ];

  return {
    completionRate,
    overallScore,
    tacticalAdaptability,
    dimensions,
    primaryBottleneck,
    strengths,
    evidence,
  };
}
