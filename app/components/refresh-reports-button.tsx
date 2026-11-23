"use client";

import { useTransition } from "react";
import { refreshReportsData } from "@/app/(shell)/relatorios/actions";

export function RefreshReportsButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await refreshReportsData();
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`}
      >
        <path
          d="M13.5 8A5.5 5.5 0 1 1 8 2.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M8 1v3l2-1.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {pending ? "Atualizando…" : "Atualizar"}
    </button>
  );
}
