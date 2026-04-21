import { z } from "zod";

import type { BankQuestion } from "@/lib/question-bank/interaction-literacy-v1";
import { INTERACTION_LITERACY_V1 } from "@/lib/question-bank/interaction-literacy-v1";

export function buildAnswersSchema(templateKey: string): z.ZodObject<Record<string, z.ZodTypeAny>> {
  if (templateKey !== INTERACTION_LITERACY_V1.templateKey) {
    return z.object({});
  }
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const q of INTERACTION_LITERACY_V1.questions as BankQuestion[]) {
    if (q.kind === "likert") {
      shape[q.id] = z.number().int().min(1).max(5);
    } else {
      const ids = q.options.map((o) => o.id) as [string, ...string[]];
      shape[q.id] = z.enum(ids);
    }
  }
  return z.object(shape);
}
