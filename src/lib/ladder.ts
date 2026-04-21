/**
 * 能力阶梯（产品路线图）。MVP 仅第一阶梯有正式问卷，其余为占位页，便于后续接题库。
 */
export type LadderStep = {
  order: number;
  slug: string;
  title: string;
  short: string;
  /** 是否已有可填问卷模板 */
  available: boolean;
  templateKey?: string;
};

export const LADDER_STEPS: LadderStep[] = [
  {
    order: 1,
    slug: "step-1",
    title: "第一阶梯：交互素养",
    short: "如何把需求说清楚、多轮澄清、基本安全意识",
    available: true,
    templateKey: "interaction-literacy-v1",
  },
  {
    order: 2,
    slug: "step-2",
    title: "第二阶梯：评估素养",
    short: "辨别幻觉、查证来源、评价适用边界",
    available: false,
  },
  {
    order: 3,
    slug: "step-3",
    title: "第三阶梯：治理与迁移",
    short: "数据与合规、工作流迁移、人机分工",
    available: false,
  },
];

export function getNextStepAfterTemplate(templateKey: string | undefined): LadderStep | null {
  const idx = LADDER_STEPS.findIndex((s) => s.templateKey === templateKey);
  if (idx < 0) return LADDER_STEPS[1] ?? null;
  return LADDER_STEPS[idx + 1] ?? null;
}
