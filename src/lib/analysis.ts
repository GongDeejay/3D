import type { BankQuestion } from "@/lib/question-bank/interaction-literacy-v1";
import { INTERACTION_LITERACY_V1 } from "@/lib/question-bank/interaction-literacy-v1";

export type DimensionAggregate = {
  tag: "interaction" | "evaluation" | "governance_light";
  average: number | null;
  count: number;
};

export type DistributionInsight = {
  templateKey: string;
  responseCount: number;
  /** 所有李克特题平均分 1–5，null 表示无数据 */
  overallLikertMean: number | null;
  byDimension: DimensionAggregate[];
  /** 情景题得分（本题满分 2） */
  scenarioScore: { mean: number | null; max: number };
  /** 面向组织者的下一步建议（规则生成，可后续换为 LLM） */
  nextSteps: string[];
};

function getBank(templateKey: string): { questions: BankQuestion[] } | null {
  if (templateKey === INTERACTION_LITERACY_V1.templateKey) return INTERACTION_LITERACY_V1;
  return null;
}

function mean(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function analyzeResponses(
  templateKey: string,
  answersList: Record<string, unknown>[],
): DistributionInsight {
  const bank = getBank(templateKey);
  if (!bank) {
    return {
      templateKey,
      responseCount: answersList.length,
      overallLikertMean: null,
      byDimension: [],
      scenarioScore: { mean: null, max: 2 },
      nextSteps: ["未识别的题库版本，无法生成解读。请在后台检查 templateKey。"],
    };
  }

  const likertValues: number[] = [];
  const byTag: Record<string, number[]> = {
    interaction: [],
    evaluation: [],
    governance_light: [],
  };
  const scenarioScores: number[] = [];

  for (const raw of answersList) {
    for (const q of bank.questions) {
      if (q.kind === "likert") {
        const v = raw[q.id];
        if (typeof v === "number" && v >= 1 && v <= 5) {
          likertValues.push(v);
          for (const t of q.tags) byTag[t].push(v);
        }
      } else {
        const oid = raw[q.id];
        if (typeof oid === "string") {
          const opt = q.options.find((o) => o.id === oid);
          if (opt) scenarioScores.push(opt.score);
        }
      }
    }
  }

  const dims: DimensionAggregate[] = (["interaction", "evaluation", "governance_light"] as const).map(
    (tag) => ({
      tag,
      average: mean(byTag[tag]),
      count: byTag[tag].length,
    }),
  );

  const overallLikertMean = mean(likertValues);
  const scenarioMean = mean(scenarioScores);

  const nextSteps: string[] = [];

  if (answersList.length === 0) {
    nextSteps.push("尚无回收数据。可分享填写链接，并简要说明本次场景与填写预计耗时。");
  } else {
    if (overallLikertMean != null && overallLikertMean < 3) {
      nextSteps.push(
        "整体自评偏低：建议组织一次 15 分钟的「如何向 AI 说清楚需求」微工作坊，并配 2～3 个示范对话。",
      );
    } else if (overallLikertMean != null && overallLikertMean < 4) {
      nextSteps.push("整体中等：可推送「多轮澄清 + 核对事实」的清单式作业（每条 3 分钟）。");
    } else {
      nextSteps.push("整体较积极：可进入下一阶段（例如轻量「评估素养」补题或情景演练）。");
    }

    const inter = dims.find((d) => d.tag === "interaction")?.average;
    if (inter != null && inter < 3.5) {
      nextSteps.push("交互维度偏弱：重点练「背景—目标—约束—例子」四要素提示模板。");
    }

    const eva = dims.find((d) => d.tag === "evaluation")?.average;
    if (eva != null && eva < 3.5) {
      nextSteps.push("评估维度偏弱：用「找错/找来源」类互动题训练，不急于教复杂模型知识。");
    }

    const gov = dims.find((d) => d.tag === "governance_light")?.average;
    if (gov != null && gov < 4) {
      nextSteps.push("安全与合规意识需强化：结合本次场景补充「哪些信息绝不能粘贴」的正面清单。");
    }

    if (scenarioMean != null && scenarioMean < 1.5) {
      nextSteps.push("情景题得分偏低：多数人尚未形成「先交代语境再生成」的习惯，可用对比案例演示。");
    }
  }

  return {
    templateKey,
    responseCount: answersList.length,
    overallLikertMean,
    byDimension: dims,
    scenarioScore: { mean: scenarioMean, max: 2 },
    nextSteps: Array.from(new Set(nextSteps)),
  };
}
