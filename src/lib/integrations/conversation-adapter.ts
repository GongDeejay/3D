/**
 * 预留：与未来「对话式 AI」打通。
 * 实现类可放在服务端，通过 HTTP 调用你已有的对话服务；此处仅定义契约。
 */

export type InteractiveStep =
  | { type: "message"; role: "assistant" | "user"; content: string }
  | { type: "choice"; prompt: string; options: { id: string; label: string }[] };

export interface ConversationAdapter {
  /** 根据测评薄弱维度生成互动教学单元（后续可接真实模型） */
  generateInteractiveUnit(input: {
    userId: string;
    weakAreas: { dimension: string; evidence: string[] }[];
    locale: string;
  }): Promise<{ unitId: string; steps: InteractiveStep[] }>;
}

export class StubConversationAdapter implements ConversationAdapter {
  async generateInteractiveUnit(): Promise<{ unitId: string; steps: InteractiveStep[] }> {
    return {
      unitId: "stub",
      steps: [
        {
          type: "message",
          role: "assistant",
          content: "（占位）后续将接入你的对话 AI，根据测评结果生成分步互动题。",
        },
      ],
    };
  }
}
