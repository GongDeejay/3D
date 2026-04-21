import Link from "next/link";
import { notFound } from "next/navigation";

import { submitSurveyAction } from "@/app/s/[slug]/actions";
import {
  INTERACTION_LITERACY_V1,
  likertLabels,
} from "@/lib/question-bank/interaction-literacy-v1";
import { prisma } from "@/lib/prisma";

export default async function SurveyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const dist = await prisma.surveyDistribution.findUnique({ where: { slug } });
  if (!dist) notFound();

  const bank =
    dist.templateKey === INTERACTION_LITERACY_V1.templateKey ? INTERACTION_LITERACY_V1 : null;
  if (!bank) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p>暂不支持该题库版本。</p>
        <Link href="/" className="mt-4 inline-block text-sm text-zinc-600 underline">
          返回首页
        </Link>
      </main>
    );
  }

  const boundSubmit = submitSurveyAction.bind(null, slug);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{bank.title}</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{dist.title}</h1>
      <p className="mt-2 text-sm text-zinc-600">{dist.scenarioSummary}</p>
      {dist.scenarioDetail ? (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs font-medium text-zinc-500">本次填写场景</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
            {dist.scenarioDetail}
          </p>
        </div>
      ) : null}

      <p className="mt-6 text-sm text-zinc-600 leading-relaxed">{bank.description}</p>

      {sp.error === "invalid" ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          请完成所有题目后再提交。
        </p>
      ) : null}

      <form action={boundSubmit} className="mt-10 space-y-10">
        {bank.questions.map((q, idx) => (
          <fieldset key={q.id} className="space-y-3">
            <legend className="text-sm font-medium text-zinc-900">
              {idx + 1}. {q.text}
            </legend>
            {q.kind === "likert" ? (
              <div className="space-y-2">
                {likertLabels.map((label, i) => {
                  const value = i + 1;
                  return (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2 hover:bg-zinc-50"
                    >
                      <input type="radio" name={q.id} value={String(value)} required className="h-4 w-4" />
                      <span className="text-sm text-zinc-800">
                        {value}. {label}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 px-3 py-2 hover:bg-zinc-50"
                  >
                    <input type="radio" name={q.id} value={opt.id} required className="mt-1 h-4 w-4" />
                    <span className="text-sm text-zinc-800">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>
        ))}

        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          提交
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-zinc-400">
        本问卷为自评工具，不构成专业测评结论。
      </p>
    </main>
  );
}
