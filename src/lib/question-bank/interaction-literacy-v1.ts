/**
 * MVP 分支：交互素养（大众化入门）+ 轻量评估/治理意识
 * 题库版本 interaction-literacy-v1
 */

export type LikertQuestion = {
  id: string;
  kind: "likert";
  text: string;
  /** 用于统计与解读的维度标签 */
  tags: ("interaction" | "evaluation" | "governance_light")[];
};

export type McqOption = { id: string; label: string; score: number };

export type McqQuestion = {
  id: string;
  kind: "mcq";
  text: string;
  tags: ("interaction" | "evaluation" | "governance_light")[];
  options: McqOption[];
};

export type BankQuestion = LikertQuestion | McqQuestion;

export const INTERACTION_LITERACY_V1: {
  templateKey: "interaction-literacy-v1";
  title: string;
  description: string;
  questions: BankQuestion[];
} = {
  templateKey: "interaction-literacy-v1",
  title: "交互素养 · 短问卷",
  description:
    "面向日常使用者：如何与 AI 对话、澄清需求，并对输出保持基本判断。适合作为接触 AI 学习的第一站。",
  questions: [
    {
      id: "il_l1",
      kind: "likert",
      text: "在向 AI 提问前，我会尽量说明背景信息和目标（把需求说清楚）。",
      tags: ["interaction"],
    },
    {
      id: "il_l2",
      kind: "likert",
      text: "我会用多轮对话逐步澄清，而不是期待一次就得到完美答案。",
      tags: ["interaction"],
    },
    {
      id: "il_l3",
      kind: "likert",
      text: "当 AI 给出事实性说法时，我会主动核对来源或在其他地方验证。",
      tags: ["evaluation"],
    },
    {
      id: "il_l4",
      kind: "likert",
      text: "我知道不应向 AI 粘贴密码、内部机密或个人敏感信息。",
      tags: ["governance_light"],
    },
    {
      id: "il_l5",
      kind: "likert",
      text: "我会把 AI 输出当作「待核实草稿」，而不是直接当作权威结论。",
      tags: ["evaluation"],
    },
    {
      id: "il_m1",
      kind: "mcq",
      text: "当你需要让 AI 帮你写一份给老板的周报时，下面哪种做法更稳妥？",
      tags: ["interaction"],
      options: [
        { id: "a", label: "把上周全文直接粘贴，让 AI 随便改改", score: 0 },
        { id: "b", label: "先说明岗位职责、本周重点、语气与字数，再让 AI 起草", score: 2 },
        { id: "c", label: "只输入「帮我写周报」一句话", score: 0 },
        { id: "d", label: "随机选一个网络模板复制给 AI", score: 0 },
      ],
    },
  ],
};

export const likertLabels = [
  "强烈不同意",
  "不同意",
  "中立",
  "同意",
  "强烈同意",
] as const;
