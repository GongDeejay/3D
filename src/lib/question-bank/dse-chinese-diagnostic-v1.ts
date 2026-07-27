/**
 * DSE 中文底层能力诊断题库 v1
 *
 * 这是诊断题库，不是缩小版 DSE 试卷。题目按信息处理链设计，
 * templateKey 必须在改变评分含义时升级，避免历史作答被重新解释。
 */

export const DSE_DIAGNOSTIC_TEMPLATE_KEY = "dse-chinese-diagnostic-v1" as const;

export const DIAGNOSTIC_DIMENSIONS = [
  "phonological_encoding",
  "segmentation",
  "literal_comprehension",
  "logical_relation",
  "implicit_inference",
  "evidence_expression",
  "task_execution",
  "structural_expression",
  "written_delivery",
] as const;

export type DiagnosticDimension = (typeof DIAGNOSTIC_DIMENSIONS)[number];

export const DIMENSION_LABELS: Record<DiagnosticDimension, string> = {
  phonological_encoding: "语音编码",
  segmentation: "词句切分",
  literal_comprehension: "字面理解",
  logical_relation: "逻辑关系",
  implicit_inference: "隐含推断",
  evidence_expression: "证据表达",
  task_execution: "任务执行",
  structural_expression: "结构表达",
  written_delivery: "书写交付",
};

export type DiagnosticOption = {
  id: string;
  label: string;
};

export type DiagnosticQuestion = {
  id: string;
  moduleId: "radio" | "command" | "intel" | "classical";
  kind: "single_choice" | "short_text";
  title: string;
  stimulus: string;
  prompt: string;
  instruction?: string;
  audioText?: string;
  script: "simplified" | "traditional";
  topic: "familiar" | "unfamiliar" | "neutral";
  dimensions: DiagnosticDimension[];
  options?: DiagnosticOption[];
  hints: [string, string];
  scoring:
    | { type: "option"; correctOptionId: string }
    | { type: "keywords"; keywords: string[]; minimumMatches: number };
  evidenceNote: string;
};

export type DiagnosticModule = {
  id: DiagnosticQuestion["moduleId"];
  number: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  briefing: string;
};

export const DSE_DIAGNOSTIC_MODULES: DiagnosticModule[] = [
  {
    id: "radio",
    number: "01",
    title: "电台解码",
    subtitle: "语音编码 · 词句切分",
    estimatedMinutes: 6,
    briefing: "接收短句情报，分辨声音、词组和关键信息。",
  },
  {
    id: "command",
    number: "02",
    title: "指令拆解",
    subtitle: "条件 · 因果 · 指代",
    estimatedMinutes: 7,
    briefing: "把行动命令还原为清楚的条件与结果。",
  },
  {
    id: "intel",
    number: "03",
    title: "情报研判",
    subtitle: "信息整合 · 意图推断",
    estimatedMinutes: 15,
    briefing: "阅读熟悉与陌生题材，区分事实、关系和意图。",
  },
  {
    id: "classical",
    number: "04",
    title: "古文密令",
    subtitle: "句意 · 动机 · 主张",
    estimatedMinutes: 8,
    briefing: "利用上下文破译一段陌生古文，不考指定篇章背诵。",
  },
];

