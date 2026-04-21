import type { BankQuestion } from "@/lib/question-bank/interaction-literacy-v1";
import { INTERACTION_LITERACY_V1 } from "@/lib/question-bank/interaction-literacy-v1";

export type UserRatingResult = {
  /** 综合分 0–100 */
  score100: number;
  band: "萌新" | "入门" | "进阶" | "熟练";
  letter: "D" | "C" | "B" | "A" | "A+";
  /** 一句话反馈 */
  summary: string;
  likertMean: number | null;
  scenarioScore: number;
  scenarioMax: number;
  /** 给填写者的即时建议 */
  tips: string[];
};

function mean(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * 将单次作答转为 0–100 分与等级（与 interaction-literacy-v1 题库对齐）。
 * 李克特均分映射到 0–80 分权重，情景题 0–20 分权重。
 */
export function rateIndividualAnswers(
  templateKey: string,
  answers: Record<string, unknown>,
): UserRatingResult | null {
  if (templateKey !== INTERACTION_LITERACY_V1.templateKey) return null;

  const bank = INTERACTION_LITERACY_V1.questions as BankQuestion[];
  const likert: number[] = [];
  let scenarioPts = 0;
  let scenarioMax = 0;

  for (const q of bank) {
    if (q.kind === "likert") {
      const v = answers[q.id];
      if (typeof v === "number" && v >= 1 && v <= 5) likert.push(v);
    } else {
      scenarioMax = Math.max(scenarioMax, ...q.options.map((o) => o.score));
      const oid = answers[q.id];
      if (typeof oid === "string") {
        const opt = q.options.find((o) => o.id === oid);
        if (opt) scenarioPts = Math.max(scenarioPts, opt.score);
      }
    }
  }

  const likertMean = mean(likert);
  const likertPart =
    likertMean != null ? ((likertMean - 1) / 4) * 80 : 0;
  const scenarioPart = scenarioMax > 0 ? (scenarioPts / scenarioMax) * 20 : 0;
  const score100 = Math.round(Math.min(100, Math.max(0, likertPart + scenarioPart)));

  let band: UserRatingResult["band"];
  let letter: UserRatingResult["letter"];
  if (score100 < 40) {
    band = "萌新";
    letter = "D";
  } else if (score100 < 60) {
    band = "入门";
    letter = "C";
  } else if (score100 < 80) {
    band = "进阶";
    letter = "B";
  } else if (score100 < 92) {
    band = "熟练";
    letter = "A";
  } else {
    band = "熟练";
    letter = "A+";
  }

  const tips: string[] = [];
  if (likertMean != null && likertMean < 3.5) {
    tips.push("下次提问时先写清：背景、目标、约束（字数/语气），再让 AI 出稿。");
  }
  if (scenarioPts < scenarioMax) {
    tips.push("需要结构化任务时，先交代岗位与重点，再生成内容，比「一句话任务」更稳。");
  }
  if (likertMean != null && likertMean >= 4) {
    tips.push("你已习惯把 AI 当草稿；可继续练「追问来源」与「交叉验证」。");
  }
  if (!tips.length) {
    tips.push("保持多轮澄清与事后核对，再挑战下一阶梯测评。");
  }

  const summary = `综合得分 ${score100} 分（${letter} · ${band}）—— ${
    score100 < 50
      ? "建议先按下方巩固项练熟，再进入下一阶梯。"
      : score100 < 75
        ? "基础良好，可按兴趣选择「巩固」或「下一阶梯」。"
        : "表现突出，适合进入下一阶梯或做迁移场景练习。"
  }`;

  return {
    score100,
    band,
    letter,
    summary,
    likertMean,
    scenarioScore: scenarioPts,
    scenarioMax,
    tips: Array.from(new Set(tips)).slice(0, 4),
  };
}
