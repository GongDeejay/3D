import type { Metadata } from "next";

import { DiagnosticRunner } from "@/app/diagnostic/diagnostic-runner";
import { getPublicDiagnosticBank } from "@/lib/question-bank/dse-chinese-diagnostic-v1";

export const metadata: Metadata = {
  title: "第一场：信息侦察 | DSE中文情报侦察站",
  description: "完成语音编码、词句切分、逻辑关系、阅读推断与文言基础诊断。",
};

export default function DiagnosticPage() {
  return <DiagnosticRunner bank={getPublicDiagnosticBank()} />;
}