export const DSE_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "radio_meaning_01",
    moduleId: "radio",
    kind: "single_choice",
    title: "信号 A-17",
    stimulus: "在撤离之前，侦察小组需要确认补给路线是否安全。",
    prompt: "侦察小组需要确认什么？",
    instruction: "先播放电台，再选择最准确的意思。",
    audioText: "在撤离之前，侦察小组需要确认补给路线是否安全。",
    script: "simplified",
    topic: "familiar",
    dimensions: ["phonological_encoding", "literal_comprehension"],
    options: [
      { id: "a", label: "小组是否应该马上撤离" },
      { id: "b", label: "补给路线是否安全" },
      { id: "c", label: "补给是否已经送达" },
      { id: "d", label: "谁负责侦察路线" },
    ],
    hints: ["留意“确认”后面的内容。", "答案在“是否……”这一部分。"],
    scoring: { type: "option", correctOptionId: "b" },
    evidenceNote: "区分听懂整句与抓取动作宾语的能力。",
  },
  {
    id: "radio_segment_02",
    moduleId: "radio",
    kind: "single_choice",
    title: "词组切分",
    stimulus: "队员发现远处的观察站已经关闭。",
    prompt: "下面哪一种切分最符合句子的意思？",
    audioText: "队员发现远处的观察站已经关闭。",
    script: "simplified",
    topic: "familiar",
    dimensions: ["phonological_encoding", "segmentation"],
    options: [
      { id: "a", label: "队员发现远处 / 的观察 / 站已经关闭" },
      { id: "b", label: "队员 / 发现 / 远处的观察站 / 已经关闭" },
      { id: "c", label: "队员发现 / 远处的 / 观察 / 站已经关闭" },
      { id: "d", label: "队员 / 发现远 / 处的观察站 / 已经关闭" },
    ],
    hints: ["先找“谁做什么”。", "“远处的”与后面的地点名称连在一起。"],
    scoring: { type: "option", correctOptionId: "b" },
    evidenceNote: "观察连续语音能否切分为有意义的词组。",
  },
  {
    id: "radio_homophone_03",
    moduleId: "radio",
    kind: "single_choice",
    title: "同音辨识",
    stimulus: "指挥员要求各队密切协作，避免重复行动。",
    prompt: "电台中的“协作”应写成哪一个词？",
    audioText: "指挥员要求各队密切协作，避免重复行动。",
    script: "simplified",
    topic: "neutral",
    dimensions: ["phonological_encoding", "written_delivery"],
    options: [
      { id: "a", label: "协作" },
      { id: "b", label: "写作" },
      { id: "c", label: "携作" },
      { id: "d", label: "协做" },
    ],
    hints: ["这个词表示“一起配合完成任务”。", "第一个字有“十字旁”，第二个字是“工作”的“作”。"],
    scoring: { type: "option", correctOptionId: "a" },
    evidenceNote: "把已理解的语音准确映射到规范字形。",
  },
  {
    id: "command_condition_01",
    moduleId: "command",
    kind: "single_choice",
    title: "条件指令",
    stimulus: "如果甲队未能在天黑前抵达，而乙队仍有足够补给，则由乙队继续前进；否则两队原地待命。",
    prompt: "什么情况下由乙队继续前进？",
    script: "simplified",
    topic: "familiar",
    dimensions: ["segmentation", "logical_relation", "task_execution"],
    options: [
      { id: "a", label: "甲队迟到，或乙队有补给，满足其中一个即可" },
      { id: "b", label: "甲队按时到达，而且乙队有补给" },
      { id: "c", label: "甲队未按时到达，而且乙队有足够补给" },
      { id: "d", label: "只要乙队愿意继续就可以" },
    ],
    hints: ["留意两个条件之间的“而”。", "继续前进需要同时满足两个条件。"],
    scoring: { type: "option", correctOptionId: "c" },
    evidenceNote: "识别合取条件，而不是只抓住其中一个关键词。",
  },
  {
    id: "command_otherwise_02",
    moduleId: "command",
    kind: "single_choice",
    title: "“否则”范围",
    stimulus: "若天气稳定且通讯恢复，运输队便按原计划出发；否则延至明早再作决定。",
    prompt: "下列哪一种情况需要延至明早？",
    script: "simplified",
    topic: "neutral",
    dimensions: ["logical_relation", "literal_comprehension"],
    options: [
      { id: "a", label: "天气稳定，通讯也恢复" },
      { id: "b", label: "天气稳定，但通讯仍未恢复" },
      { id: "c", label: "运输队已经按原计划出发" },
      { id: "d", label: "天气和通讯都没有被提及" },
    ],
    hints: ["先写出“按原计划出发”的全部条件。", "只要其中一个必要条件未满足，就进入“否则”。"],
    scoring: { type: "option", correctOptionId: "b" },
    evidenceNote: "判断“否则”覆盖的条件组合。",
  },
  {
    id: "command_reference_03",
    moduleId: "command",
    kind: "single_choice",
    title: "指代追踪",
    stimulus: "陈队长把修订后的路线交给林组长，并请他在会议前通知所有队员。",
    prompt: "句中的“他”最可能指谁？",
    script: "simplified",
    topic: "neutral",
    dimensions: ["segmentation", "logical_relation"],
    options: [
      { id: "a", label: "陈队长" },
      { id: "b", label: "林组长" },
      { id: "c", label: "所有队员" },
      { id: "d", label: "无法从句子判断" },
    ],
    hints: ["看“请”前后两个动作的承接关系。", "路线交给谁，接着就请谁通知队员。"],
    scoring: { type: "option", correctOptionId: "b" },
    evidenceNote: "追踪代词与最近、最合理的行动主体。",
  },
  {
    id: "intel_fact_01",
    moduleId: "intel",
    kind: "single_choice",
    title: "情报甲 · 事实层",
    stimulus: "模拟演练开始后，蓝队没有立即占领中央区域，而是先派两人观察对手的移动。发现红队把大部分成员调往东侧后，蓝队才从西侧推进。虽然行动较迟，却避开了正面冲突。",
    prompt: "蓝队为什么从西侧推进？",
    script: "simplified",
    topic: "familiar",
    dimensions: ["literal_comprehension", "logical_relation"],
    options: [
      { id: "a", label: "西侧距离中央区域最近" },
      { id: "b", label: "红队大部分成员已经移往东侧" },
      { id: "c", label: "蓝队没有足够成员" },
      { id: "d", label: "演练规则要求从西侧进入" },
    ],
    hints: ["找“发现……后”前后的关系。", "蓝队的路线选择是根据红队的移动作出的。"],
    scoring: { type: "option", correctOptionId: "b" },
    evidenceNote: "准确提取行动改变的直接原因。",
  },
  {
    id: "intel_intent_02",
    moduleId: "intel",
    kind: "single_choice",
    title: "情报甲 · 意图层",
    stimulus: "模拟演练开始后，蓝队没有立即占领中央区域，而是先派两人观察对手的移动。发现红队把大部分成员调往东侧后，蓝队才从西侧推进。虽然行动较迟，却避开了正面冲突。",
    prompt: "作者提到“虽然行动较迟”，主要想突出什么？",
    script: "simplified",
    topic: "familiar",
    dimensions: ["implicit_inference", "evidence_expression"],
    options: [
      { id: "a", label: "蓝队行动缓慢，应该受到批评" },
      { id: "b", label: "等待观察虽然花时间，却换来了更安全的路线" },
      { id: "c", label: "红队的移动速度比蓝队快" },
      { id: "d", label: "演练时间安排不合理" },
    ],
    hints: ["留意“虽然……却……”表达的转折。", "作者承认一个代价，同时强调后面的收益。"],
    scoring: { type: "option", correctOptionId: "b" },
    evidenceNote: "利用转折关系推断细节的写作意图。",
  },
  {
    id: "intel_transfer_03",
    moduleId: "intel",
    kind: "single_choice",
    title: "情报乙 · 陌生题材",
    stimulus: "社区原计划把旧街市改建为停车场。访问后，规划小组发现居民并非反对改善交通，而是担心街市消失后，长者会失去日常见面和互相照应的地方。小组于是保留街市中央的公共空间，并把停车位移到地下。",
    prompt: "这段文字最能说明规划小组做对了什么？",
    script: "simplified",
    topic: "unfamiliar",
    dimensions: ["literal_comprehension", "implicit_inference"],
    options: [
      { id: "a", label: "完全放弃改善交通" },
      { id: "b", label: "只听取长者的意见" },
      { id: "c", label: "找到表面反对背后的真正需要" },
      { id: "d", label: "把所有设施都移到地下" },
    ],
    hints: ["比较居民“并非”反对什么，以及真正“担心”什么。", "重点是从表面意见推断背后的需要。"],
    scoring: { type: "option", correctOptionId: "c" },
    evidenceNote: "检测能力能否从熟悉题材迁移到生活社会题材。",
  },
  {
    id: "classical_word_01",
    moduleId: "classical",
    kind: "single_choice",
    title: "古令 · 词义",
    stimulus: "军行失道，众皆欲进。卒有识地势者曰：“前谷雨后必涨，不若少待。”将从之，未几，水暴至，众乃服。",
    prompt: "“将从之”的“从”最接近哪个意思？",
    instruction: "不需要背诵篇章，可利用上下文推断。",
    script: "traditional",
    topic: "familiar",
    dimensions: ["segmentation", "literal_comprehension"],
    options: [
      { id: "a", label: "跟随他的队伍" },
      { id: "b", label: "听从他的建议" },
      { id: "c", label: "从山谷离开" },
      { id: "d", label: "追问事情原因" },
    ],
    hints: ["“之”指向前面那名士卒所说的话。", "将领接下来没有前进，说明他接受了建议。"],
    scoring: { type: "option", correctOptionId: "b" },
    evidenceNote: "利用后文结果推断陌生文言词义。",
  },
  {
    id: "classical_cause_02",
    moduleId: "classical",
    kind: "single_choice",
    title: "古令 · 因果",
    stimulus: "军行失道，众皆欲进。卒有识地势者曰：“前谷雨后必涨，不若少待。”将从之，未几，水暴至，众乃服。",
    prompt: "众人最后为什么信服？",
    script: "traditional",
    topic: "familiar",
    dimensions: ["logical_relation", "implicit_inference"],
    options: [
      { id: "a", label: "将领命令众人信服" },
      { id: "b", label: "士卒熟悉每一条道路" },
      { id: "c", label: "暴涨的水证明士卒判断正确" },
      { id: "d", label: "众人终于找到原来的道路" },
    ],
    hints: ["留意“未几”之后发生的事。", "后来的事实验证了谁先前的判断？"],
    scoring: { type: "option", correctOptionId: "c" },
    evidenceNote: "跨越省略成分，连接预测、事实与态度变化。",
  },
  {
    id: "classical_claim_03",
    moduleId: "classical",
    kind: "short_text",
    title: "古令 · 核心主张",
    stimulus: "军行失道，众皆欲进。卒有识地势者曰：“前谷雨后必涨，不若少待。”将从之，未几，水暴至，众乃服。",
    prompt: "用现代汉语写出这则故事给人的一个启示。（20—50字）",
    instruction: "建议用“结论＋故事证据”作答。",
    script: "traditional",
    topic: "neutral",
    dimensions: ["implicit_inference", "evidence_expression", "structural_expression"],
    hints: ["想一想：将领为什么没有跟随多数人的意见？", "可从“听取有根据的意见”或“行动前判断风险”展开，并带上故事证据。"],
    scoring: {
      type: "keywords",
      keywords: ["听取", "意见", "判断", "风险", "经验", "证据", "等待", "水涨", "多数"],
      minimumMatches: 2,
    },
    evidenceNote: "开放答案仅做规则初筛，后续由人工或 AI 按结论、证据、关系解释复核。",
  },
];

export const DSE_DIAGNOSTIC_V1 = {
  templateKey: DSE_DIAGNOSTIC_TEMPLATE_KEY,
  title: "DSE中文 · 情报侦察站",
  version: 1,
  session: 1,
  description: "第一场：信息侦察。定位语音、切分、逻辑、推断与文言理解的首个掉速点。",
  modules: DSE_DIAGNOSTIC_MODULES,
  questions: DSE_DIAGNOSTIC_QUESTIONS,
};

export type PublicDiagnosticQuestion = Omit<DiagnosticQuestion, "scoring" | "evidenceNote">;

export function getPublicDiagnosticBank() {
  return {
    ...DSE_DIAGNOSTIC_V1,
    questions: DSE_DIAGNOSTIC_QUESTIONS.map(({ scoring: _scoring, evidenceNote: _evidenceNote, ...question }) => question),
  };
}
