"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteDistributionAction } from "@/app/admin/distributions/actions";

export function DeleteDistributionButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function remove() {
    if (!window.confirm(`确定删除“${title}”吗？该发放下的所有作答与诊断记录也会被删除，且无法恢复。`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteDistributionAction(id);
      if (result.ok) router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={isPending}
      className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
    >
      {isPending ? "删除中…" : "删除"}
    </button>
  );
}
