import Link from "next/link";

import { getNextStepAfterTemplate } from "@/lib/ladder";
import { prisma } from "@/lib/prisma";
import { getPublicOrigin } from "@/lib/public-url";
import { rateIndividualAnswers } from "@/lib/user-rating";

export default async function SurveyDonePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ rid?: string }>;
}) {
  const { slug } = await params;
  const { rid } = await searchParams;

  if (!rid) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">感谢填写</h1>
        <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
          你的回答已记录。若需查看个人评级，请从填写完成后的页面进入（含本次提交编号）。
        </p>
        <Link href={`/s/${slug}`} className="mt-8 text-sm text-zinc-500 hover:text-zinc-800">
          返回问卷页
        </Link>
      </main>
    );
  }

  const row = await prisma.surveyResponse.findUnique({
    where: { id: rid },
    include: { distribution: true },
  });

  if (!row || row.distribution.slug !== slug) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-lg font-semibold text-zinc-900">无法展示本次结果</h1>
        <p className="mt-2 text-sm text-zinc-600">链接不完整或已失效，请向组织者索取带编号的完成页链接。</p>
        <Link href="/" className="mt-8 inline-block text-sm text-zinc-600 underline">
          返回首页
        </Link>
      </main>
    );
  }

  const answers = row.answers as Record<string, unknown>;
  const rating = rateIndividualAnswers(row.distribution.templateKey, answers);
  const nextStep = getNextStepAfterTemplate(row.distribution.templateKey);
  const origin = await getPublicOrigin();

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-center text-2xl font-semibold text-zinc-900">你的本次结果</h1>
      <p className="mt-2 text-center text-sm text-zinc-500">基于本次作答即时计算，仅供自评参考。</p>

      {rating ? (
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-100 pb-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">综合评级</p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-zinc-900">{rating.score100}</p>
              <p className="text-sm text-zinc-600">分</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-1.5 text-lg font-semibold text-white">
                {rating.letter}
              </span>
              <p className="mt-2 text-sm font-medium text-zinc-800">{rating.band}</p>
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-zinc-700">{rating.summary}</p>
          {rating.likertMean != null ? (
            <p className="mt-3 text-xs text-zinc-500">
              李克特均分 {rating.likertMean.toFixed(2)} / 5 · 情景题 {rating.scenarioScore} /{" "}
              {rating.scenarioMax}
            </p>
          ) : null}
          <ul className="mt-6 space-y-2 text-sm text-zinc-700">
            {rating.tips.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-zinc-400">·</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-8 text-center text-sm text-zinc-600">暂无法计算该题库版本的评级。</p>
      )}

      <div className="mt-10">
        <p className="text-sm font-medium text-zinc-900">下一步，你想做什么？</p>
        <div className="mt-4 space-y-3">
          <Link
            href="/resources/prompt-basics"
            className="block rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            <p className="font-medium text-zinc-900">巩固本阶梯：提示词小抄</p>
            <p className="mt-1 text-sm text-zinc-600">适合任意得分，3 分钟可读完。</p>
          </Link>

          {nextStep ? (
            <Link
              href={`/ladder/${nextStep.slug}`}
              className="block rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 transition hover:bg-emerald-50"
            >
              <p className="font-medium text-emerald-950">
                下一阶梯：{nextStep.title}
                {!nextStep.available ? "（筹备中）" : ""}
              </p>
              <p className="mt-1 text-sm text-emerald-900/80">{nextStep.short}</p>
              {!nextStep.available ? (
                <p className="mt-2 text-xs text-emerald-800/90">可先收藏路线图，上线后从「能力阶梯」进入。</p>
              ) : null}
            </Link>
          ) : null}

          <Link
            href="/ladder"
            className="block rounded-xl border border-zinc-200 bg-white p-4 text-center text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            查看完整能力阶梯与路线说明
          </Link>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-zinc-400">
        若需再次填写，请使用组织者提供的链接：{origin}/s/{slug}
      </p>
    </main>
  );
}
